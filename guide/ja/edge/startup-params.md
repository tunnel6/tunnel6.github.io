# Edge 起動パラメーター

> `edge server start` の引数は `config.yaml` より優先されます。コンナーや一時スクリプトで便利です。

## 基本

```bash
edge server start --config /etc/yat-edge/config.yaml
edge server start --daemon
edge server start --public-address edge.example.com
```

## プロセスとパス

| 引数 | 内容 |
|------|------|
| `--config` | 設定ファイル |
| `--data-dir` | データディレクトリ |
| `--pid-file` | PID ファイル |
| `--daemon` | バックグラウンド実行 |

## ネットワーク

| 引数 | 内容 |
|------|------|
| `--public-address` | 公開ドメインまたは IP |
| `--controller-address` | Captain エンドポイント |
| `--http-port` | HTTP ポート |
| `--https-port` | HTTPS ポート |

## TLS

| 引数 | 内容 |
|------|------|
| `--cert-file` | TLS 証明書 |
| `--key-file` | 秘密鍵 |
| `--ca-file` | 信頼する CA |

## TCP / UDP / WireGuard

| 引数 | 内容 |
|------|------|
| `--tcp-ports` | TCP ポートまたは範囲 |
| `--udp-ports` | UDP ポートまたは範囲 |
| `--wireguard-enabled` | WireGuard を有効化 |
| `--wireguard-listen-port` | UDP ポート |
| `--wireguard-subnet` | 仮想サブネット |
| `--wireguard-mtu` | MTU |

## ログ

| 引数 | 値 |
|------|-----|
| `--log-level` | `debug`、`info`、`warn`、`error` |
| `--log-file` | ログファイル |

本番では恒常設定を `config.yaml` に保存し、CLI 引数はテストやオーケストレーション専用にしてください。

## 関連資料

- [設定リファレンス](./config-reference.md)
- [CLI リファレンス](./cli-reference.md)
- [WireGuard 設定](./wireguard.md)

---
*YAT Team*
