import Link from "next/link";

export default function GradientDescentPage() {
  return (
    <main className="min-h-screen bg-[#1e140e] text-[#fefae0] p-8 flex flex-col items-center justify-center font-vt323">
      <div className="border-4 border-[#dda15e] bg-[#281b12] p-8 shadow-[6px_6px_0px_0px_#0f0a07] max-w-md text-center">
        <h1 className="text-2xl font-pixel text-[#dda15e] mb-4 uppercase tracking-wider">
          Gradient Descent
        </h1>
        <p className="text-[#a3b18a] mb-6 text-xl">
          [MODULE COMING SOON] Learn how optimization surfaces and gradient updates find loss minima!
        </p>
        <Link
          href="/playground/perceptron"
          className="inline-block bg-[#386641] hover:bg-[#4a7c59] text-[#fefae0] font-pixel text-xs px-4 py-3 border-4 border-[#1b3521] shadow-[4px_4px_0px_0px_#0f0a07] uppercase transition-all"
        >
          ← Back to Perceptron
        </Link>
      </div>
    </main>
  );
}
