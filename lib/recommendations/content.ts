import type { DevelopmentContent } from '@/lib/framework/types'

// 70/20/10 development content per competency: workplace assignments
// (experience), coaching/mentoring (exposure), formal learning (education).
// Keyed by competency.key. Generic enough to apply across role levels; the
// expected behavioural change is computed separately from the role's anchor.
export const DEVELOPMENT_CONTENT: Record<string, DevelopmentContent> = {
  integrity_trust: {
    workplaceAssignments: [
      'Lead a visible, high-stakes commitment (a deadline or a promise to the team) and follow through publicly, even when inconvenient.',
      'Personally own and communicate the next mistake or miss to the team, including what will change.',
      'Chair a fairness review (e.g. shift allocation, overtime, recognition) and act on what it finds.',
    ],
    coaching: [
      'Ask the line manager for direct feedback on one moment in the last month where trust was tested, and discuss what a higher-trust response would have looked like.',
      'Find a peer or mentor known for high credibility and shadow how they handle a difficult, high-visibility decision.',
    ],
    formalLearning: [
      'A short course or article on ethical decision-making and leading with integrity under pressure.',
    ],
    successMeasure:
      'Team and peer feedback shows increased trust; fewer escalations about fairness or inconsistency.',
  },
  drive_resilience: {
    workplaceAssignments: [
      'Take visible ownership of the next high-pressure period (peak, recovery from disruption), with a debrief afterwards on what was learned.',
      'Run a post-mortem on a recent setback and present the recovery plan to the team.',
    ],
    coaching: [
      'Work with the manager or a mentor to build a personal pressure playbook: the specific habits that keep you composed.',
      'Request real-time feedback from the manager during the next high-pressure event.',
    ],
    formalLearning: [
      'Resilience or stress-management training relevant to operational leadership.',
    ],
    successMeasure:
      'Visibly sustains output and composure through at least one full high-pressure period without escalation.',
  },
  learning_development: {
    workplaceAssignments: [
      'Set and share a personal 90-day development goal with the manager, with monthly check-ins.',
      'Take on a task slightly outside the comfort zone (a new area or system) and document what was learned.',
    ],
    coaching: [
      'Establish a regular feedback conversation with the manager focused specifically on growth, not just performance.',
      'Identify a mentor in a function or level the person wants to grow into.',
    ],
    formalLearning: [
      'A relevant operational or leadership module suited to the next role level.',
    ],
    successMeasure:
      'Demonstrates visible application of at least one new skill or piece of feedback within 90 days.',
  },
  operational_knowledge: {
    workplaceAssignments: [
      'Spend structured time in an adjacent function (inbound, inventory, dispatch) to build end-to-end understanding.',
      'Lead the investigation and write-up of a recent operational issue, including root cause and process implications.',
    ],
    coaching: [
      'Pair with a more experienced peer or manager for a walkthrough of how their area’s KPIs and systems work.',
      'Request structured feedback from the manager on technical or process gaps observed in recent decisions.',
    ],
    formalLearning: ['WMS or systems refresher training; a relevant process or safety-standard certification.'],
    successMeasure:
      'Can explain own area’s process, systems and standards, and how they connect to at least one adjacent function, without prompting.',
  },
  commercial_cost: {
    workplaceAssignments: [
      'Build and present a simple cost/service view of own area (cost per unit, labour hours versus output) for one period.',
      'Identify and propose one cost/service/labour trade-off decision, with a clear recommendation and rationale.',
    ],
    coaching: [
      'Review the department’s cost and service numbers with the manager monthly, discussing what drove the movement.',
      'Shadow a budget or business-case conversation at the next level up.',
    ],
    formalLearning: ['Basic commercial or finance-for-non-finance-managers training relevant to operations.'],
    successMeasure:
      'Makes at least one operational decision in the period with an explicit, correct cost/service trade-off rationale.',
  },
  problem_solving: {
    workplaceAssignments: [
      'Own end-to-end resolution of one recurring operational problem, using a structured root-cause method.',
      'Lead one continuous-improvement idea from proposal through to implementation.',
    ],
    coaching: [
      'Debrief a recent decision with the manager: what was the reasoning, what would you do differently.',
      'Seek out a mentor known for strong judgement and observe how they approach ambiguous problems.',
    ],
    formalLearning: ['Root-cause analysis or structured problem-solving training (e.g. 5-whys, A3).'],
    successMeasure: 'At least one recurring problem is resolved at the root cause, with evidence it has not recurred.',
  },
  planning_prioritisation: {
    workplaceAssignments: [
      'Own the planning and resourcing for the next significant period (a week, peak, a project) and present the plan in advance.',
      'Build a contingency plan for one foreseeable risk in own area (absence, demand spike, system outage).',
    ],
    coaching: [
      'Review planning decisions weekly with the manager, focused on what worked and what to adjust.',
      'Shadow how the manager builds and adjusts their own plan during a busy period.',
    ],
    formalLearning: ['Planning, scheduling or resource-allocation training relevant to the role level.'],
    successMeasure:
      'Plans are in place ahead of need, not reactive, with milestones tracked and hit consistently across the period.',
  },
  directing_monitoring: {
    workplaceAssignments: [
      'Set up or refresh a visible performance tracker for the team and use it consistently to drive conversations.',
      'Hold one direct, documented accountability conversation with an under-performer, with a clear follow-up date.',
    ],
    coaching: [
      'Have the manager observe a performance review or team brief and give direct feedback on accountability style.',
      'Discuss with the manager how they hold their own team accountable, and adapt one technique.',
    ],
    formalLearning: ['Performance-management and accountability-conversations training.'],
    successMeasure:
      'Targets are tracked consistently and at least one corrective action is visibly taken and followed through within the period.',
  },
  building_team: {
    workplaceAssignments: [
      'Conduct a structured capability assessment of the team and identify at least one redeployment or development opportunity.',
      'Lead one recruitment or internal-move decision, with a clear rationale tied to the team’s capability gaps.',
    ],
    coaching: [
      'Discuss the team’s talent map with the manager and agree one action to strengthen it.',
      'Seek a mentor’s view on how to spot and develop potential in others.',
    ],
    formalLearning: ['Talent assessment or interviewing-skills training.'],
    successMeasure:
      'Produces a clear, evidenced view of the team’s strengths and gaps, and has acted on at least one of them.',
  },
  developing_people: {
    workplaceAssignments: [
      'Delegate one real piece of accountability, not just a task, to a direct report, with support but without taking it back.',
      'Hold structured development conversations, distinct from performance reviews, with each direct report this period.',
    ],
    coaching: [
      'Get feedback from direct reports on how supported and developed they feel.',
      'Shadow, or be shadowed by, a leader known for developing people well.',
    ],
    formalLearning: ['Coaching skills or delegation training for managers.'],
    successMeasure:
      'At least one direct report can point to a specific way they have grown or been supported in the period.',
  },
  collaboration_conflict: {
    workplaceAssignments: [
      'Lead the resolution of one live cross-functional friction point, building a working agreement with the other party.',
      'Represent own area in a cross-functional forum or planning session.',
    ],
    coaching: [
      'Debrief a recent conflict or negotiation with the manager: what worked, what would land better next time.',
      'Observe how a strong cross-functional partner builds and maintains relationships.',
    ],
    formalLearning: ['Negotiation or conflict-resolution training.'],
    successMeasure:
      'At least one cross-functional relationship measurably improves: fewer escalations, smoother hand-offs.',
  },
  communicating_inspiring: {
    workplaceAssignments: [
      'Lead a team briefing on a change or goal, then gather feedback on its clarity and impact.',
      'Write and deliver one clear, motivating message about a goal or change to the team.',
    ],
    coaching: [
      'Get direct feedback from the manager or a peer on a recent communication: was it clear, was it motivating.',
      'Observe a leader known for communicating well in a high-stakes setting.',
    ],
    formalLearning: ['Communication or presentation-skills training.'],
    successMeasure:
      'Team feedback shows improved clarity or motivation after a specific communication; fewer requests for clarification.',
  },
  critical_strategic: {
    workplaceAssignments: [
      'Take on one task that requires looking beyond the immediate area, such as contributing to a site or cross-department initiative.',
      'Prepare and present a short view of a medium-term opportunity or risk in own area, with options.',
    ],
    coaching: [
      'Discuss a current decision with the manager purely from a "what’s the bigger picture" angle.',
      'Seek out a mentor at the next level up and ask how they think about longer-term issues.',
    ],
    formalLearning: ['A strategic-thinking or critical-thinking workshop.'],
    successMeasure:
      'Produces at least one piece of analysis or input that goes beyond the immediate task and is used in a wider decision.',
  },
}
