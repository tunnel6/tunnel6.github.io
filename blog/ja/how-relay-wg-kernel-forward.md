---
title: "WireGuard relay 転送 その1: カーネル ip_forward と nftables forward チェーン"
date: 2026-11-23
author: YAT Team
description: "relay ノード上の中間ホップ。ip_forward、rp_filter、netfilter FORWARD hook、そして nftables チェーン宣言が重要な理由を説明します。"
excerpt: "relay は A のパケットを復号し、B 向けに再暗号化します。どちらもカーネル WireGuard が行います。設計上の問題は、Linux があるインターフェースで受け取ったパケットを同じインターフェースから出せるかどうかです。"
tags:
  - WireGuard
  - Relay
  - Linux カーネル
  - nftables
publish: true
layout: doc
sidebar: true
aside: false
pageClass: blog-post
---

このネットワークにはメンバー A（`10.24.0.2`）と B（`10.24.0.3`）がいます。両方は異なる NAT の配下にあり、直接接続できません。そのため、relay（`10.24.0.1`）を peer として設定します。A の暗号化パケットが relay の UDP ポートに届くと、カーネル WireGuard は通常の IPv4 パケットを取り出します。

```
src = 10.24.0.2    dst = 10.24.0.3    入力インターフェース = wg-yat0-xxx
```

`10.24.0.3` も `wg-yat0-xxx` 上にあります。問いはこうなります。**Linux は、あるインターフェースで受け取ったパケットを、同じインターフェースから送り出せるか。**

答えは「三つの条件を満たせば yes」です。最初の二つはカーネルスイッチ、三つ目はファイアウォールの許可であり、設計が必要な部分です。この経路で Edge は個々のパケットに触れません。forwarder の起動時に三つの条件を整えるだけです。

この記事では WireGuard の peer と `AllowedIPs` を知っている前提で書きます。netfilter プログラミングの経験は不要です。

## データパス: 復号一回と暗号化一回

まず、パケットに何が起こるかを固定します。この部分は転送方式に依存せず、relay の本当のコストです。

WireGuard データパケットの構造は次のとおりです。

```
外側 IP ヘッダー（relay アドレス ↔ メンバーアドレス）
  └ 外側 UDP ヘッダー（relay ポート 58021 ↔ メンバーの NAT 変換後ポート）
      └ WireGuard データメッセージ: 16 バイトヘッダー + 暗号文 + Poly1305 tag(16)
            └ 平文 IPv4 パケット（Ethernet ヘッダーなし。IP ヘッダーがそのまま現れる）
```

relay への到着から送信までには三つの段階があります。

1. **デカプセル化。** カーネルは receiver index でローカルセッションを特定し、そのセッション鍵で復号し、Poly1305 tag を検証し、counter の再生を拒否します。その後、内側の IP パケットを `wg-yat0-xxx` で受信したものとして上位へ渡します。
2. **転送判定。** 内側の宛先はローカルではないため、パケットは転送へ入ります。この段階で変わるのは TTL と、それに対応する IPv4 checksum だけです。`src` と `dst` は変わりません。
3. **再カプセル化。** `wg_xmit()` は peer の `AllowedIPs` で B を選び、B との独立したセッション鍵で暗号化し、新しい counter と tag を付けて外側 UDP/IP ヘッダーを追加します。送信元ポートは 58021 のままです。宛先は B の現在学習済み endpoint です。

二つの帰結を明示します。

第一に、A と B の間に**エンドツーエンドの暗号セッションはありません**。relay と A、relay と B の独立したセッションがあり、relay は第 1 段階で復号し、第 3 段階で暗号化します。これは WireGuard の構造からくるもので、relay を制御する者はその間の平文を見られます。

第二に、コストの主体は暗号化であり、転送ではありません。WireGuard データメッセージは平文 IP パケットに 32 バイト追加します。16 バイトのデータメッセージヘッダーと 16 バイトの Poly1305 tag です。UDP 8 バイトと IPv4 20 バイトを合わせると、回線上の追加は 60 バイトです。relay はパケットごとに ChaCha20-Poly1305 を二回実行します。したがって、どの転送方式でも共通の原則は「パケットをユーザー空間に運ばない」ことです。中間段階がルートを見るかハッシュテーブルを見るかは二次的な問題です。[その2](./how-relay-wg-ebpf-forward.md)は同じパケットを redirect し、デカプセル化と暗号化は変えません。

この記事は第 2 段階だけを扱います。

## カーネルパス

```
UDP 58021 が暗号文を受信
  └─ デカプセル化（第1段階）→ 平文がリンク層受信として IP 層へ入る
       ip_rcv()
         └─ ip_rcv_finish()
              ├─ ip_route_input()
              │    ├─ 宛先へのルート検索
              │    └─ fib_validate_source() ← rp_filter はここで作用する
              ├─ ローカル宛先 → ローカルソケットへ配送
              └─ 非ローカル宛先 → ip_forward()
                   ├─ TTL > 1。1 減らし、checksum を更新
                   ├─ NF_INET_FORWARD ← ファイアウォールはここで作用する
                   └─ ip_output() → dev_queue_xmit()
                        └─ 出力 qdisc → wg_xmit() ← 再暗号化: AllowedIPs が B を選ぶ
```

三つの条件は図の三点に対応します。カーネルが転送すること（`ip_forward`）、逆方向経路検査で送信元を拒否しないこと（`rp_filter`）、ファイアウォールが許可すること（FORWARD チェーン）です。

## 条件1: ip_forward を有効にする

`net.ipv4.ip_forward` が 0 のとき、ローカルでないパケットは `ip_rcv` の後で破棄され、転送へ入りません。多くの cloud image では無効です。

[Edge](/guide/edge/#what-is-edge) は forwarder 起動時に `1` を書き込みます。書き込みに失敗した場合は起動を失敗させます。パケットが転送へ入らないなら、残りの設定を準備しても意味がないためです。

```bash
sysctl net.ipv4.ip_forward          # 期待値: 1
```

調査には次のコマンドが役立ちます。

```bash
nstat -az | grep -E '^Ip(InReceives|ForwDatagrams)'
```

`IpInReceives` が増え、`IpForwDatagrams` が増えない場合、パケットは転送パスに届いていません。問題は FORWARD の手前にあります。通常は `ip_forward` かルーティングであり、ファイアウォールではありません。

## 条件2: rp_filter を無効にする

reverse path filtering は anti-spoofing 検査です。カーネルは**送信元アドレス**でルート検索を行います。その送信元への最適経路が入力インターフェースでなければ、偽装パケットと判断して破棄します。

二つのキーが関係し、カーネルは大きい方の値を使います。

```
net.ipv4.conf.all.rp_filter
net.ipv4.conf.wg-yat0-xxx.rp_filter
```

片方だけ変えても十分ではありません。`0` は無効、`1` は strict（最適経路が入力インターフェースであること）、`2` は loose（任意の経路があればよい）です。

relay トラフィックはこの検査に引っかかりやすくなります。メンバーのサブネットは複数経路から到達できることがあるためです。別のトンネルが同じ範囲を持つ、ホストに複数インターフェースがある、直接接続済みのメンバーが別経路で到達できる、といった場合です。strict モードではこれらのパケットを破棄します。loose モードは多くの場合通りますが、A が実際にどのルートを通るかまで考える必要があり、調査が難しくなります。Edge は両方を 0 にします。書き込み失敗は警告として記録し、起動は止めません。

`accept_local` は、送信元がホスト自身のアドレス集合に属するパケットを扱う独立した検査です。有効にしても `rp_filter` を無効化した代わりにはなりません。

## 条件3: FORWARD チェーン

最初の二つはカーネルの判断です。三つ目はファイアウォールです。Linux の netfilter には古い `iptables` と新しい `nftables` の二つのユーザー空間インターフェースがあります。ここでは nftables の三つの概念が重要です。

netfilter は固定の hook を公開しています。転送用は `NF_INET_FORWARD` です。同じ hook には複数のチェーンを付けられ、優先度が小さい順に実行されます。nftables では次のとおりです。

- **table**: 名前空間であり、ファミリー（`ip`、`ip6`、`inet`、`bridge`）も選びます。table を削除すると中身も消えます。
- **chain**: `type`、接続先 `hook`、`priority`、どのルールにも一致しないときの `policy` を宣言します。
- **rule**: 条件式と verdict（`accept`、`drop`、`continue` など）です。

[Edge](/guide/edge/#what-is-edge) は次のようなチェーンを入れます。

```nft
table ip yat_relay {
  chain forward {
    type filter hook forward priority mangle; policy accept;
    iifname "wg-yat0-xxx" oifname "wg-yat0-xxx" ip daddr 10.24.0.0/24 accept
  }
}
```

宣言を読み解きます。

`type filter hook forward` は、上に示した `NF_INET_FORWARD` hook にチェーンを登録します。

`priority mangle`（`-150`）は、`conntrack`（`-200`）の後、よく使われる filter チェーン（`0`）の前に置きます。ただし、nftables の `accept` は現在の base chain の評価を終えるだけです。同じ hook の後続チェーンがパケットを見るのを止めません。即時に止めるのは `drop` です。したがって、このチェーンは Docker、`ufw`、`firewalld` など後から入る規則を上書きしません。relay トラフィックを自分のチェーン内で accept しても、後続の FORWARD 規則が拒否できます。

Docker の `DOCKER-USER` は通常、iptables の `FORWARD` チェーン内にあります。同じ条件を `iptables -I FORWARD ...` で手前に挿入すれば、そのチェーン内の Docker 規則より先に評価されます。ただし、独立した nftables テーブルが後で drop すれば、やはり破棄されます。hook と priority の詳細は [Netfilter ドキュメント](https://wiki.nftables.org/wiki-nftables/index.php/Netfilter_hooks)を参照してください。
![netfilter](/blog/images/nf-hooks.png)

`conntrack`（`-200`）は先に実行されるため、カーネル転送のトラフィックは記録されます。`conntrack -E` やステートフルなファイアウォール規則からフローが見えます。これは[その2](./how-relay-wg-ebpf-forward.md)とは逆で、両者の重要な差異の一つです。

`policy accept`: 一致する規則がないとき、このチェーンは accept を返します。関係しない転送を意図的に判定せず、後続の base chain は引き続き評価します。

`iifname "wg-yat0-xxx" oifname "wg-yat0-xxx"` は、入力と出力が同じ relay インターフェースであることを要求します。二つを並べることで「同一インターフェース転送」を正確に表します。

`ip daddr 10.24.0.0/24` は、このネットワーク内の宛先だけを許可します。relay は他の範囲の転送を判断しません。

一つの Edge に複数ネットワークがあると、同じ table に複数規則が入ります。Edge は rule handle を保存し、まず handle で削除します。handle が古くなった場合は、チェーンを走査してインターフェース、ネットワーク、verdict で探します。規則には内部の `UserData`（`yat-relay:<インターフェース>`）もありますが、これは `nft list` が表示する通常の comment ではなく、現在の削除処理も依存していません。

## iptables

`iptables` は同じカーネルファイアウォールを操作します。同じ効果は次のようにも書けます。

```bash
# インストール（上の nft 規則と同等）
iptables -I FORWARD -i wg-yat0-xxx -o wg-yat0-xxx -d 10.24.0.0/24 -j ACCEPT

# 削除
iptables -D FORWARD -i wg-yat0-xxx -o wg-yat0-xxx -d 10.24.0.0/24 -j ACCEPT
```

注意点:

- **`-A` ではなく `-I` を使う。** Docker は `FORWARD` の手前に `DOCKER-USER` jump を置くことが多く、末尾に追加した規則は実行されないことがあります。iptables が制御できるのはチェーン内の順序です。
- **まず backend を確認する。** `iptables -V` の括弧は `nf_tables` か `legacy` を示します。`nf_tables` backend は規則を iptables 互換層に置きます。既存の `FORWARD` 規則より手前に挿入すれば、同じチェーン内の Docker 規則より先に評価されます。`legacy` backend は独立した `x_tables` 経路を使い、`nft list ruleset` には見えません。そのようなホストでは、このトラフィックを許可するために iptables fallback が必要です。Edge は backend を区別せず入れ、失敗した場合は起動を止めず警告を記録します。
- **削除には規則全文を繰り返す。** `-D` は一致する規則を一回に一つだけ削除します。再起動を繰り返すと重複が残ることがあるため、Edge は「存在しない」というエラーになるまで `-D` を繰り返します。

## 関連記事

- [拠点間接続に Edge を WireGuard peer relay として使う理由](./how-relay-wg.md)
- [WireGuard relay 転送 その2: eBPF による TC ingress でのパケット redirect](./how-relay-wg-ebpf-forward.md)
- [Edge WireGuard 設定](/guide/edge/wireguard)

## 参考

- [nftables Wiki: Netfilter hooks](https://wiki.nftables.org/wiki-nftables/index.php/Netfilter_hooks) — hook と priority の一次情報
- [Linux kernel docs: ip-sysctl](https://www.kernel.org/doc/Documentation/networking/ip-sysctl.txt) — `ip_forward`、`rp_filter`、`accept_local` の定義
- [WireGuard: Whitelisting](https://www.wireguard.com/whitelisting/) — AllowedIPs のルーティング上の意味
