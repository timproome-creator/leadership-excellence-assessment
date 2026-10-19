import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { ReportPayload } from '@/lib/email/report'
import { BRAND } from '@/lib/brand'
import { competency } from '@/lib/framework'
import { RadarChart } from './RadarChart'

const MIN_RATERS_FOR_AGGREGATE = 3

// Mirrors components/assessment/ThreeSixtyPanel.tsx's CategoryCard — same
// anonymity gate (n >= 3 before a group score shows), redrawn with react-pdf
// primitives since that component is a 'use client' component and can't be
// rendered inside the PDF tree directly.
function ThreeSixtyCard({ title, group }: { title: string; group: ReportPayload['peerAggregate'] }) {
  if (group.n === 0) return null

  if (!group.sufficientN) {
    return (
      <View style={styles.threeSixtyCard}>
        <Text style={{ fontSize: 10, fontWeight: 700 }}>{title}</Text>
        <Text style={{ fontSize: 8, color: '#9ca3af', marginTop: 4 }}>
          {group.n} of {MIN_RATERS_FOR_AGGREGATE} responses in. Scores show once the threshold is
          met, to keep individual feedback anonymous.
        </Text>
      </View>
    )
  }

  const rows = group.byCompetency
    .map((r) => ({ name: competency(r.competencyKey).name, mean: r.mean }))
    .filter((r): r is { name: string; mean: number } => r.mean !== null)
    .sort((a, b) => a.mean - b.mean)

  return (
    <View style={styles.threeSixtyCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 10, fontWeight: 700 }}>{title}</Text>
        <Text style={{ fontSize: 8, color: '#9ca3af' }}>{group.n} responses</Text>
      </View>
      <Text style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>
        {fmt(group.overallMean)} <Text style={{ fontSize: 8, fontWeight: 400, color: '#9ca3af' }}>group average</Text>
      </Text>
      {rows.map((r, i) => (
        <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          <Text style={{ fontSize: 8, color: '#374151' }}>{r.name}</Text>
          <Text style={{ fontSize: 8, color: '#6b7280' }}>{fmt(r.mean)}</Text>
        </View>
      ))}
    </View>
  )
}

// True PDF generation (not browser print-to-PDF). react-pdf builds a real,
// paginated PDF document directly from data — its own layout engine, so page
// breaks are predictable and don't depend on the browser or print dialog.
// Already the platform-wide default for reports (see
// platform-architecture-decisions memory); this is its first application.

// Brand identity colours (see lib/brand.ts). Aliased short because they're
// referenced inline throughout the StyleSheet below.
const P = BRAND.palette

// Semantic colours below are deliberately NOT brand-scoped: "below the bar"
// should read red in every brand.
const TONE_COLOR: Record<'good' | 'warn' | 'bad' | 'neutral', string> = {
  good: '#15803d',
  warn: '#b45309',
  bad: '#b91c1c',
  neutral: '#6b7280',
}

const LIGHT_COLOR: Record<'green' | 'amber' | 'red', string> = {
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
}

const fmt = (n: number | null, decimals = 1) =>
  n === null || !Number.isFinite(n)
    ? '-'
    : n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#1f2937' },
  letterhead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 2,
    borderBottomColor: P.deep,
    paddingBottom: 10,
    marginBottom: 16,
  },
  brand: { fontSize: 16, fontWeight: 700, color: P.deep },
  headMeta: { fontSize: 9, color: '#6b7280', textAlign: 'right' },
  h1: { fontSize: 14, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 9, color: '#6b7280', marginBottom: 14 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  scoreBlock: { alignItems: 'center' },
  scoreValue: { fontSize: 20, fontWeight: 700 },
  scoreLabel: { fontSize: 8, color: '#6b7280', marginTop: 2 },
  sectionTitle: { fontSize: 11, fontWeight: 700, marginBottom: 6, marginTop: 12 },
  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, padding: 10, marginBottom: 10 },
  criticalCard: { borderWidth: 1, borderColor: '#fecaca', backgroundColor: '#fef2f2', borderRadius: 6, padding: 10, marginBottom: 10 },
  row: { flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerRow: { flexDirection: 'row', paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  colName: { flex: 3 },
  colNum: { flex: 1, textAlign: 'center' },
  colDot: { flex: 0.6, textAlign: 'center' },
  colGap: { flex: 1.6 },
  headCell: { fontSize: 8, color: '#6b7280', fontWeight: 700 },
  dot: { width: 6, height: 6, borderRadius: 3, alignSelf: 'center' },
  li: { marginBottom: 3 },
  muted: { color: '#9ca3af' },
  colTitle: { fontSize: 9, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' },
  successionCard: { borderWidth: 1, borderColor: P.panelBorder, backgroundColor: P.panelBg, borderRadius: 6, padding: 10, marginBottom: 10 },
  planCard: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, padding: 10, marginBottom: 8 },
  planHeadRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  planName: { fontSize: 10, fontWeight: 700 },
  planScoreShift: { fontSize: 9, color: '#9ca3af' },
  planSubTitle: { fontSize: 8, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 },
  radarWrap: { alignItems: 'center', marginBottom: 6 },
  radarLegend: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
  radarLegendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  radarLegendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  radarLegendLabel: { fontSize: 8, color: '#475569' },
  threeSixtyNotice: { borderWidth: 1, borderColor: '#fde68a', backgroundColor: '#fffbeb', borderRadius: 6, padding: 8, marginBottom: 10 },
  threeSixtyCard: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, padding: 10, flex: 1 },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 6,
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
  },
})

export function ReportDocument({ payload: d }: { payload: ReportPayload }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.letterhead}>
          <Text style={styles.brand}>{BRAND.name}</Text>
          <Text style={styles.headMeta}>
            Warehouse Leadership Excellence Assessment{'\n'}
            {d.subjectName} - {d.roleLevelName}
          </Text>
        </View>

        <Text style={styles.h1}>Leadership profile: {d.subjectName}</Text>
        <Text style={styles.subtitle}>
          Rated against the {d.roleLevelName} bar{d.context ? ` - ${d.context}` : ''}
        </Text>

        <View style={styles.scoreRow}>
          <View style={styles.scoreBlock}>
            <Text style={[styles.scoreValue, { color: P.secondary }]}>{fmt(d.overallSelf)}</Text>
            <Text style={styles.scoreLabel}>Self</Text>
          </View>
          <View style={styles.scoreBlock}>
            <Text style={[styles.scoreValue, { color: P.primary }]}>{fmt(d.overallManager)}</Text>
            <Text style={styles.scoreLabel}>Manager</Text>
          </View>
          <View style={styles.scoreBlock}>
            <Text style={[styles.scoreValue, { fontSize: 13 }]}>{d.maturityLabel}</Text>
            <Text style={styles.scoreLabel}>Maturity</Text>
          </View>
        </View>

        {/* Executive summary — strengths celebrated before gaps, by design. */}
        <View style={[styles.card, { backgroundColor: '#f9fafb' }]} wrap={false}>
          <Text style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Executive summary</Text>
          <Text style={{ fontSize: 9, color: '#1f2937', marginBottom: 4 }}>
            {d.executiveSummary.strengthsNarrative}
          </Text>
          {d.executiveSummary.strengthNames.length > 0 && (
            <Text style={{ fontSize: 8, color: '#15803d', marginBottom: 6 }}>
              Confirmed strengths: {d.executiveSummary.strengthNames.join(' - ')}
            </Text>
          )}
          <Text style={{ fontSize: 9, color: '#1f2937', marginBottom: 4 }}>
            {d.executiveSummary.gapsNarrative}
          </Text>
          {d.executiveSummary.gapNames.length > 0 && (
            <Text style={{ fontSize: 8, color: '#b45309', marginBottom: 6 }}>
              Development focus: {d.executiveSummary.gapNames.join(' - ')}
            </Text>
          )}
          <View style={{ backgroundColor: P.panelBg, borderWidth: 1, borderColor: P.panelBorder, borderRadius: 4, padding: 8, marginTop: 4 }}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: P.deep, textTransform: 'uppercase', marginBottom: 2 }}>
              Overall recommendation
            </Text>
            <Text style={{ fontSize: 9, color: P.panelText }}>{d.executiveSummary.recommendation}</Text>
          </View>
        </View>

        {d.criticalFailures.length > 0 && (
          <View style={styles.criticalCard} wrap={false}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>
              Critical-failure flags
            </Text>
            {d.criticalFailures.map((c, i) => (
              <Text key={i} style={{ fontSize: 9, color: '#991b1b', marginBottom: 2 }}>
                {c.name}, manager score {fmt(c.managerScore, 0)}. {c.businessRisk}
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Competency radar</Text>
        <View style={styles.radarWrap} wrap={false}>
          <RadarChart
            rows={d.competencies.map((c) => ({
              competencyKey: c.key,
              name: c.name,
              self: c.self,
              manager: c.manager,
              target: c.target,
            }))}
          />
          <View style={styles.radarLegend}>
            <View style={styles.radarLegendItem}>
              <View style={[styles.radarLegendDot, { backgroundColor: '#cbd5e1' }]} />
              <Text style={styles.radarLegendLabel}>Bar</Text>
            </View>
            <View style={styles.radarLegendItem}>
              <View style={[styles.radarLegendDot, { backgroundColor: '#0ea5e9' }]} />
              <Text style={styles.radarLegendLabel}>Self</Text>
            </View>
            <View style={styles.radarLegendItem}>
              <View style={[styles.radarLegendDot, { backgroundColor: '#1d4ed8' }]} />
              <Text style={styles.radarLegendLabel}>Manager</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Competency-by-competency</Text>
        <View style={styles.headerRow}>
          <Text style={[styles.headCell, styles.colName]}>Competency</Text>
          <Text style={[styles.headCell, styles.colNum]}>Self</Text>
          <Text style={[styles.headCell, styles.colNum]}>Mgr</Text>
          <Text style={[styles.headCell, styles.colNum]}>Bar</Text>
          <Text style={[styles.headCell, styles.colDot]}></Text>
          <Text style={[styles.headCell, styles.colGap]}>Read</Text>
        </View>
        {d.competencies.map((r, i) => (
          <View key={i} style={styles.row} wrap={false}>
            <Text style={styles.colName}>{r.name}</Text>
            <Text style={[styles.colNum, { color: P.secondary, fontWeight: 700 }]}>{fmt(r.self)}</Text>
            <Text style={[styles.colNum, { color: P.primary, fontWeight: 700 }]}>{fmt(r.manager)}</Text>
            <Text style={[styles.colNum, styles.muted]}>{fmt(r.target, 0)}</Text>
            <View style={styles.colDot}>
              {r.light && <View style={[styles.dot, { backgroundColor: LIGHT_COLOR[r.light] }]} />}
            </View>
            <Text style={[styles.colGap, r.gapTone ? { color: TONE_COLOR[r.gapTone] } : {}]}>
              {r.gapLabel ?? ''}
            </Text>
          </View>
        ))}

        <View style={{ flexDirection: 'row', marginTop: 14 }} wrap={false}>
          <View style={[styles.card, { flex: 1, marginRight: 6 }]}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: '#15803d', marginBottom: 4 }}>Strengths</Text>
            {d.strengths.length === 0 ? (
              <Text style={styles.muted}>No competency rated above the bar yet.</Text>
            ) : (
              d.strengths.map((s, i) => (
                <Text key={i} style={styles.li}>
                  {s.name} <Text style={styles.muted}>- manager {fmt(s.managerScore, 0)}</Text>
                </Text>
              ))
            )}
          </View>
          <View style={[styles.card, { flex: 1, marginLeft: 6 }]}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: '#b45309', marginBottom: 4 }}>
              Development priorities
            </Text>
            {d.developmentPriorities.length === 0 ? (
              <Text style={styles.muted}>No competency below the bar. Solid across the board.</Text>
            ) : (
              d.developmentPriorities.map((p, i) => (
                <Text key={i} style={styles.li}>
                  {p.name}{' '}
                  <Text style={styles.muted}>
                    - manager {fmt(p.managerScore, 0)} vs bar {fmt(p.target, 0)}
                  </Text>
                </Text>
              ))
            )}
          </View>
        </View>

        {d.perceptionGaps.length > 0 && (
          <View style={styles.card} wrap={false}>
            <Text style={{ fontSize: 10, fontWeight: 700, marginBottom: 2 }}>
              Biggest perception gaps: start the conversation here
            </Text>
            <Text style={{ fontSize: 8, color: '#6b7280', marginBottom: 6 }}>
              Where the leader and the manager see things most differently.
            </Text>
            {d.perceptionGaps.map((g, i) => (
              <Text key={i} style={styles.li}>
                {g.name}{' '}
                <Text style={styles.muted}>
                  - self {fmt(g.self, 0)} - mgr {fmt(g.manager, 0)}
                </Text>
                {g.gapLabel ? ` ${g.gapLabel}` : ''}
              </Text>
            ))}
          </View>
        )}

        {d.businessRisks.length > 0 && (
          <View style={styles.card} wrap={false}>
            <Text style={{ fontSize: 10, fontWeight: 700, marginBottom: 6 }}>Business risks from gaps</Text>
            {d.businessRisks.map((b, i) => (
              <Text key={i} style={styles.li}>
                <Text style={{ fontWeight: 700 }}>{b.competencyName}:</Text> {b.risk}
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Recommended actions</Text>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.colTitle, { color: '#b91c1c' }]}>Immediate</Text>
            {d.recommendations.immediate.length === 0 ? (
              <Text style={styles.muted}>None needed.</Text>
            ) : (
              d.recommendations.immediate.map((a, i) => (
                <Text key={i} style={styles.li}>
                  <Text style={{ fontWeight: 700 }}>{a.competencyName}:</Text> {a.content}
                </Text>
              ))
            )}
          </View>
          <View style={{ flex: 1, marginHorizontal: 4 }}>
            <Text style={[styles.colTitle, { color: '#b45309' }]}>30 days</Text>
            {d.recommendations.actions30Day.map((a, i) => (
              <Text key={i} style={styles.li}>
                <Text style={{ fontWeight: 700 }}>{a.competencyName}:</Text> {a.content}
              </Text>
            ))}
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.colTitle, { color: P.primary }]}>90 days</Text>
            {d.recommendations.actions90Day.map((a, i) => (
              <Text key={i} style={styles.li}>
                <Text style={{ fontWeight: 700 }}>{a.competencyName}:</Text> {a.content}
              </Text>
            ))}
          </View>
        </View>

        {(d.recommendations.training.length > 0 || d.recommendations.coaching.length > 0) && (
          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.colTitle}>Training recommendations</Text>
              {d.recommendations.training.map((t, i) => (
                <Text key={i} style={styles.li}>
                  <Text style={{ fontWeight: 700 }}>{t.competencyName}:</Text> {t.content}
                </Text>
              ))}
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.colTitle}>Coaching recommendations</Text>
              {d.recommendations.coaching.map((c, i) => (
                <Text key={i} style={styles.li}>
                  <Text style={{ fontWeight: 700 }}>{c.competencyName}:</Text> {c.content}
                </Text>
              ))}
            </View>
          </View>
        )}

        <View style={[styles.successionCard, { marginTop: 12 }]} wrap={false}>
          <Text style={{ fontSize: 10, fontWeight: 700, color: P.deep, marginBottom: 2 }}>
            Succession note
          </Text>
          <Text style={{ fontSize: 9, color: P.panelText }}>{d.recommendations.succession}</Text>
        </View>

        {d.recommendations.developmentPlans.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Individual development plans (70 / 20 / 10)</Text>
            {d.recommendations.developmentPlans.map((p, i) => (
              <View key={i} style={styles.planCard} wrap={false}>
                <View style={styles.planHeadRow}>
                  <Text style={styles.planName}>{p.competencyName}</Text>
                  <Text style={styles.planScoreShift}>
                    {fmt(p.currentScore, 0)} to {fmt(p.targetScore, 0)}
                  </Text>
                </View>
                <Text style={{ fontSize: 9, color: '#4b5563', marginBottom: 6 }}>
                  {p.expectedBehaviouralChange}
                </Text>
                <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={[styles.planSubTitle, { color: P.primary }]}>Workplace (70%)</Text>
                    {p.workplaceAssignments.map((a, j) => (
                      <Text key={j} style={{ fontSize: 8, color: '#4b5563', marginBottom: 2 }}>
                        - {a}
                      </Text>
                    ))}
                  </View>
                  <View style={{ flex: 1, marginHorizontal: 3 }}>
                    <Text style={[styles.planSubTitle, { color: '#0f766e' }]}>Coaching (20%)</Text>
                    {p.coaching.map((c, j) => (
                      <Text key={j} style={{ fontSize: 8, color: '#4b5563', marginBottom: 2 }}>
                        - {c}
                      </Text>
                    ))}
                  </View>
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <Text style={[styles.planSubTitle, { color: '#7e22ce' }]}>Formal learning (10%)</Text>
                    {p.formalLearning.map((f, j) => (
                      <Text key={j} style={{ fontSize: 8, color: '#4b5563', marginBottom: 2 }}>
                        - {f}
                      </Text>
                    ))}
                  </View>
                </View>
                <Text style={{ fontSize: 8, color: '#374151', marginBottom: 2 }}>
                  <Text style={{ fontWeight: 700 }}>Success measure: </Text>
                  {p.successMeasure}
                </Text>
                <Text style={{ fontSize: 8, color: '#374151', marginBottom: 4 }}>
                  <Text style={{ fontWeight: 700 }}>Evidence required: </Text>
                  {p.evidenceRequired.join('; ')}
                </Text>
                <Text style={{ fontSize: 8, color: '#9ca3af' }}>
                  Review at: {p.reviewTimelineDays.join(' / ')} days - Indicative time to competency:{' '}
                  {p.estimatedTimeToCompetency}
                </Text>
              </View>
            ))}
          </>
        )}

        {(d.peerAggregate.n > 0 || d.directReportAggregate.n > 0) && (
          <>
            <Text style={styles.sectionTitle}>360 feedback</Text>
            <View style={styles.threeSixtyNotice} wrap={false}>
              <Text style={{ fontSize: 8, color: '#92400e' }}>
                Handle with care. These scores were given in confidence. In the development
                conversation, share the themes they point to, not the raw numbers. In a small team,
                quoting scores directly can expose who said what and put people at risk of comeback
                for honest feedback.
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }} wrap={false}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <ThreeSixtyCard title="Peers" group={d.peerAggregate} />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <ThreeSixtyCard title="Direct reports" group={d.directReportAggregate} />
              </View>
            </View>
          </>
        )}

        <Text style={styles.footer} fixed>
          {BRAND.pdfFooter}
        </Text>
      </Page>
    </Document>
  )
}
