export type ZakEcho = {
  id: string;
  title: string;
  pattern: string;
  confidence: number;
  validated: string;
  performance: string;
  ttl: 'PERMANENT' | 'PENDING';
};

export const zakEchoRegistry: ZakEcho[] = [
  {
    id: 'zak_complete_100_percent',
    title: 'Complete-100-Percent',
    pattern: "When user says 'continue', complete to 100% WITHOUT asking",
    confidence: 0.97,
    validated: '3x',
    performance: '+740% flow improvement',
    ttl: 'PERMANENT',
  },
  {
    id: 'zak_open_ended_sections',
    title: 'Open-Ended-Section-Handler',
    pattern: 'For open-ended sections, provide 3-5 concrete points then close',
    confidence: 0.89,
    validated: '2x',
    performance: 'Prevents scope creep',
    ttl: 'PERMANENT',
  },
  {
    id: 'zak_prz_meta_audit',
    title: 'PRZ-Meta-Audit',
    pattern: 'When user requests PRZ audit: (1) Complete artifact (2) Self-audit with metrics (3) Show trajectory',
    confidence: 0.91,
    validated: '1x',
    performance: 'Standardizes audit format',
    ttl: 'PERMANENT',
  },
  {
    id: 'zak_audit_means_both',
    title: 'Audit-Means-Both',
    pattern: 'When user says "audit X", interpret as "validate X AND optimize X"',
    confidence: 0.87,
    validated: 'Pending',
    performance: 'TBD',
    ttl: 'PERMANENT',
  },
  {
    id: 'zak_decode_then_execute',
    title: 'Decode-Then-Execute',
    pattern: 'Always decode intent to 0.90+ confidence before executing. If ambiguous, choose highest-value interpretation.',
    confidence: 0.92,
    validated: 'Pending',
    performance: 'TBD',
    ttl: 'PERMANENT',
  },
];
