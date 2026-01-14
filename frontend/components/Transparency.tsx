export default function Transparency() {
  return (
    <section className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-semibold mb-12">Radical Transparency</h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl border border-gray-800 bg-gray-950">
          <h3 className="text-xl font-medium mb-3">On-Chain Verification</h3>
          <p className="text-gray-400 text-sm">
            All epochs, distributions, and claims are publicly verifiable on-chain.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-gray-800 bg-gray-950">
          <h3 className="text-xl font-medium mb-3">Independent Indexing</h3>
          <p className="text-gray-400 text-sm">
            Anyone can re-index protocol data and verify results without relying on our frontend.
          </p>
        </div>
      </div>
    </section>
  )
}
