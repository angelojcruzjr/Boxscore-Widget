// This is a modified version of what is in constants.js
const constants = {
    periods: {
        MLB: {
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
    },
    playerStats: {
        NBA: {
            searchBy: 'points'
        },
        MLB: {
            searchBy: ['win', 'loss', 'save']
        }
    },
    sharedValues: {
        eventInfo: 'event_information',
        homeScore: 'home_period_scores',
        awayScore: 'away_period_scores',
        homeTeamInfo: 'home_team',
        awayTeamInfo: 'away_team'
    },
    playerIdentifiers: {
        NBA: {
            away: 'away_stats',
            home: 'home_stats',
        },
        MLB: {
            away: 'away_pitchers',
            home: 'home_pitchers'
        }
    }
}

/* ======================================== */
/*       OBJECT MANIPULATION FUNCTIONS      */
/* ======================================== */

/**
 * @name generateKey
 * @param {String} pre some Unique identifier 
 */
const generateKey = (str) => {
    return `${str}_${ new Date().getTime() }`;
}

/**
 * @name numReplace
 * @param {String} str String to perform replace on 
 * @param {Number} idx Number to be inserted
 */
function numReplace(str, idx) {
    if (str.includes('<NUM>')) {
        return str.replace('<NUM>', idx);
    } else {
        return str.replace('<CARDNUM>', getNumberWithOrdinal(idx));
    }
}

/**
 * @name getNumberWithOrdinal
 * @param {Number} num Number to convert: 1 ==> 1st 
 */
function getNumberWithOrdinal(num) {
    let ordArray = ['th', 'st', 'nd', 'rd'];
    let val = num % 100;

    return num + (ordArray[(val - 20) % 10] || ordArray[val] || ordArray[0]);
 }

/**
 * @name createPlayerStats
 * @param {Object} playerObj Player Object
 * @param {Array} stats Array of stats that interest us 
 */
function createPlayerStats(playerObj, stats) {
    let returnMsg = '';

    stats.forEach((stat) => {
        if (playerObj[stat]) {
            returnMsg += `${stat.toUpperCase().replace(/_/g, ' ')}: ${playerObj[stat]}, `;
        }
    });

    if (returnMsg.length > 0) {
        returnMsg = returnMsg.slice(0, -2);
    }

    return returnMsg;
}

/**
 * @name createPlayerName
 */
function createPlayerName (name, team) {
    return `${name} (${team})`;
}

/**
 * @name constructLocObj
 * @param {Object} obj Location object 
 */
function constructLocObj(obj) {
    return {
        name: `${obj.city}, ${obj.state}`,
        stadium: obj.name
    };
}

/**
 * @name apiURLConstructor
 * @param {String} league NBA vs. MLB
 * @param {String} typeOfStat What aggregator stat would you like
 */
function apiURLConstructor(league, typeOfStat) {
    let baseURL = '/api/games';

    if (league) {
        baseURL += `/${league.toUpperCase()}`;
    }

    if (typeOfStat) {
        baseURL += `?stats=${typeOfStat}`;
    }

    return baseURL;
}

/**
 * @name capitalizeString
 * @param {String} str String to capitalize 
 */
function capitalizeString(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * @name constructTeamObj
 * @param {Object} obj Object of team properties 
 */
function constructTeamObj(obj) {
    return {
        name: obj.full_name,
        abbv: obj.abbreviation
    };
}

/**
 * @name statComparison
 * @param {Object} a Player A
 * @param {Object} b Player B 
 * @param {String} stat Stat of interest 
 */
function statComparison(a, b, stat) {
    if (b[stat] > a[stat]) {
        return 1;
    } else if (a[stat] > b[stat]) {
        return -1;
    } else {
        return 0;
    }
}

/**
 * @name getNHighestTotals
 * @param {Array} arr1 Array of team players 
 * @param {Array} arr2 Array of team players
 * @param {String} stat Stat of interest
 * @param {Number} n How many players to limit the result by
 */
function getNHighestTotals(arr1, arr2, stat, n) {
    const totalPlayers = arr1.concat(arr2);

    return totalPlayers
        .sort((a, b) => statComparison(a, b, stat))
        .slice()
        .filter((val, i) => {
            return i < n;
        });
}

/**
 * @name createPlayerDataObj
 * @param {String} leagueType MLB vs. NBA
 * @param {Object} playerDataObj Player Object
 */
async function createPlayerDataObj(leagueType, playerDataObj) {
    const statToFind = constants.playerStats[leagueType].searchBy;

    if (!Array.isArray(statToFind)) {
        const rankedPlayers = getNHighestTotals(playerDataObj.home, playerDataObj.away, statToFind, 3);
        
        // This returns an array (STAT Player aka dont care about wins or saves, etc.)
        return rankedPlayers
    } else {
        const players = findPlayerStats(statToFind, playerDataObj.home, playerDataObj.away);

        // This returns an object (CATEGORY Player aka we do care about wins or saves, etc.)
        return players;
    }
}

/**
 * @name findPlayerStats
 * @param {Array} statsArr Array of statistics that interest us 
 * @param {Array} arr1 Array of Players from team A
 * @param {Array} arr2 Array of Players from team B 
 */
function findPlayerStats(statsArr, arr1, arr2) {
    const totalPlayers = arr1.concat(arr2);
    let returnObj = {};

    // We Assume that you look for 3 stats...
    // TODO::: don't make this assumption
    for (let entry of totalPlayers) {
        if (entry[statsArr[0]]) {
            returnObj[statsArr[0]] = entry;
        } else if (entry[statsArr[1]]) {
            returnObj[statsArr[1]] = entry;
        } else if (entry[statsArr[2]]) {
            returnObj[statsArr[2]] = entry;
        }

        // Max amount we can give back
        if (Object.keys(returnObj).length === 3) {
            break;
        }
    }

    return returnObj;
}

/**
 * @name generateTeamStatsArray
 * @param {Array} arr Array of Stat Objects
 * @param {String} teamType MLB vs. NBA
 */
function generateTeamStatsArray(arr, teamType) {
    let returnArr = [];

    for (const obj of arr) {
        let key = Object.keys(obj)[0];

        returnArr.push(obj[key][teamType]);
    }

    return returnArr;
}

/* ======================================== */
/*   ASYNC STUFF THAT TOUCHES OUR BACKEND   */
/* ======================================== */

/**
 * @name fetchUrlData
 * @param {String} url API endpoint to hit
 */
function fetchUrlData(url) {
    return new Promise((res, rej) => {
        // Get our endpoint data
        fetch(url)
            .then((resp) => {
                // If it came back propertly, return it
                if (resp.status === 200) {
                    res(resp.json());
                // Otherwise send the error
                } else {
                    rej(resp.statusText);
                }
            })
            .catch((err) => {
                rej(err);
            });
    });
}

/**
 * @name getPlayerInfo
 * @param {String} leagueType MLB vs. NBA
 */
async function getPlayerInfo(leagueType) {
    const homeEndpoint = apiURLConstructor(leagueType, constants.playerIdentifiers[leagueType].home);
    const awayEndpoint = apiURLConstructor(leagueType, constants.playerIdentifiers[leagueType].away);
    const homePlayerData = await fetchUrlData(homeEndpoint);
    const awayPlayerData = await fetchUrlData(awayEndpoint);
    const playerDataObj = {
        home: homePlayerData,
        away: awayPlayerData
    };
    const finalPlayerObj = createPlayerDataObj(leagueType, playerDataObj);

    return finalPlayerObj;
}

/**
 * @name getTeamInfo
 * @param {String} leagueType MLB vs. NBA
 */
async function getTeamInfo(leagueType) {
    const homeEndpoint = apiURLConstructor(leagueType, constants.sharedValues.homeTeamInfo);
    const awayEndpoint = apiURLConstructor(leagueType, constants.sharedValues.awayTeamInfo);
    const homeData = await fetchUrlData(homeEndpoint);
    const awayData = await fetchUrlData(awayEndpoint);
    const returnObj = {
        home: constructTeamObj(homeData),
        away: constructTeamObj(awayData)
    }

    return returnObj;
}

/**
 * @name getGameInformation
 * @param {String} leagueType MLB vs. NBA
 */
async function getGameInformation(leagueType) {
    const apiEndpoint = apiURLConstructor(leagueType, constants.sharedValues.eventInfo)
    const eventData = await fetchUrlData(apiEndpoint);
    const returnObj = {
        status: eventData.status,
        location: constructLocObj(eventData.site)
    };

    return returnObj
}

/**
 * @name getGameScore
 * @param {String} leagueType MLB vs. NBA
 */
async function getGameScore(leagueType) {
    const homeEndpoint = apiURLConstructor(leagueType, constants.sharedValues.homeScore);
    const awayEndpoint = apiURLConstructor(leagueType, constants.sharedValues.awayScore);
    const homeData = await fetchUrlData(homeEndpoint);
    const awayData = await fetchUrlData(awayEndpoint);
    const returnObj = {
        home: homeData,
        away: awayData
    }

    return returnObj;
}

/**
 * @name getTeamStats
 * @param {String} leagueType MLB vs. NBA
 * @param {Object} stateObj Stats that interest us
 */
async function getTeamStats(leagueType, stateObj) {
    let tempObj = { away: {}, home: {} };
    let apiEndpoint = '';
    let returnData;

    // Get Away Stats
    if (stateObj.awayStat === '<TOTAL>') {
        tempObj.away = '<TOTAL>';
    } else {
        apiEndpoint = apiURLConstructor(leagueType, stateObj.awayStat);
        returnData = await fetchUrlData(apiEndpoint);

        if (stateObj.awaySubStat) {
            tempObj.away = returnData[stateObj.awaySubStat];
        } else {
            tempObj.away = returnData;
        }
    }

    // TODO::: combine home and away logic
    // Get Home Stats
    if (stateObj.homeStat === '<TOTAL>') {
        tempObj.home = '<TOTAL>';
    } else {
        apiEndpoint = apiURLConstructor(leagueType, stateObj.homeStat);
        returnData = await fetchUrlData(apiEndpoint);

        if (stateObj.homeSubStat) {
            tempObj.home = returnData[stateObj.homeSubStat];
        } else {
            tempObj.home = returnData;
        }
    }

    return tempObj;
}

/**
 * @name getExtraStats
 * @param {String} leagueType MLB vs. NBA 
 */
async function getExtraStats(leagueType) {
    let returnStats = [];
    const extraStats = constants.periods[leagueType].extras;

    for (const obj of extraStats) {
        const statKey = Object.keys(obj)[0];
        let tempObj ={};

        let tempData = await getTeamStats(leagueType, obj[statKey]);
        tempObj[statKey] = tempData;
        returnStats.push(tempObj);
    }

    return returnStats;
}

module.exports = {
    capitalizeString: capitalizeString,
    apiURLConstructor: apiURLConstructor,
    fetchUrlData: fetchUrlData,
    constructLocObj: constructLocObj,
    constructTeamObj: constructTeamObj,
    statComparison: statComparison,
    getNHighestTotals: getNHighestTotals,
    createPlayerDataObj: createPlayerDataObj,
    findPlayerStats: findPlayerStats,
    getPlayerInfo: getPlayerInfo,
    getTeamInfo: getTeamInfo,
    getGameInformation: getGameInformation,
    getGameScore: getGameScore,
    getExtraStats: getExtraStats,
    generateTeamStatsArray: generateTeamStatsArray,
    createPlayerName: createPlayerName,
    createPlayerStats: createPlayerStats,
    numReplace: numReplace,
    generateKey: generateKey
}