import { ManagerCreate } from '@/components/assessment/ManagerCreate'
import { ConsoleLinkRecovery } from '@/components/assessment/ConsoleLinkRecovery'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section style={{ backgroundColor: 'var(--brand-header)', color: 'var(--brand-on-header)' }}>
        <div className="max-w-5xl mx-auto px-4 py-10">
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-2"
            style={{ color: 'var(--brand-accent)' }}
          >
            Warehouse Leadership Excellence Assessment
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight max-w-3xl">
            Turn an honest leadership assessment into a plan to grow.
          </h1>
          <p
            className="mt-3 max-w-2xl text-sm sm:text-base"
            style={{ color: 'var(--brand-accent-soft)' }}
          >
            A warehouse leader is rated against the 13 competencies for their role,
            by themselves and their manager, and their team if you want a fuller
            picture. The result pinpoints the gaps and turns them into an individual
            development plan built to close them, ready for a real development
            conversation.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <ManagerCreate />
        <ConsoleLinkRecovery />
      </div>
    </main>
  )
}
