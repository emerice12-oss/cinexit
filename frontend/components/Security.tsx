const points = [
  'Non-custodial by design — assets remain in user wallets',
  'USDC conservation enforced by invariant testing',
  'Oracle quorum & replay protection',
  'Circuit breaker for emergency response',
  'Adversarial & fuzz testing completed',
]

export default function Security() {
  return (
    <section className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-semibold mb-12">Security First</h2>

      <ul className="space-y-4">
        {points.map((p) => (
          <li
            key={p}
            className="flex items-start gap-3 text-gray-300"
          >
            <span className="text-green-500 mt-1">✔</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
