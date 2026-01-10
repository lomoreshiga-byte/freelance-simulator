import FreelanceSimulator from "../components/FreelanceSimulator";

export default function DeliveryPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 pt-4">
                <a href="/" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                    ← 汎用版シミュレーターに戻る
                </a>
            </div>
            <FreelanceSimulator />
        </main>
    );
}
