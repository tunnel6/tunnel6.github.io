# 🌐 接続トラブルシューティングガイド

> 接続に失敗するときは、ネットワーク状態、ファイアウォール、Edge ノードの稼働状態を順に確認してください。

## 🔍 よくある接続問題

### Edge ノードに接続できない
- **症状**：コンソールに `Edge Offline` または `Connection Failed` と表示される
- **考えられる原因**：
  - Edge が起動していない、または異常終了している
  - ネットワーク接続が切れている
  - ファイアウォールが必要なポートをブロックしている
  - DNS 解決に失敗している

### 接続が不安定
- **症状**：接続が断続的に切れ、遅延が大きい
- **考えられる原因**：
  - 帯域が不足している
  - Edge の CPU またはメモリが不足している
  - P2P と Relay などトランスポートモードが適切でない
  - ネットワークの NAT が複雑

## 🛠️ 確認手順

### 手順 1：Edge の状態を確認
```bash
# Edge プロセスを確認
ps aux | grep edge

# リスニングポートを確認
lsof -i :8080  # 設定に合わせてポートを変更

# ログを確認
tail -f /path/to/edge/logs/app.log
```

### 手順 2：ネットワーク到達性を確認
```bash
# Edge への到達性を確認
ping your-edge-domain.com

# ポート到達性を確認
telnet your-edge-domain.com 8080
# nc を使う場合
nc -zv your-edge-domain.com 8080
```

### 手順 3：ファイアウォールを確認
- Edge が使うポートをファイアウォールで許可する
- クラウドプロバイダーのセキュリティグループを確認する
- ローカルのファイアウォール規則を確認する

## 📊 接続状態の指標

YAT では次の値を確認できます。
- **状態**：`Online`、`Offline`、`Connecting`
- **レイテンシ**：RTT（往復時間）
- **パケットロス**：損失率
- **帯域**：現在の使用量

## 🚨 よくある対処

### トランスポートモードを変更
P2P が失敗する場合は Relay に切り替えます。
1. トンネル設定で `Relay Mode` を選択
2. 設定を保存
3. トンネルを再起動

### Edge の設定を調整
```yaml
# config.yaml
performance:
  max_connections: 1000
  bandwidth_limit: 100mbps
  keep_alive: 30s
```

## 📚 関連資料
- [Edge 管理](./edge/management.md)
- [トランスポートモード](./transport-modes.md)
- [トンネル管理](./tunnel-management.md)

---
*最終更新日：2026-05-04*
