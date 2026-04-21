/**
 * League State Model — 9898-MTG-League
 *
 * Data structures for seasons, players, matches, and standings.
 * Persistence is via static JSON files in data/league/.
 */

/**
 * @typedef {object} LeagueMatch
 * @property {string} id          - Unique match ID ('match-<timestamp>')
 * @property {string} date        - ISO 8601 date string
 * @property {string} player1     - Player 1 name
 * @property {string} player2     - Player 2 name
 * @property {string|null} winner - Winner name, or null for draw
 * @property {string} format      - Game format (default: 'chaos-rpg')
 * @property {number} turns       - Number of turns played
 * @property {string} [notes]     - Optional match notes
 */

/**
 * @typedef {object} LeagueStanding
 * @property {string} player   - Player name
 * @property {number} wins
 * @property {number} losses
 * @property {number} draws
 * @property {number} points   - 3 per win, 1 per draw, 0 per loss
 * @property {number} winRate  - wins / (wins + losses + draws)
 * @property {number} played   - Total games played
 */

/**
 * @typedef {object} LeagueSeason
 * @property {number}           season      - Season number (1-indexed)
 * @property {string}           startDate   - ISO 8601
 * @property {string|null}      endDate     - ISO 8601, null if active
 * @property {boolean}          active      - Whether this is the current season
 * @property {LeagueMatch[]}    matches     - All matches in this season
 * @property {LeagueStanding[]} standings   - Sorted standings (updated after each match)
 */

/**
 * Create a new empty season object.
 * @param {number} seasonNumber
 * @returns {LeagueSeason}
 */
export function createSeason(seasonNumber) {
    return {
        season: seasonNumber,
        startDate: new Date().toISOString(),
        endDate: null,
        active: true,
        matches: [],
        standings: [],
    };
}

/**
 * Recalculate standings from the match list.
 * @param {LeagueMatch[]} matches
 * @returns {LeagueStanding[]}
 */
export function calculateStandings(matches) {
    /** @type {Map<string, LeagueStanding>} */
    const map = new Map();

    const getPlayer = (name) => {
        if (!map.has(name)) {
            map.set(name, {
                player: name,
                wins: 0,
                losses: 0,
                draws: 0,
                points: 0,
                winRate: 0,
                played: 0,
            });
        }
        return map.get(name);
    };

    for (const match of matches) {
        const p1 = getPlayer(match.player1);
        const p2 = getPlayer(match.player2);

        p1.played++;
        p2.played++;

        if (match.winner === match.player1) {
            p1.wins++;
            p1.points += 3;
            p2.losses++;
        } else if (match.winner === match.player2) {
            p2.wins++;
            p2.points += 3;
            p1.losses++;
        } else {
            // Draw
            p1.draws++;
            p1.points += 1;
            p2.draws++;
            p2.points += 1;
        }
    }

    // Calculate win rates
    for (const standing of map.values()) {
        standing.winRate =
            standing.played > 0 ? Math.round((standing.wins / standing.played) * 1000) / 1000 : 0;
    }

    // Sort: points desc, winRate desc, played desc
    return [...map.values()].sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        if (b.winRate !== a.winRate) {
            return b.winRate - a.winRate;
        }
        return b.played - a.played;
    });
}
