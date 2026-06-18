const { getRoundTypeLabel } = require('./roundLabels');

const roundToOneDecimal = (num) => Math.round(num * 10) / 10;

function groupRoundsByOpportunity(rounds) {
    const map = {};
    for (const round of rounds) {
        if (!map[round.opportunity_id]) {
            map[round.opportunity_id] = [];
        }
        map[round.opportunity_id].push(round);
    }
    return map;
}

function findRejectedRoundRecord(rounds, rejectedRoundNumber) {
    if (!rounds?.length || !rejectedRoundNumber) {
        return null;
    }

    return (
        rounds.find(
            (round) => round.round_number === rejectedRoundNumber && round.result === 'rejected'
        ) || rounds.find((round) => round.round_number === rejectedRoundNumber)
    );
}

function formatRejectionStage(roundNumber, roundType) {
    if (roundNumber && roundType) {
        return `Round ${roundNumber} · ${getRoundTypeLabel(roundType)}`;
    }
    if (roundNumber) {
        return `Round ${roundNumber}`;
    }
    return 'Stage not recorded';
}

/**
 * Build internship interview-pipeline analytics for dashboards and reports.
 */
function buildInterviewPipelineAnalytics(opportunities, rounds = []) {
    const internships = opportunities.filter((opp) => opp.category === 'internship');
    const roundsByOpportunity = groupRoundsByOpportunity(rounds);

    const rejectionByRoundNumber = {};
    const rejectionByRoundType = {};
    const rejections = [];
    let roundsBeforeRejectionSum = 0;
    let rejectionWithRoundNumber = 0;

    for (const opp of internships) {
        if (opp.status !== 'rejected') {
            continue;
        }

        const oppRounds = roundsByOpportunity[opp.id] || [];
        const roundNumber = opp.rejected_round_number;
        const rejectedRound = findRejectedRoundRecord(oppRounds, roundNumber);
        const roundType = rejectedRound?.round_type || null;

        if (roundNumber) {
            rejectionByRoundNumber[roundNumber] = (rejectionByRoundNumber[roundNumber] || 0) + 1;
            rejectionWithRoundNumber += 1;
            roundsBeforeRejectionSum += roundNumber;
        }

        if (roundType) {
            rejectionByRoundType[roundType] = (rejectionByRoundType[roundType] || 0) + 1;
        }

        rejections.push({
            opportunityId: opp.id,
            title: opp.title,
            roundNumber,
            roundType,
            roundTypeLabel: formatRejectionStage(roundNumber, roundType),
            clearedRoundsBeforeRejection: roundNumber ? Math.max(roundNumber - 1, 0) : 0
        });
    }

    rejections.sort((a, b) => {
        if (a.roundNumber === b.roundNumber) {
            return a.title.localeCompare(b.title);
        }
        return (a.roundNumber || 999) - (b.roundNumber || 999);
    });

    const activeInPipeline = internships.filter((opp) =>
        ['applied', 'shortlisted', 'interviewed'].includes(opp.status)
    ).length;

    return {
        internshipCount: internships.length,
        trackedWithRounds: internships.filter((opp) => (roundsByOpportunity[opp.id]?.length || 0) > 0).length,
        activeInPipeline,
        rejectedCount: rejections.length,
        averageRoundsBeforeRejection:
            rejectionWithRoundNumber > 0
                ? roundToOneDecimal(roundsBeforeRejectionSum / rejectionWithRoundNumber)
                : null,
        rejectionByRoundNumber: Object.entries(rejectionByRoundNumber)
            .map(([roundNumber, count]) => ({
                roundNumber: Number(roundNumber),
                count
            }))
            .sort((a, b) => a.roundNumber - b.roundNumber),
        rejectionByRoundType: Object.entries(rejectionByRoundType)
            .map(([roundType, count]) => ({
                roundType,
                label: getRoundTypeLabel(roundType),
                count
            }))
            .sort((a, b) => b.count - a.count),
        rejections
    };
}

module.exports = {
    buildInterviewPipelineAnalytics,
    groupRoundsByOpportunity,
    findRejectedRoundRecord,
    formatRejectionStage
};
