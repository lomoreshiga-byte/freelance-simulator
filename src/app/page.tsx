import GeneralSimulator from "./components/GeneralSimulator";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <GeneralSimulator />
      <div className="max-w-7xl mx-auto px-4 pb-12 text-center text-slate-400">
        <a href="/delivery" className="text-sm font-medium hover:text-indigo-600 transition-colors">
          配送業特化版（旧バージョン）はこちら
        </a>
      </div>
    </main>
  );
}
