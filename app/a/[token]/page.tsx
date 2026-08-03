import { loadAssessment } from '@/app/actions'
import { AssessmentByToken } from '@/components/assessment/AssessmentByToken'

// Token-driven pages are always live; never cache.
export const dynamic = 'force-dynamic'

export default async function AssessmentTokenPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const data = await loadAssessment(token)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <AssessmentByToken token={token} data={data} />
      </div>
    </main>
  )
}
