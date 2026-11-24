# YAT ユーザーガイド

> YAT は、ルーターのポート開放や内部マシンの公開なしに、プライベートネットワーク内のサービスを公開できる Edge 型トンネルサービスです。

## 最初に読むページ

1. [YAT とは](./what-is-yat.md)：概念と構成
2. [クイックスタート](./quick-start.md)：最初のトンネルを作成
3. [トンネル管理](./tunnel-management.md)：日常的な操作と状態管理

## よくある目的

- Web サイトや API を公開：[HTTP](./transport-modes.md#http)
- データベースや SSH を接続：[TCP](./transport-modes.md#tcp)
- 独自ドメインを使う：[カスタムドメイン](./custom-domains.md)
- 複数の内部サービスを接続：[WireGuard](./wireguard-networking.md)
- 自前サーバーを管理：[Edge](./edge/index.md)

## トラブルシューティング

| 問題 | ドキュメント |
|------|--------------|
| ドメインが解決しない | [DNS トラブルシューティング](./dns-troubleshooting.md) |
| 接続が失敗または不安定 | [接続トラブルシューティング](./connection-troubleshooting.md) |
| HTTPS 証明書が失敗する | [証明書管理](./certificate-management.md) |
| 性能が出ない | [パフォーマンス最適化](./performance-optimization.md) |
| その他の質問 | [FAQ](./faq.md) |

## 全体索引

すべてのドキュメントは [INDEX.md](./INDEX.md) に一覧されています。

---
*YAT Team - Making intranet penetration simpler*
