/**
 * Interview round display helpers (aligned with backend rounds-schemas.js)
 */

export const ROUND_TYPES = [
  'oa',
  'assignment',
  'technical',
  'hr',
  'group_discussion',
  'managerial',
  'final',
  'other',
];

export const ROUND_RESULTS = ['pending', 'cleared', 'rejected', 'skipped'];

export const ROUND_TYPE_LABELS = {
  oa: 'Online Assessment',
  assignment: 'Assignment',
  technical: 'Technical Interview',
  hr: 'HR Interview',
  group_discussion: 'Group Discussion',
  managerial: 'Managerial',
  final: 'Final Round',
  other: 'Other',
};

export const ROUND_RESULT_LABELS = {
  pending: 'Pending',
  cleared: 'Cleared',
  rejected: 'Rejected',
  skipped: 'Skipped',
};

export const ROUND_RESULT_STYLES = {
  pending: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  cleared: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  skipped: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export const supportsInterviewRounds = (category) => category === 'internship';

export const getRoundTypeLabel = (roundType) =>
  ROUND_TYPE_LABELS[roundType] || roundType;

export const getRoundResultLabel = (result) =>
  ROUND_RESULT_LABELS[result] || result;

/**
 * Compact card label from synced opportunity fields.
 */
export const getRoundSummaryLabel = (opportunity) => {
  if (!opportunity || !supportsInterviewRounds(opportunity.category)) {
    return null;
  }

  if (opportunity.rejected_round_number) {
    return `Rejected at Round ${opportunity.rejected_round_number}`;
  }

  if (opportunity.current_round_number) {
    return `Round ${opportunity.current_round_number} · In progress`;
  }

  return null;
};

export const getNextRoundNumber = (rounds) => {
  if (!rounds?.length) return 1;
  return Math.max(...rounds.map((r) => r.round_number)) + 1;
};
