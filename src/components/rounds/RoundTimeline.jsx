import React from 'react';
import { FaCheckCircle, FaClock, FaTimesCircle, FaForward } from 'react-icons/fa';
import { formatDate } from '../../utils/dateHelpers';
import {
  getRoundResultLabel,
  getRoundTypeLabel,
  ROUND_RESULT_STYLES,
} from '../../utils/roundHelpers';

const RESULT_ICONS = {
  pending: FaClock,
  cleared: FaCheckCircle,
  rejected: FaTimesCircle,
  skipped: FaForward,
};

/**
 * Presentational vertical timeline for interview rounds.
 */
const RoundTimeline = ({
  rounds = [],
  currentRoundNumber = null,
  rejectedRoundNumber = null,
  onEditRound,
}) => {
  const sortedRounds = [...rounds].sort((a, b) => a.round_number - b.round_number);

  if (sortedRounds.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/15 bg-white/5 p-4 text-center text-sm text-gray-400">
        No rounds yet. Add your first round after applying.
      </div>
    );
  }

  const activePending = sortedRounds.find((round) => round.result === 'pending');

  return (
    <div className="space-y-4">
      {rejectedRoundNumber && (
        <div
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          role="status"
        >
          Rejected at Round {rejectedRoundNumber}
        </div>
      )}

      {!rejectedRoundNumber && activePending && (
        <div
          className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-200"
          role="status"
        >
          Preparing for Round {activePending.round_number} · {getRoundTypeLabel(activePending.round_type)}
        </div>
      )}

      <ol className="space-y-0" aria-label="Interview rounds">
        {sortedRounds.map((round, index) => {
          const Icon = RESULT_ICONS[round.result] || FaClock;
          const isActive = currentRoundNumber === round.round_number;
          const isLast = index === sortedRounds.length - 1;

          return (
            <li key={round.id} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast && (
                <span
                  className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-white/10"
                  aria-hidden="true"
                />
              )}

              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                  isActive ? 'border-blue-400 bg-blue-500/20' : 'border-white/20 bg-white/5'
                }`}
              >
                <Icon
                  className={
                    round.result === 'cleared'
                      ? 'text-green-400'
                      : round.result === 'rejected'
                        ? 'text-red-400'
                        : round.result === 'skipped'
                          ? 'text-gray-400'
                          : 'text-blue-400'
                  }
                  size={14}
                />
              </div>

              <div className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Round {round.round_number} · {getRoundTypeLabel(round.round_type)}
                    </p>
                    {round.scheduled_date && (
                      <p className="mt-1 text-xs text-gray-400">
                        Scheduled {formatDate(round.scheduled_date)}
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      ROUND_RESULT_STYLES[round.result] ||
                      'bg-gray-500/10 text-gray-400 border-gray-500/20'
                    }`}
                  >
                    {getRoundResultLabel(round.result)}
                  </span>
                </div>

                {round.notes && (
                  <p className="mt-3 text-sm text-gray-300 whitespace-pre-wrap">{round.notes}</p>
                )}

                {onEditRound && (
                  <button
                    type="button"
                    onClick={() => onEditRound(round)}
                    className="mt-3 text-xs font-medium text-blue-400 hover:text-blue-300"
                  >
                    Edit round
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default RoundTimeline;
