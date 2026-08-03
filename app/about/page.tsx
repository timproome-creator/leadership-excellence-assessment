import { BRAND } from '@/lib/brand'

export default function About() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10 prose prose-slate">
        <h1>About this assessment</h1>
        <p>
          The Warehouse Leadership Excellence Assessment (WLEA) is the leadership
          module of the {BRAND.name} platform
          {BRAND.legalName !== BRAND.name ? ` by ${BRAND.legalName}` : ''}. It
          assesses warehouse and distribution-centre leaders against 13 leadership
          competencies, grouped into five themes.
        </p>
        <h2>How it works</h2>
        <ul>
          <li>
            <strong>Role-specific bar.</strong> Expectations rise with scope, from
            Junior Production Manager to Production Manager, DC Manager and Executive.
            Each competency is rated against the standard for the leader’s role.
          </li>
          <li>
            <strong>Two-way.</strong> The leader rates themselves and their line
            manager rates them independently, on an anchored 1–5 scale.
          </li>
          <li>
            <strong>Reveal.</strong> The comparison shows aligned strengths, blind
            spots, hidden strengths and development priorities, with the business
            risk attached to each gap.
          </li>
        </ul>
        <p>
          The five themes are Personal Credibility &amp; Drive, Operational &amp;
          Commercial Judgement, Driving Results, Leading People, and Influence &amp;
          Communication.
        </p>
      </div>
    </main>
  )
}
