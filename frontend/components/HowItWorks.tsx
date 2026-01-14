const steps = [
  {
    title: 'Externally Generated Revenue',
    desc: 'Mining revenue is generated outside the protocol and converted to USDC.',
  },
  {
    title: 'Epoch-Based Settlement',
    desc: 'Revenue is settled in discrete epochs for full auditability.',
  },
  {
    title: 'On-Chain Distribution',
    desc: 'USDC is distributed on-chain based on time-weighted participation.',
  },
]

export default function HowItWorks() {
  return (
    <section className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-semibold mb-12">How Cinexit Works</h2>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((s) => (
          <div
            key={s.title}
            className="p-6 rounded-2xl border border-gray-800 bg-gray-950"
          >
            <h3 className="text-xl font-medium mb-3">{s.title}</h3>
            <p className="text-gray-400 text-sm">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
