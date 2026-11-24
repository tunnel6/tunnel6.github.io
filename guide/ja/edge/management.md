# Edge サーバー管理

> Edge は公開トラフィックを受け付け、認証済みクライアントへ転送し、状態を Captain へ報告するノードです。

## コンポーネント

| コンポーネント | 機能 |
|----------------|------|
| HTTP/HTTPS リスナー | TLS を終端し、ドメインごとに振り分け |
| TCP/UDP リスナー | TCP/UDP トンネル用のポートを公開 |
| WireGuard | 仮想 LAN のインターフェースと転送を管理 |
| Tunnel agent | クライアントとのチャネルを維持 |
| State reporter | 状態と指標を Captain へ送信 |

## ライフサイクル

1. 登録により識別情報と証明書を取得
2. Captain との接続を確立
3. トンネルとドメイン設定を同期
4. 設定されたポートでサービス開始
5. 健康、トラフィック、証明書状態を報告

## 状態

| 状態 | 意味 |
|------|------|
| Online | 登録済みで同期中 |
| Offline | Captain と通信できない |
| Degraded | 一部機能が異常、例：DNS や証明書エラー |

## 日常操作

```bash
./edge server status
./edge server restart --config config.yaml
./edge tunnel list
```

systemd を使う場合：

```bash
sudo systemctl status yat-edge
sudo journalctl -u yat-edge -f
```

## ドメインと健康状態

コンソールでは期待される CNAME、DNS 検証状態、HTTPS 証明書状態、遅延と可用性を確認できます。ドメインエラー時は [DNS トラブルシューティング](../dns-troubleshooting.md) と [証明書管理](../certificate-management.md) を参照してください。

## 制限

プランとハードウェアによって異なりますが、次の上限に注意してください。

- トンネル数
- TCP/UDP ポート
- 帯域
- 同時接続数
- WireGuard インターフェース数

## 推奨設定

- systemd で自動再起動を構成する
- 専用ユーザーで実行する
- `config.yaml` の権限を制限する
- CPU、メモリ、帯域を監視する
- OS を最新に保つ

## 関連資料

- [Edge をデプロイ](./deploy.md)
- [起動パラメーター](./startup-params.md)
- [設定リファレンス](./config-reference.md)
- [Edge FAQ](./faq.md)

---
*YAT Team*
