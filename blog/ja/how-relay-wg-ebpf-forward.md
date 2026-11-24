---
title: "WireGuard relay 転送 その2: eBPF による TC ingress でのパケット redirect"
date: 2026-11-24
author: YAT Team
description: "relay ノード上の eBPF 転送実装。TC と clsact、bpf_redirect の flags を 0 にする理由、この経路が迂回する対象と追加される前提を説明します。"
excerpt: "eBPF 転送は relay の判定を TC ingress プログラム内に置き、他のソフトウェアが書き換えられる FORWARD チェーンに依存しません。代償はより高い権限、狭いプロトコル対応、難しい障害調査です。"
tags:
  - WireGuard
  - Relay
  - eBPF
  - Linux カーネル
publish: true
layout: doc
sidebar: true
aside: false
pageClass: blog-post
---

[その1](./how-relay-wg-kernel-forward.md)はカーネルに転送させます。`ip_forward` を有効にし、`rp_filter` を無効にし、nftables の forward チェーンで許可します。この記事は別の経路を扱います。プロトコルスタックに入る前の段階でパケットを捉え、インターフェースの出力方向へ直接戻します。

経路は次のとおりです。

```
UDP 58021 が暗号文を受信 → デカプセル化（カーネル WireGuard が復号）
                         → 平文パケットがインターフェースの TC ingress へ到達
                                                          │ ここに BPF プログラムを接続
                                                          │ bpf_redirect(ifindex, 0)
                                                          ▼
                                インターフェースの出力 qdisc → wg_xmit()
                                → 再暗号化（カーネル WireGuard）→ B
```

このパケットはルーティングテーブルを参照せず、netfilter の FORWARD hook に入らず、conntrack に入らず、カーネルから出ません。

まず範囲を固定します。[その1](./how-relay-wg-kernel-forward.md)は relay 上の処理をデカプセル化、転送、再カプセル化に分けました。この経路が置き換えるのは転送だけです。カーネル WireGuard は A のセッション鍵での復号、tag と counter の検証、B のセッション鍵での暗号化を今までどおり行います。`bpf_redirect` が送出した後も、パケットは同じ `wg_xmit()` を通ります。

相違点は、転送の判定がどこにあるかです。カーネル経路は一つのグローバルスイッチ、二つの `rp_filter`、共有 FORWARD hook に依存します。これらはマシン全体の状態です。Docker がコンテナを再起動する、`ufw reload` を実行する、セキュリティエージェントが規則を更新する、といった操作で知らないうちに変わることがあります。eBPF 経路は判定を自分のプログラムに書き込みます。グローバルスイッチを読まず、FORWARD hook も通りません。

TC と qdisc の概要だけ分かれば読めます。次の節で定義します。

## 三つの概念: TC、clsact、SchedCLS

**TC（Traffic Control）** は Linux のデバイス送受信フレームワークです。各デバイスにはキューツリーがあります。出力方向では root qdisc がキューイングを決め、帯域制限はここに付けます。入力方向は既定ではほとんど処理しません。

**clsact** は特別な qdisc で、役割は `ingress` と `egress` という分類器の接続点を提供することだけです。handle は常に `ffff:0` であり、出力方向の root qdisc と衝突しません。したがって、ingress の BPF プログラムと egress の HTB 帯域制限は共存できます。ingress に何かを付ける前に clsact が必要です。

**`BPF_PROG_TYPE_SCHED_CLS`**（Go では `ebpf.SchedCLS`）はこの接続点で動くプログラム型です。入力は `__sk_buff`、戻り値は TC action です。

| 戻り値 | 意味 |
|---|---|
| `TC_ACT_OK` (0) | 通常のパケット処理を続ける |
| `TC_ACT_SHOT` (2) | 破棄する |
| `TC_ACT_REDIRECT` (7) | `bpf_redirect` によって別の場所へ送出済み |

DirectAction モードでは、プログラムの戻り値がそのまま TC verdict になります。そうでなければ戻り値は分類結果にすぎず、filter に設定された police や classid が次の処理を決めます。Edge は DirectAction を使います。

`bpf_redirect(ifindex, flags)` はパケットを指定デバイスの送信パスへ送出し、`TC_ACT_REDIRECT` を返します。引数の意味は後述します。

## 接続

```
Start():
  link = netlink.LinkByName(ifName)
  link.Type() != "wireguard"            → エラー。他の種類を推測しない
  cfg.IfIndex = link.Attrs().Index      ← すべてのパケット判定で使う
  cfg.MTU     = link.Attrs().MTU

  statsMap = ebpf.NewMap(...)           送信元アドレスをキーにした HashMap
  prog     = ebpf.NewProgram(...)       verifier が通ったときだけ読み込まれる

  QdiscAdd(clsact)                      EEXIST は再利用。他のエラーは中断
  FilterAdd(BpfFilter{
      Parent: HANDLE_MIN_INGRESS, Priority: 1, Handle: 1,
      Protocol: ETH_P_ALL, DirectAction: true, Name: "yat_redirect",
  })                                    CREATE|EXCL: 占用されていれば失敗し、既存 filter を置き換えない

Stop():
  FilterDel → prog.Close → map.Close
```

重要な細部が三つあります。

**インターフェース種別を確認する。** この論理は WireGuard だけで成立します。ingress は復号済みの平文 IP、egress は暗号化前の平文 IP です。他のデバイスでは意味が異なります。

**netlink の ack を待つ。** qdisc と filter の変更は確認付きリクエストで行います。non-blocking 受信では、`Recvfrom` が `EAGAIN` を成功として扱い、実は規則が入っていない状態を隠すことがあります。この種の障害は非常に見つけにくいです。

**優先度は 100 ではなく 1。** 同じ hook の filter は小さい順に実行します。転送プログラムが 1、独立した計数プログラムが 10 です。まず判定し、次に計数します。カーネル転送は自分で数えないため、eBPF の転送プログラムが数えます。

## プログラム内の判定

プログラムにはループもパケット時点のテーブル参照もありません。ネットワーク、マスク、relay アドレス、インターフェース番号、MTU は読み込み時に即値として書き込まれます。「スタックへ返す」は `TC_ACT_OK` を返すことです。

| 順序 | 判定 | 失敗時 |
|---|---|---|
| 1 | 先頭 20 バイトを読めるか | スタックへ返す |
| 2 | 先頭バイトは `0x45` か（IPv4、オプションなし） | スタックへ返す |
| 3 | 送信元と宛先が同じネットワーク内か | スタックへ返す |
| 4 | 宛先は relay 自身か | スタックへ返す（relay 宛のトラフィック） |
| 5 | multicast、broadcast、network address か。`/31` と `/32` は network address 検査を省略 | スタックへ返す |
| 6 | TTL がすでに ≤ 1 か | スタックへ返す（ICMP time exceeded はスタックに任せる） |
| 7 | ヘッダー < 20、または総長 > `skb->len` | 破棄 |
| 8 | 総長 ≠ `skb->len`（padding）、または > MTU | スタックへ返す |
| 9 | IPv4 checksum を ones-complement で検証 | 破棄 |
| 10 | TTL を減らし、checksum を更新、`bpf_redirect(ifindex, 0)`、送信元ごとの計数を更新 | — |

同等の擬似コードは次のとおりです。

```
data     = skb->data          // __sk_buff offset 76
data_end = skb->data_end      // __sk_buff offset 80
if data + 20 > data_end { return TC_ACT_OK }

version_ihl = *data                       // 0x45 であること: IPv4、20 バイトヘッダー
                                          // デカプセル化後なので Ethernet ヘッダーはない
src = ntohl(*(u32*)(data + 12))
dst = ntohl(*(u32*)(data + 16))
if (src & NETMASK) != NETWORK { return TC_ACT_OK }
if (dst & NETMASK) != NETWORK { return TC_ACT_OK }
if dst == RELAY_IP || dst >= 224.0.0.0 { return TC_ACT_OK }
if data[8] <= 1 { return TC_ACT_OK }

totlen = ntohs(*(u16*)(data + 2))
if totlen < 20 || totlen > skb->len { return TC_ACT_SHOT }
if totlen != skb->len || totlen > MTU { return TC_ACT_OK }

if ones_complement_sum(data[0..20]) != 0xffff { return TC_ACT_SHOT }

data[8] -= 1                              // ip_decrease_ttl() に相当
data[10..12] += 0x100 を 16 ビットへ折り畳み // checksum の増分更新
return bpf_redirect(IFINDEX, 0)
```

見落としやすい点が三つあります。

**ヘッダー checksum を検証する。** 通常は `ip_rcv` が行います。この経路はその入口を迂回するため、無効なヘッダーがそのまま B まで届き、そこで拒否される可能性があります。「転送しているように見えるがつながらない」という症状になります。

**TTL を減らし、checksum を更新する。** relay は router です。TTL を減らさないとループが続くことがあります。checksum を合わせないと B は無効なパケットを受け取ります。変わるのは TTL の 1 バイトだけなので、checksum 全体を再計算せず増分更新できます。

**境界検査を繰り返す。** BPF verifier は未検査のポインター移動を拒否します。`data` と `data_end` は `__sk_buff` の固定 offset（76 と 80）です。`skb->len` は offset 0 にあり、nonlinear data も含みます。

## bpf_redirect の第 2 引数は 0 でなければならない

`flags = 0` は対象デバイスの**出力**へ送ります。`dev_queue_xmit`、出力 qdisc、`ndo_start_xmit` の順です。WireGuard なら `wg_xmit` であり、意図した経路そのものです。

`flags = BPF_F_INGRESS` は対象デバイスの**入力**へ送ります。対象は同じインターフェースなので、パケットはこのプログラムへ戻り、ループします。

一見良さそうな別の方法が二つありますが、どちらも誤りです。

- **`bpf_redirect_peer`**: 対象が別の network namespace にある peer device であることを前提とします。典型的なのは veth の両端です。WireGuard インターフェースの両側は同じ netns 内にあるため、該当する peer はありません。戻り値の確認も必要であり、送出に成功しても、WireGuard の送信や相手の受信まで保証しません。
- **`bpf_clone_redirect`**: パケットを複製し、元のパケットはスタックを続行させます。必要なのは TTL と checksum を変更済みの一つのパケットを別経路へ出すことであり、複製は余計な作業です。

結論として `bpf_redirect(ifindex, 0)` を選び、簿記はプログラム自身が行います。

## 何を迂回し、何が代償になるか

両方の経路を並べると次のとおりです。

```
カーネル経路: 復号 → ip_rcv → ルーティングと rp_filter → ip_forward
              → FORWARD(nftables) → ip_output → qdisc → wg_xmit
eBPF 経路:    復号 → TC ingress → bpf_redirect → qdisc → wg_xmit
```

eBPF は `ip_forward`、`rp_filter`、ルート検索、FORWARD を避けます。Docker、`ufw`、`firewalld`、セキュリティエージェントが FORWARD を変更しても、この一致したトラフィックには影響しません。削減できるプロトコルスタック処理は WireGuard の暗号化に比べれば小さく、より重要な利点は依存境界が狭くなることです。

観測性の代償として、netfilter ベースのツールはこの経路を見られません。

- `nft list table ip yat_relay`: カーネル経路専用です。eBPF ではこのテーブルは存在せず、正常です。
- `conntrack -E`: eBPF 転送は connection tracking entry を作りません。
- netfilter ベースの流量計測や警告はこのトラフィックを数えられません。
- `tc -s filter show dev <インターフェース> ingress` は filter が動いている証拠にはなりますが、分岐ごとの計数がないため、特定パケットの redirect を証明するには不十分です。

プログラムが引き受けるのは、条件を満たしたトラフィックだけです。IPv6、IPv4 options、fragment、ネットワーク外の宛先はスタックへ返します。それらの転送が必要なら、その1のカーネル経路を使います。`ebpf` を選んでもホストが `ip_forward` を不要にするわけではありません。relay の主要経路がそれに依存しなくなるだけです。

メンバーごとの統計にはもう一つ問題があります。redirect 後、転送プログラムは既存の key を探すだけで、作成しません。現在の実装では、他のコードが key を事前作成することもありません。したがって、この送信元アドレスの hash map は空のままになり、Edge が集計する `Forwarded` も使えません。転送を確認するには、メンバー B で接続を試し、`wg show wg-yat0-xxx transfer` を確認してください。

## 前提と制限

- root に加えて `CAP_BPF` と `CAP_NET_ADMIN` が必要です。カーネル経路より多く、少なくはありません。
- 最低カーネルは 5.8 です。`CAP_BPF` は 5.8 で `CAP_SYS_ADMIN` から分離されました。
- `go build -tags ebpf` でビルドします。既定ビルドにはこのコードが含まれません。`ebpf` を設定すると静黙 fallback ではなく "unavailable" を返します。
- 扱うのは option を持たない IPv4 だけです。fragment と multicast は引き受けず、ICMP error も生成しません。
- 命令は Go の `cilium/ebpf/asm` で生成します。clang/LLVM も事前ビルド済み `.o` も不要です。代償として、コードはアセンブリに近く、変更は verifier の規則を意識する必要があります。
- 帯域制限とは衝突しません。HTB は root qdisc `1:` に付き、redirect されたパケットも出力 qdisc を通ります。
- デバッグはより難しくなります。verifier が読み込みを拒否した場合、情報はエラーコードだけです。`bpftool prog dump xlated` を調べるか、計数付きの別プログラムを生成します。条件の変更は常に再読み込みであり、規則の編集ではありません。

## いつ使うか

eBPF の方が権限要件は高いため、採用理由は通常、権限の節約ではなくホストファイアウォール状態からの分離です。

- FORWARD は繰り返し書き換えられるか。Docker はコンテナや daemon の再起動で規則を並べ替えます。`ufw`、`firewalld`、EDR agent も同様です。カーネル経路では、関係するすべてのファイアウォールがこのフローを許可する必要があります。eBPF は FORWARD に依存しません。
- conntrack の増加が問題になるか。カーネル転送はフローごとに entry を作ります。メンバーや長期接続が多いと table が大きくなり、満杯だと新しいフローを拒否します。eBPF は作りません。
- 観測性にどれだけの価値があるか。カーネル経路には nft counter、`conntrack -E`、各段階の `tcpdump` があります。eBPF でもインターフェース上で capture はできますが、nft と conntrack からは見えません。内部動作は主に `tc -s filter` と `bpftool` で調べます。

既定は `kernel` のままです。`ebpf` は最初の二つの条件が実際にあるホスト向けの選択肢であり、「より速い方式」として使うものではありません。

## 検証

```bash
# プログラムと filter は付いているか。いくつのパケットが通ったか
tc -s filter show dev wg-yat0-xxx ingress

# カーネルに登録された BPF プログラム
bpftool prog list | grep yat_

# 本当に peer に届いたか。relay のカウンタと B 側の送信元を確認する
ip -s link show wg-yat0-xxx
wg show wg-yat0-xxx
```

`tc` 出力の `bpf` 行、プログラム名と実行回数が、filter が生きている最も分かりやすい証拠です。この数は呼び出し回数であり、許可、破棄、redirect、B での受信を区別しません。最終確認はメンバー側の接続性と WireGuard transfer counter で行います。

## 関連記事

- [拠点間接続に Edge を WireGuard peer relay として使う理由](./how-relay-wg.md)
- [WireGuard relay 転送 その1: カーネル ip_forward と nftables forward チェーン](./how-relay-wg-kernel-forward.md)
- [Edge WireGuard 設定](/guide/edge/wireguard)

## 参考

- [Cilium ebpf](https://github.com/cilium/ebpf) — Go loader と `asm` 命令構築
- [eBPF helper: `bpf_redirect`](https://docs.ebpf.io/linux/helper-function/bpf_redirect/) — flags の意味
- [LARTC: Traffic Control filters](https://lartc.org/howto/lartc.qdisc.filters.html) — qdisc、class、filter の関係
