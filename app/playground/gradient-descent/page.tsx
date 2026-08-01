import Link from "next/link";

export default function GradientDescentPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8 flex flex-col items-center justify-center font-mono">
      <div className="border-4 border-amber-500 bg-zinc-900 p-8 shadow-[6px_6px_0px_0px_rgba(245,158,11,1)] max-w-md text-center">
        <h1 className="text-3xl font-extrabold text-amber-400 mb-4 uppercase tracking-wider">
          Gradient Descent Playground
        </h1>
        <p className="text-zinc-400 mb-6 text-sm">
          [MODULE COMING SOON] Learn how optimization surfaces and gradient updates find loss minima!
        </p>
        <Link
          href="/playground/perceptron"
          className="inline-block bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-4 py-2 border-2 border-zinc-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase transition-all"
        >
          ← Back to Perceptron
        </Link>
      </div>
    </main>
  );
}
