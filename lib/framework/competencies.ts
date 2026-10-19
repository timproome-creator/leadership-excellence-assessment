import type { Cluster, Competency } from './types'

// Five themes, mapped back to the six source clusters (de-branded, trimmed 18→13).
export const CLUSTERS: Cluster[] = [
  { key: 'personal', name: 'Personal Credibility & Drive', sortOrder: 1 },
  { key: 'judgement', name: 'Operational & Commercial Judgement', sortOrder: 2 },
  { key: 'results', name: 'Driving Results', sortOrder: 3 },
  { key: 'people', name: 'Leading People', sortOrder: 4 },
  { key: 'influence', name: 'Influence & Communication', sortOrder: 5 },
]

// Each anchor is the "3 — meets expectation" standard at that role level.
export const COMPETENCIES: Competency[] = [
  // ── A · Personal Credibility & Drive ──────────────────────────
  {
    key: 'integrity_trust',
    name: 'Integrity & Building Trust',
    clusterKey: 'personal',
    definition:
      'Builds credibility and trust through a track record of results, ethical conduct, fairness, emotional control and consistency.',
    whyItMatters:
      'Trust is the multiplier on a leader’s influence. Without it, nothing else they do lands.',
    isCritical: true,
    weight: 1,
    behaviours: [
      'Does what they say; consistent words and actions',
      'Treats people fairly and consistently',
      'Handles confidential and ethical matters soundly',
    ],
    businessRisk:
      'Erodes trust and engagement; integrity lapses create conduct, fairness and reputational risk.',
    anchors: {
      jpm: {
        text: 'Does what they say, treats the team fairly and consistently, and earns the shift’s trust by delivering and owning mistakes.',
        target: 3,
      },
      pm: {
        text: 'Builds a fair, ethical department culture; is trusted by team leaders and peers; handles confidential and people matters with integrity.',
        target: 3,
      },
      dcm: {
        text: 'Sets the ethical tone for the site; is consistently trusted by the management team and staff; addresses unfairness and unethical behaviour proactively.',
        target: 3,
      },
      fm: {
        text: 'Sets the ethical tone for how the site is maintained and secured; trusted by the management team and contractors alike; addresses unsafe shortcuts or compliance gaps proactively rather than covering them up.',
        target: 3,
      },
      exec: {
        text: 'Is a trusted figure across the business; embeds integrity into how the network operates; protects organisational values under pressure.',
        target: 3,
      },
    },
  },
  {
    key: 'drive_resilience',
    name: 'Personal Drive & Resilience',
    clusterKey: 'personal',
    definition:
      'Sustains performance and composure under pressure, persists through setbacks, and drives to win.',
    whyItMatters:
      'DC operations run on pressure and disruption; a leader who wobbles takes the team down with them.',
    isCritical: false,
    weight: 1,
    behaviours: [
      'Stays composed and productive under pressure',
      'Recovers quickly from setbacks',
      'Pursues goals relentlessly',
    ],
    businessRisk:
      'Performance collapses under peak or disruption; pressure cascades to the team and service suffers.',
    anchors: {
      jpm: {
        text: 'Keeps the shift productive under daily pressure (volume spikes, absences); recovers quickly from setbacks; pushes to hit the number.',
        target: 3,
      },
      pm: {
        text: 'Sustains the department through prolonged pressure and competing demands; stays composed and goal-focused across the period.',
        target: 3,
      },
      dcm: {
        text: 'Holds the site steady through peak, disruption and crisis; models resilience for the management team; relentless about site performance.',
        target: 3,
      },
      fm: {
        text: 'Holds the site’s buildings, plant and security steady through breakdowns, emergencies and crises (fire, power failure, security incidents); remains composed and decisive under pressure; relentless about keeping the site safe and operational.',
        target: 3,
      },
      exec: {
        text: 'Maintains direction and composure through major business pressure and change; energises the organisation to perform under adversity.',
        target: 3,
      },
    },
  },
  {
    key: 'learning_development',
    name: 'Learning & Self-Development',
    clusterKey: 'personal',
    definition:
      'Open to feedback; actively builds own knowledge, skills and technical expertise.',
    whyItMatters:
      'A leader who stops learning caps the capability of everyone they lead.',
    isCritical: false,
    weight: 1,
    behaviours: [
      'Knows own strengths and gaps',
      'Acts on feedback',
      'Actively builds expertise',
    ],
    businessRisk:
      'Capability stagnates; the leader becomes a ceiling on the team and misses changing best practice.',
    anchors: {
      jpm: {
        text: 'Knows own strengths and gaps; acts on feedback; learns the operational standards and systems of the role.',
        target: 3,
      },
      pm: {
        text: 'Seeks feedback and development; deepens functional expertise; learns from other departments and best practice.',
        target: 3,
      },
      dcm: {
        text: 'Continuously develops own leadership and commercial capability; seeks external/industry learning; models a learning posture for the site.',
        target: 3,
      },
      fm: {
        text: 'Continuously develops technical knowledge of building systems, automation/mechanisation and fire/security regulation as they evolve; seeks external and industry learning; models a learning posture for the site.',
        target: 3,
      },
      exec: {
        text: 'Stays ahead of industry and supply-chain trends; deliberately develops own strategic capability; champions learning across the business.',
        target: 3,
      },
    },
  },

  // ── B · Operational & Commercial Judgement ────────────────────
  {
    key: 'operational_knowledge',
    name: 'Operational Knowledge & Technical Expertise',
    clusterKey: 'judgement',
    definition:
      'Sound understanding of DC/warehouse processes and the systems and standards that run them.',
    whyItMatters:
      'A leader who does not understand the operation cannot diagnose problems or earn the team’s technical respect.',
    isCritical: false,
    weight: 1,
    behaviours: [
      'Knows the relevant processes and standards',
      'Understands the systems (WMS/KPIs) that govern them',
      'Connects own area to up- and downstream flow',
    ],
    businessRisk:
      'Poor decisions from weak operational grounding; problems mis-diagnosed and process discipline slips.',
    anchors: {
      jpm: {
        text: 'Knows the processes in own area (pick / pack / putaway / dispatch), the WMS/system functions used, and the relevant safety and quality standards.',
        target: 3,
      },
      pm: {
        text: 'Understands the end-to-end flow across the department and how it links to up- and downstream functions; strong on the systems and KPIs that govern it.',
        target: 3,
      },
      dcm: {
        text: 'Commands the full DC operating model, from inbound to dispatch, inventory, labour, MHE, safety and cost, and how they interact across the site.',
        target: 3,
      },
      fm: {
        text: 'Commands the full facilities and maintenance operating model: building infrastructure, automation and mechanisation, security systems (guarding, CCTV, offsite monitoring) and fire prevention/certification, and how they interact with site operations.',
        target: 3,
      },
      exec: {
        text: 'Understands the wider supply-chain and network operating model; connects DC performance to logistics, planning, customer and cost outcomes.',
        target: 3,
      },
    },
  },
  {
    key: 'commercial_cost',
    name: 'Commercial & Cost Awareness',
    clusterKey: 'judgement',
    definition:
      'Understands the cost and service drivers of the operation and makes decisions that protect cost-to-serve and the customer.',
    whyItMatters:
      'Operational decisions are commercial decisions; a leader blind to cost and service erodes margin.',
    isCritical: false,
    weight: 1,
    behaviours: [
      'Understands how decisions affect cost and service',
      'Makes sound cost/service/labour trade-offs',
      'Protects the customer order',
    ],
    businessRisk:
      'Cost-to-serve drifts; trade-offs made without a commercial lens; margin and service quietly leak.',
    anchors: {
      jpm: {
        text: 'Understands how own area’s output, labour hours and errors affect cost and service; avoids waste; protects the customer order.',
        target: 3,
      },
      pm: {
        text: 'Manages the department to budget / cost-per-unit and service targets; makes sound trade-offs between cost, service and labour.',
        target: 3,
      },
      dcm: {
        text: 'Owns site cost-to-serve and service performance; balances cost, capacity, service and risk across functions; builds business cases.',
        target: 3,
      },
      fm: {
        text: 'Owns the facilities and maintenance budget (planned and reactive maintenance, automation upgrades, security and fire compliance); balances cost against risk, downtime and compliance exposure; builds business cases for capital investment.',
        target: 3,
      },
      exec: {
        text: 'Shapes the commercial model of the operation; drives network cost, service and capacity strategy; links operations to P&L and customer value.',
        target: 3,
      },
    },
  },
  {
    key: 'problem_solving',
    name: 'Problem-Solving, Decisions & Improvement',
    clusterKey: 'judgement',
    definition:
      'Applies sound judgement and calculated risk-taking to solve problems, and generates and acts on improvement ideas.',
    whyItMatters:
      'The operation throws up problems daily; the leader’s judgement is what keeps it moving and improving.',
    isCritical: false,
    weight: 1,
    behaviours: [
      'Diagnoses root cause, not just symptoms',
      'Makes well-judged, timely decisions',
      'Generates and acts on improvement ideas',
    ],
    businessRisk:
      'Problems recur unsolved; decisions are slow or poor; improvement stalls and waste persists.',
    anchors: {
      jpm: {
        text: 'Diagnoses and fixes day-to-day operational problems; makes sound calls within the shift; raises practical improvement ideas.',
        target: 3,
      },
      pm: {
        text: 'Solves recurring/structural department problems using data; makes well-judged decisions; leads continuous-improvement initiatives.',
        target: 3,
      },
      dcm: {
        text: 'Resolves complex, cross-functional site problems; takes calculated operational risks; builds a culture of improvement across the site.',
        target: 3,
      },
      fm: {
        text: 'Resolves complex building, plant, automation and security problems, often under time pressure; takes calculated risk decisions on repair-vs-replace and compliance trade-offs; drives a culture of preventive rather than reactive maintenance.',
        target: 3,
      },
      exec: {
        text: 'Tackles ambiguous, business-level problems; makes high-stakes judgement calls; drives innovation and change across the network.',
        target: 3,
      },
    },
  },

  // ── C · Driving Results ───────────────────────────────────────
  {
    key: 'planning_prioritisation',
    name: 'Planning & Prioritisation',
    clusterKey: 'results',
    definition:
      'Translates goals into feasible plans with clear priorities, targets and milestones.',
    whyItMatters:
      'Without a plan and clear priorities, effort scatters and targets are missed by accident.',
    isCritical: false,
    weight: 1,
    behaviours: [
      'Turns goals into a feasible plan',
      'Sets clear priorities and milestones',
      'Re-plans as conditions change',
    ],
    businessRisk:
      'Resources mis-allocated; reactive firefighting replaces planning; targets missed without warning.',
    anchors: {
      jpm: {
        text: 'Plans the shift/day (labour, sequence, priorities) to hit the daily plan; reprioritises as the day changes.',
        target: 3,
      },
      pm: {
        text: 'Builds department plans to weekly/period targets; allocates resource and identifies the key success factors; manages to milestones.',
        target: 3,
      },
      dcm: {
        text: 'Sets the site operating plan; aligns functions, capacity and labour to targets; plans for peak and contingencies.',
        target: 3,
      },
      fm: {
        text: 'Sets the site’s maintenance, automation-enhancement and compliance plan; prioritises planned maintenance against breakdowns and urgent fixes; plans ahead for peak, audits and certification deadlines.',
        target: 3,
      },
      exec: {
        text: 'Sets operational strategy and the plan to deliver it; aligns site/network resources and capability to longer-term goals.',
        target: 3,
      },
    },
  },
  {
    key: 'directing_monitoring',
    name: 'Directing & Monitoring Performance',
    clusterKey: 'results',
    definition:
      'Clarifies responsibilities, holds people accountable, monitors performance and takes corrective action.',
    whyItMatters:
      'This is the core operational-management competency: the engine of delivery and accountability.',
    isCritical: true,
    weight: 1,
    behaviours: [
      'Sets clear targets and tracks them visibly',
      'Holds people accountable',
      'Acts on misses with corrective action',
    ],
    businessRisk:
      'Weak KPI accountability; performance drifts unmonitored; service and cost variance goes uncorrected.',
    anchors: {
      jpm: {
        text: 'Sets clear shift targets, tracks them visibly, and acts on misses within the shift; holds the team to standard.',
        target: 3,
      },
      pm: {
        text: 'Manages the department to weekly/period KPIs; holds team leaders accountable; escalates structural issues with data.',
        target: 3,
      },
      dcm: {
        text: 'Runs a site-wide performance system; cascades goals, reviews trends across functions, and builds accountability.',
        target: 3,
      },
      fm: {
        text: 'Runs a site-wide maintenance, security and compliance performance system; tracks uptime, incident and certification metrics; holds the maintenance team and contractors accountable to standard.',
        target: 3,
      },
      exec: {
        text: 'Drives a performance-management discipline across sites; holds site leaders accountable; governs through metrics and review cadence.',
        target: 3,
      },
    },
  },

  // ── D · Leading People ────────────────────────────────────────
  {
    key: 'building_team',
    name: 'Building the Team & Leveraging Talent',
    clusterKey: 'people',
    definition:
      'Builds a capable team by assessing capability accurately, acquiring/retaining talent and using people’s strengths.',
    whyItMatters:
      'A leader is only as strong as the team they build; talent gaps become performance gaps.',
    isCritical: false,
    weight: 1,
    behaviours: [
      'Assesses capability accurately and fairly',
      'Recruits and retains good people',
      'Deploys people to their strengths',
    ],
    businessRisk:
      'Capability and succession gaps; key-person dependency; under-performance left unaddressed.',
    anchors: {
      jpm: {
        text: 'Assesses team members’ strengths fairly; deploys people to the right tasks; flags resourcing and skill gaps.',
        target: 3,
      },
      pm: {
        text: 'Builds a capable team of leads; recruits and retains good people; addresses under-performance and capability gaps.',
        target: 3,
      },
      dcm: {
        text: 'Builds a strong site management team; manages talent and succession across functions; capitalises on collective strengths.',
        target: 3,
      },
      fm: {
        text: 'Builds a capable maintenance and security team (technicians, artisans, guarding staff) and manages key contractor relationships; plans talent and succession for critical technical skills; capitalises on the team’s strengths.',
        target: 3,
      },
      exec: {
        text: 'Builds leadership bench-strength across the network; drives talent and succession strategy; positions the right leaders in the right roles.',
        target: 3,
      },
    },
  },
  {
    key: 'developing_people',
    name: 'Developing & Supporting People',
    clusterKey: 'people',
    definition:
      'Delegates effectively, develops capability, and provides a supportive, approachable management style.',
    whyItMatters:
      'Developing people compounds capability and is the only way a leader scales beyond themselves.',
    isCritical: false,
    weight: 1,
    behaviours: [
      'Delegates with trust',
      'Coaches and develops the team',
      'Is supportive and approachable',
    ],
    businessRisk:
      'No bench developed; the leader becomes a bottleneck; engagement and retention suffer.',
    anchors: {
      jpm: {
        text: 'Coaches team members on the job; delegates simple tasks with trust; is approachable and helps the team when needed.',
        target: 3,
      },
      pm: {
        text: 'Develops team leaders through delegation and feedback; supports career conversations; removes blockers for the team.',
        target: 3,
      },
      dcm: {
        text: 'Builds leadership capability across the site; delegates real accountability; creates a supportive, high-trust management culture.',
        target: 3,
      },
      fm: {
        text: 'Builds technical and leadership capability across the maintenance and security team; delegates real accountability for plant and site areas; creates a supportive, safety-first culture.',
        target: 3,
      },
      exec: {
        text: 'Develops senior leaders; champions development systems; builds a supportive, empowering culture across the organisation.',
        target: 3,
      },
    },
  },

  // ── E · Influence & Communication ─────────────────────────────
  {
    key: 'collaboration_conflict',
    name: 'Collaboration, Influence & Conflict Resolution',
    clusterKey: 'influence',
    definition:
      'Builds partnerships and a cohesive team, handles conflict effectively, and influences/negotiates to reach agreement.',
    whyItMatters:
      'DC performance is cross-functional; a leader who cannot partner or resolve conflict creates friction that costs service.',
    isCritical: false,
    weight: 1,
    behaviours: [
      'Builds partnerships across functions',
      'Handles conflict constructively',
      'Influences and negotiates to agreement',
    ],
    businessRisk:
      'Cross-functional friction and silos; conflict festers; hand-offs and service break down.',
    anchors: {
      jpm: {
        text: 'Works well with other shifts/areas; resolves day-to-day conflict in the team; raises issues constructively.',
        target: 3,
      },
      pm: {
        text: 'Builds partnerships with other departments and support functions; handles conflict and negotiates resource and priorities effectively.',
        target: 3,
      },
      dcm: {
        text: 'Builds a cohesive management team; resolves cross-functional conflict; partners with key internal and external stakeholders.',
        target: 3,
      },
      fm: {
        text: 'Partners effectively with DC and operations management, external contractors, auditors and emergency/regulatory authorities; resolves conflict between maintenance needs and operational priorities; builds trusted relationships across all of these.',
        target: 3,
      },
      exec: {
        text: 'Builds strategic partnerships across the business and externally (suppliers, customers, 3PLs); negotiates and influences at senior level.',
        target: 3,
      },
    },
  },
  {
    key: 'communicating_inspiring',
    name: 'Communicating & Inspiring',
    clusterKey: 'influence',
    definition:
      'Communicates frequently, clearly and consistently, and inspires others through a compelling vision.',
    whyItMatters:
      'A team executes what it understands and believes in; weak communication shows up as poor execution.',
    isCritical: false,
    weight: 1,
    behaviours: [
      'Communicates clearly and consistently',
      'Keeps people informed and aligned',
      'Motivates through purpose, not just instruction',
    ],
    businessRisk:
      'Mixed messages and misalignment; change initiatives stall; team disengages.',
    anchors: {
      jpm: {
        text: 'Briefs the shift clearly; gives consistent messages; keeps the team informed and motivated day-to-day.',
        target: 3,
      },
      pm: {
        text: 'Communicates department goals and changes clearly; keeps the team aligned; motivates through purpose, not just instruction.',
        target: 3,
      },
      dcm: {
        text: 'Communicates the site’s direction compellingly; aligns all functions behind it; inspires the site through change.',
        target: 3,
      },
      fm: {
        text: 'Communicates maintenance, security and compliance priorities clearly to the site; aligns operations behind planned downtime and upgrade work; inspires the team through major projects and incidents alike.',
        target: 3,
      },
      exec: {
        text: 'Articulates a compelling vision for the operation; communicates persuasively to the business and external stakeholders; inspires at scale.',
        target: 3,
      },
    },
  },
  {
    key: 'critical_strategic',
    name: 'Critical & Strategic Thinking',
    clusterKey: 'influence',
    definition:
      'Thinks broadly and critically; challenges assumptions; sees the bigger picture and the longer term.',
    whyItMatters:
      'Without it, a leader optimises the immediate and misses the structural; the bar rightly rises sharply with seniority.',
    isCritical: false,
    weight: 1,
    behaviours: [
      'Challenges assumptions constructively',
      'Connects decisions to the bigger picture',
      'Thinks beyond the immediate and short term',
    ],
    businessRisk:
      'Decisions optimise locally and miss structural issues; the operation is run reactively, not strategically.',
    anchors: {
      jpm: {
        text: 'Asks “why”; spots when something doesn’t add up in the area; thinks beyond the immediate task. (Light bar at this level.)',
        target: 3,
      },
      pm: {
        text: 'Looks beyond the department; challenges assumptions constructively; connects decisions to the wider operation.',
        target: 3,
      },
      dcm: {
        text: 'Thinks across the whole site and the medium term; weighs opportunities and risks; challenges the management team’s thinking.',
        target: 3,
      },
      fm: {
        text: 'Thinks across the whole site’s physical and security risk profile over the medium term; weighs investment, compliance and risk trade-offs; challenges the management team’s thinking on asset life-cycle and risk exposure.',
        target: 3,
      },
      exec: {
        text: 'Thinks strategically across the network and long term; reads the environment, sets direction, and stimulates strategic thinking in others.',
        target: 3,
      },
    },
  },
]
