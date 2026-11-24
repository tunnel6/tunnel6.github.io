# Edge 設定リファレンス

> `config.yaml` では識別情報、Captain 接続、ポート、TLS、上限、WireGuard、ログを設定します。

## 読み込み順

1. 既定値
2. `config.yaml`
3. 環境変数
4. コマンドライン引数

コマンドライン引数が最も優先されます。相対パスは Edge のデータディレクトリを基準に解釈されます。

## 例

```yaml
node:
  name: my-edge
  region: sin
  public_address: edge.example.com

controller:
  address: captain.example.com:443
  insecure: false

tunnel:
  domain: edge.example.com
  http_port: 80
  https_port: 443
  tcp_ports: [10000-10100]
  udp_ports: [20000-20100]

wireguard:
  enabled: true
  listen_port: 51820
  subnet: 100.64.0.0/16

log:
  level: info
  file: /var/lib/yat-edge/log/app.log
```

## 主なセクション

### `node`

| キー | 内容 |
|------|------|
| `name` | ノード名 |
| `region` | リージョンまたは場所ラベル |
| `public_address` | 公開ドメインまたは IP |

### `controller`

| キー | 内容 |
|------|------|
| `address` | Captain のエンドポイント |
| `insecure` | 検証を無効化。テスト専用 |

### `tunnel`

| キー | 内容 |
|------|------|
| `domain` | Edge の基本ドメイン |
| `http_port` | HTTP ポート |
| `https_port` | HTTPS ポート |
| `tcp_ports` | TCP ポートまたは範囲 |
| `udp_ports` | UDP ポートまたは範囲 |

### `wireguard`

| キー | 内容 |
|------|------|
| `enabled` | WireGuard の有効化 |
| `listen_port` | UDP ポート |
| `subnet` | 仮想サブネット |
| `mtu` | 通常は 1420 |

### `log`

| キー | 値 | 内容 |
|------|----|------|
| `level` | `debug`、`info`、`warn`、`error` | ログレベル |
| `file` | パス | 出力ファイル |

### `performance`

| キー | 内容 |
|------|------|
| `max_connections` | 同時接続数 |
| `bandwidth_limit` | 帯域制限 |
| `worker_threads` | ワーカースレッド数 |

## 関連資料

- [起動パラメーター](./startup-params.md)
- [CLI リファレンス](./cli-reference.md)
- [WireGuard 設定](./wireguard.md)

---
*YAT Team*
