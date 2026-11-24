# Edge FAQ

## 状態

### Edge が Offline と表示される

```bash
ps aux | grep edge
lsof -i :443
journalctl -u yat-edge -f
sudo systemctl restart yat-edge
```

プロセスが動いているのに Offline のままなら、DNS と Captain への到達性を確認してください。

### Edge の IP は変更できますか？
ドメインが新しい値を指し、サーバーを再起動すれば変更できます。WireGuard では、稼働中のネットワークがある間は公開アドレス変更を避けてください。

## ログ

```bash
journalctl -u yat-edge -f
```

フォアグラウンド実行時は端末または `log.file` の出力を確認します。

## デプロイと制限

- アカウントが持てる Edge 数はプランによって異なり、作成前にコンソールに表示されます。
- 対応 OS は最近の Linux x86_64 / ARM64 です。Docker もネットワークとポートを正しく設定すれば利用できます。

## 性能

| 用途 | 推奨 |
|------|------|
| テスト | 1 vCPU、1 GB |
| 個人利用 | 2 vCPU、2 GB |
| 本番 | 4 vCPU 以上、4 GB 以上、SSD、十分な帯域 |

## 関連資料

- [Edge 管理](./management.md)
- [Edge をデプロイ](./deploy.md)
- [接続トラブルシューティング](../connection-troubleshooting.md)

---
*YAT Team*
