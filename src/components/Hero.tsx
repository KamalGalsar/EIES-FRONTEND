//components/Hero.tsx
export default function Hero() {
  return (
    <section className="relative text-center text-black bg-white dark:text-white dark:bg-gray-900" id="signin">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/10 px-3 py-1 text-xs text-black/70 dark:text-white/80">
            Azure‑native • Identity Security
          </span>

          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
            Predict identity compromise and
            <span className="text-blue-600 dark:text-blue-300"> eliminate toxic permissions</span>.
          </h1>

          <p className="mt-4 text-lg text-black/70 dark:text-white/80">
            EIES maps Entra identities, detects hidden admin paths, forecasts blast radius,
            and auto‑remediates risky access.
          </p>
        </div>
      </div>
    </section>
  );
}