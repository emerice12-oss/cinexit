export default function CTA() {
  return (
    <section className="py-24 text-center px-6 border-t border-gray-900">
      <h2 className="text-3xl font-semibold mb-6">
        Verify. Then Participate.
      </h2>

      <p className="text-gray-400 max-w-xl mx-auto mb-10">
        Cinexit is designed for users who value transparency, control,
        and on-chain verification over promises.
      </p>

      <a
        href="/dashboard"
        className="inline-block px-8 py-4 rounded-xl bg-white text-black font-medium hover:opacity-90"
      >
        Open Dashboard
      </a>

      <p className="mt-6 text-xs text-gray-500">
        Participation involves smart contract risk. Revenue may vary or be zero.
      </p>
    </section>
  )
}
