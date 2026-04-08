# 🌊 CLEAN-THE-SEA

海洋プラスチック汚染データの可視化・データ収集・クレジット取引MVPプラットフォーム

## 技術スタック

- **フロントエンド**: Next.js (App Router), React, Tailwind CSS, Leaflet
- **バックエンド**: Python (FastAPI)
- **データベース**: PostgreSQL + PostGIS（モックデータモード対応）

## セットアップ

### バックエンド

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

デフォルトでモックデータモード（`USE_MOCK=true`）で起動します。

### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

http://localhost:3000 でアクセスできます。

## 主要機能

1. **ホットスポットダッシュボード** — 海洋プラスチック密度を地図上に可視化
2. **データ投稿フォーム** — スマホから位置情報付きで海洋ごみを報告
3. **マイページ** — 投稿ポイントと履歴の確認
4. **クレジットポータル** — 回収プロジェクト一覧とクレジット購入モック
