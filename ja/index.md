---
layout: page
sidebar: false
outline: false
title: YAT — ゼロトラストトンネルと WireGuard ネットワーク
description: 識別情報に基づくプライベートネットワークを構築し、認証済みトンネルでローカルサービスを公開するか、WireGuard でデバイス間の仮想 LAN を構築します。
---

<HomeLanding
  badge="WireGuard ネットワーク対応"
  title="あなたのゼロトラストネットワーク。"
  titleAccent="トンネルと仮想 LAN。"
  description="YAT は識別情報に基づくサービストンネルと WireGuard ネットワークを組み合わせます。ローカルアプリを公開し、デバイスを暗号化された仮想 LAN に接続して、受信ポートを開かずにアクセスを管理できます。"
  :primary-action="{ text: '無料で始める', link: 'https://dash.tunnel6.com/login?redirect=%2F&source=wiki&locale=ja', target: '_blank' }"
  :secondary-action="{ text: 'クライアントをダウンロード', link: '/ja/download.html' }"
  github-action="GitHub を見る"
  :hero-chips="['ゼロトラスト識別情報', 'サービストンネル', 'WireGuard 仮想 LAN', 'エンドツーエンド mTLS']"
  capability-eyebrow="プラットフォーム機能"
  capability-title="本番インフラと同じ管理性を持つプライベートネットワーク"
  :capabilities="[
    {
      icon: '🔐',
      title: 'ゼロトラスト接続',
      description: 'デバイスと Edge ノードは mTLS で相互認証します。アクセスは識別情報で決まり、ネットワーク位置や開放ポートでは決まりません。'
    },
    {
      icon: '🛰️',
      title: 'トンネルと仮想 LAN',
      description: 'HTTP、TCP、デスクトップサービスを公開するか、WireGuard ネットワークで複数デバイスを安全に接続します。'
    },
    {
      icon: '🧩',
      title: '拡張設計',
      description: 'HTTP、TCP、リモートデスクトップサービスを公開し、カスタムアプリでクライアント機能を拡張します。'
    },
    {
      icon: '📦',
      title: '本番運用デプロイ',
      description: 'Linux で Edge を自己ホストし、デプロイスクリプト、デーモン、実行状態の可視化を利用できます。'
    },
    {
      icon: '🌐',
      title: 'カスタムドメイン',
      description: '独自ドメインと CNAME を設定し、自分が管理する Edge ノード経由で通信できます。'
    },
    {
      icon: '👥',
      title: 'スマートなデバイスネットワーク',
      description: 'WireGuard がサブネット IP を自動割り当てし、LAN 経路を判定して直接接続とリレーの最適な経路を選択します。'
    }
  ]"
  workflow-eyebrow="仕組み"
  workflow-title="数分でローカルサービスを制御された公開入口に変える"
  workflow-description="受信ファイアウォールを変更せず、インフラを作り直す必要もありません。ローカルサービスを起動し、YAT に接続して、認証済み Edge 経由で入口を公開します。"
  :workflow-steps="[
    { title: 'インストールとサインイン', description: 'YAT クライアントをインストールし、安全なアカウントでデバイスを認証します。' },
    { title: 'Edge に接続', description: '管理されたリレーを購読するか、公開サーバーに独自 Edge をデプロイします。' },
    { title: 'トンネルを作成', description: 'ローカルサービス、プロトコル、Edge を選ぶと、共有可能なリモートアドレスが生成されます。' },
    { title: 'アクセスを制御', description: 'トンネルを起動し、トラフィックを監視し、入口を共有するか特定の識別情報だけに限定します。' }
  ]"
  terminal-title="クイックスタート"
  :terminal-lines="[
    '$ python3 -m http.server 8080',
    '',
    '# YAT で',
    '# Tunnels → Create Tunnel → HTTP Proxy',
    '# ローカルポート: 8080 · Edge: production',
    '',
    '$ curl https://api.example.myroxy.dev',
    '200 OK · mTLS verified'
  ]"
  use-case-eyebrow="ユースケース"
  use-case-title="デモではなく、実際のネットワークのための設計"
  :use-cases="[
    { icon: '🏠', title: '家庭内サービス', description: 'NAS 管理画面やメディアツールを、家庭ネットワークを公開せずに安全利用します。' },
    { icon: '💻', title: '開発サーバー共有', description: 'チームやレビュアーに、ローカル API とプレビュー環境への制御されたアクセスを提供します。' },
    { icon: '🖥️', title: 'リモートデスクトップ', description: 'macOS と Windows の ARD / VNC への安全なアクセスを拡張機能で実現します。' },
    { icon: '🎮', title: 'プライベートゲームサーバー', description: '公開ファイアウォールポートを開かずに、少人数用マルチプレイヤーサーバーを運用します。' }
  ]"
  architecture-eyebrow="2 つのネットワークモデル"
  architecture-title="サービス公開とデバイスネットワークを 1 つのアプリで"
  architecture-description="YAT はサービスの公開とネットワーク構築を分けてモデル化するため、別の VPN ツールを維持する必要がありません。"
  :tunnel-mode="{
    icon: '🛣️',
    eyebrow: 'サービスアクセス',
    title: 'トンネルモード',
    description: 'ポイントツーポイントのトンネルがローカルサービスを、選択した訪問者だけが使える制御されたリモート入口に変えます。',
    points: [
      'HTTP、TCP、ARD、VNC サービスを公開',
      'mTLS 認証済み Edge または P2P 経由で通信',
      '受信ファイアウォール規則なしでカスタムドメイン利用',
      '公開者、利用者、管理者のロールを分離'
    ],
    guideLink: '/ja/guide/transport-modes.html',
    guideLabel: 'トンネルガイドを読む'
  }"
  :wireguard-mode="{
    icon: '🛡️',
    eyebrow: 'デバイス相互接続',
    title: 'WireGuard ネットワーク',
    description: '暗号化された仮想 LAN を構築し、承認された各デバイスに同じサブネットのアドレスを割り当てます。',
    points: [
      '仮想サブネット IP を自動割り当て',
      'カーネルレベルのエンドツーエンド WireGuard 暗号化',
      'LAN、公衆網、リレー経路を自動選択',
      'ファイル転送やデータベース接続で準ネイティブ性能'
    ],
    guideLink: '/ja/guide/wireguard-networking.html',
    guideLabel: 'WireGuard ガイドを読む'
  }"
  cta-title="今日、最初の安全なトンネルをデプロイしましょう。"
  cta-description="YAT をダウンロードして Edge に接続すれば、数分でゼロトラスト入口または WireGuard 仮想 LAN を作成できます。"
  :cta-action="{ text: '今すぐ始める', link: 'https://dash.tunnel6.com/login?redirect=%2F&source=wiki&locale=ja', target: '_blank' }"
  :docs-action="{ text: 'ドキュメントを読む', link: '/ja/guide/what-is-yat.html' }"
/>
