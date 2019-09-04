// Two choices, either NBA or MLB, 
// if you have npm running the boxscore should
// automatically update
export const LEAGUETYPE = 'NBA';

export const periods = {
    MLB: {
        normal: '<CARDNUM> Inning',
        small: '<NUM>',
        OT: '<NUM>',
        otCount: 9,
        extras: [
            {
                'R': {
                    awayStat: 'away_batter_totals',
                    awaySubStat: 'runs',
                    homeStat: 'home_batter_totals',
                    homeSubStat: 'runs'
                }
            },
            {
                'H': {
                    awayStat: 'away_batter_totals',
                    awaySubStat: 'hits',
                    homeStat: 'home_batter_totals',
                    homeSubStat: 'hits'
                }
            },
            {
                'E': {
                    awayStat: 'away_errors',
                    awaySubStat: 'away_errors',
                    homeStat: 'home_errors',
                    homeSubStat: 'home_errors'
                }
            }
        ]
    },
    NBA: {
        normal: '<CARDNUM> Quarter',
        small: 'Q<NUM>',
        OT: 'OT<NUM>',
        otCount: 4,
        extras: [
            {
                'T': {
                    awayStat: '<TOTAL>',
                    homeStat: '<TOTAL>',
                    awaySubStat: false,
                    homeSubStat: false
                }
            }
        ]
    }
};

export const playerStats = {
    NBA: {
        searchBy: 'points',
        alsoShow: ['assists', 'defensive_rebounds', 'offensive_rebounds']
    },
    MLB: {
        searchBy: ['win', 'loss', 'save'],
        alsoShow: ['innings_pitched', 'earned_runs', 'strike_outs', 'era']
    }
};