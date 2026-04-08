import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            海をきれいに、データの力で。
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            CLEAN-THE-SEAは、海洋プラスチック汚染のホットスポットを可視化し、
            効率的な清掃活動とプラスチッククレジットの取引を支援するプラットフォームです。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-white text-blue-700 font-semibold text-lg hover:bg-blue-50 transition-colors min-h-[44px]"
            >
              🗺️ ホットスポットを見る
            </Link>
            <Link
              href="/contribute"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg border-2 border-white text-white font-semibold text-lg hover:bg-white/10 transition-colors min-h-[44px]"
            >
              📡 データを投稿する
            </Link>
          </div>
        </div>
      </section>

      {/* 3つの柱 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            CLEAN-THE-SEAの3つの機能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              emoji="🌊"
              title="ホットスポット可視化"
              description="海洋プラスチックの密度データを地図上にリアルタイム表示。清掃団体や海運会社が効率的な活動計画を立てられます。"
              href="/dashboard"
              cta="ダッシュボードへ"
            />
            <FeatureCard
              emoji="📱"
              title="現場からデータ投稿"
              description="漁船や調査船がスマートフォンから海洋ごみの情報を報告。位置情報の自動取得と写真アップロードに対応。"
              href="/contribute"
              cta="データを投稿"
            />
            <FeatureCard
              emoji="💚"
              title="プラスチッククレジット"
              description="回収されたプラスチック量に基づくクレジットを発行。ESG投資企業がオフセット購入でき、環境貢献を可視化します。"
              href="/credits"
              cta="クレジットポータルへ"
            />
          </div>
        </div>
      </section>

      {/* 仕組み */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            仕組み
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
            <StepCard step="1" title="データ収集" description="漁船・調査船が海洋ごみの位置と密度を報告" />
            <StepCard step="2" title="ホットスポット特定" description="データを集約し、汚染の集中エリアを可視化" />
            <StepCard step="3" title="清掃活動" description="清掃団体が効率的にプラスチックを回収" />
            <StepCard step="4" title="クレジット発行" description="回収実績に基づきクレジットを発行・取引" />
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm">
          <p>© 2025 CLEAN-THE-SEA. 海洋プラスチック問題の解決を目指して。</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  emoji,
  title,
  description,
  href,
  cta,
}: {
  emoji: string;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-xl bg-white shadow-md p-6 flex flex-col">
      <span className="text-4xl mb-4">{emoji}</span>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed flex-1">{description}</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors min-h-[44px]"
      >
        {cta} →
      </Link>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mb-3">
        {step}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
