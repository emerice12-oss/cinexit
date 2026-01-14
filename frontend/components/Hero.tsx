export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-6">
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
        Cinexit Mining
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-gray-400">
        A non-custodial, on-chain revenue distribution protocol.
        <br />
        Transparent. Verifiable. Permissionless.
      </p>

      <div className="mt-10 flex gap-4">
        <a
          href="/dashboard"
          className="px-6 py-3 rounded-xl bg-white text-black font-medium hover:opacity-90"
        >
          Launch App
        </a>

        <a
          href="/docs"
          className="px-6 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-900"
        >
          Documentation
        </a>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        No custody • No guarantees • Fully on-chain
      </p>
    </section>
  )
}
