# Edge CLI リファレンス

> `edge` コマンドでサーバー、トンネル、チャネル、WireGuard ネットワークを管理できます。

## 基本形

```bash
edge <group> <command> [options]
```

| オプション | 機能 |
|------------|------|
| `--config` | 設定ファイル |
| `--data-dir` | データディレクトリ |
| `--log-level` | ログレベル |
| `--help` | ヘルプ |

## サーバー

```bash
# フォアグラウンド
edge server start --config config.yaml

# デーモン
edge server start --daemon --config config.yaml

edge server status
edge server stop
edge server restart
edge server online
edge server offline
```

## トンネルとチャネル

```bash
edge tunnel list
edge tunnel info --id <tunnel-id>
edge tunnel remove --id <tunnel-id>
edge tunnel clean

edge channel list
edge channel info --id <channel-id>
```

## WireGuard ネットワーク

```bash
edge networks list
edge networks info --id <network-id>
edge networks members --id <network-id>
edge networks remove --id <network-id>

edge networks rate-limit --network <id> --peer <peer-id> --rate 125000
edge networks rate-limit --network <id> --peer <peer-id> --guaranteed 125000 --burst 500000
edge networks rate-limit --network <id> --peer <peer-id> --remove
edge networks rate-limit --network <id> --query
```

## よくあるエラー

| エラー | 原因 |
|--------|------|
| `permission denied` | インターフェース、ソケット、ファイルへの権限不足 |
| `server not running` | プロセスが停止中または PID が誤り |
| `already running` | 同じデータディレクトリで別の Edge が実行中 |

## ヘルプ

```bash
edge --help
edge server --help
edge server start --help
```

## 関連資料

- [設定リファレンス](./config-reference.md)
- [Edge 管理](./management.md)

---
*YAT Team*
