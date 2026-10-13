export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-xl p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-3">
          Stock Desk 📈
        </h1>
        <p className="text-slate-400 text-sm">
          AI assistant for Indian (NSE/BSE) stock and dividend investing powered by Google Gemini and live Search Grounding.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Scaffold Complete
        </div>
      </div>
    </main>
  );
}
