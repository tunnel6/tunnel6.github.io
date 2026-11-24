# Edge WireGuard 設定

> Edge は WireGuard インターフェースを作成し、メンバーにアドレスを割り当て、メンバー間の通信を転送できます。

## 前提条件

- kernel 5.6 以降、または WireGuard モジュール／ユーザー空間実装
- 有効な IP 転送
- 到達可能な UDP ポート
- インターフェースと nftables 規則を作成する権限
- `config.yaml` の `wireguard` セクション

## 設定

```yaml
wireguard:
  enabled: true
  listen_port: 51820
  subnet: 100.64.0.0/16
  mtu: 1420
```

起動引数 `--wireguard-listen-port` でポートを上書きできます。

## ファイアウォール

```bash
sudo ufw allow 51820/udp

sudo iptables -A INPUT -p udp --dport 51820 -j ACCEPT
sudo iptables -A FORWARD -i wg-yat0-xxx -j ACCEPT
sudo iptables -A FORWARD -o wg-yat0-xxx -j ACCEPT
```

## 検証

```bash
journalctl -u yat-edge -f
ip link show wg-yat0-xxx
nft list ruleset | grep 'yat-relay'
sysctl net.ipv4.ip_forward
```

期待される出力の例：

```text
WireGuard functionality enabled
kernel forwarder started: iface=wg-yat0-xxx
wg-yat0-xxx: <POINTOPOINT,NOARP,UP,LOWER_UP> mtu 1420
net.ipv4.ip_forward = 1
```

## Docker と iptables の干渉

Docker ホストでは `FORWARD` チェーンが `DROP` になっていることがあります。

```bash
iptables --version
```

`nf_tables` と表示されれば Docker と nftables は同じカーネル経路を使います。`legacy` の場合は次を追加します。

```bash
sudo iptables -I DOCKER-USER -i wg-yat0-xxx -j ACCEPT
sudo iptables -I DOCKER-USER -o wg-yat0-xxx -j ACCEPT
```

`DOCKER-USER` は Docker 再起動で再構築されるため、システムのファイアウォール設定で永続化してください。

### 古いカーネル

```bash
uname -r
```

5.6 未満の場合は WireGuard をインストールするか、カーネルを更新してください。

## 関連資料

- [WireGuard ネットワーク](../wireguard-networking.md)
- [設定リファレンス](./config-reference.md)
- [FAQ](./faq.md)

---
*YAT Team*
