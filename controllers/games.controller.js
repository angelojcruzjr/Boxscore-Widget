// Requirements and GLOBAL Function of accepted URL params
const Game = require('../models/games.model');
const apiUpdater = require('../modifiers/apiUpdate.js')();

const acceptedArgs = {
    away_team: true,
    home_team: true,
    away_period_scores: true,
    home_period_scores: true,
    officials: true,
    event_information: true,
    
}

const nbaArgs = {
    away_stats: true,
    home_stats: true,
    away_totals: true,
    home_totals: true
}

const mlbArgs = {
    away_errors: true,
    home_errors: true,
    away_batters: true,
    home_batter: true,
    away_pitchers: true,
    home_pitchers: true,
    away_fielding: true,
    home_fielding: true,
    away_batter_totals: true,
    home_batter_totals: true,
}

/**
 * @name getSpecificGameStats
 * @description /api/games URL - will return information for a specific type of game
 */
exports.getSpecificGameStats = async (req, res) => {
    // Upper our passed in gameType to deal with case issues
    // and check if it is valid (MLB vs. NBA)
    await apiUpdater.dataUpdate();

    const gameType = req.params.league.toUpperCase();
    const validLeague = validateLeague(gameType);

    // Don't want to parse this
    if (!validLeague) {
        res.send('Incorrect league type, must be "NBA" or "MLB"');
        return;
    }

    // Get our specific game
    Game.findOne({'gameDetails.league': gameType}, (err, game) => {
        if (err) {
            return err;
        }

        // Want to check for any queries first
        if (req.query.stats && validateArg(req.query.stats, gameType)) {
            const dataToFetch = game.gameDetails[req.query.stats];
            let returnData = {};

            // TODO::: We should probably deal with this on the ingest rather than
            // serve level... 
            // Some of our data are primative values...need to convert these to objects
            if (typeof dataToFetch === 'string' || typeof dataToFetch === 'number') {
                returnData[req.query.stats] = dataToFetch;
                res.send(returnData);
            } else {
                res.send(dataToFetch);
            }
        // If there were query params but they are wrong, warn the dev
        } else if (req.query.length > 0) {
            console.warn(`Invalid API argument`);
            res.send(game.gameDetails);
        // Plain old game information
        } else {
            res.send(game.gameDetails);
        }
    });
};

/**
 * @name getAllGameStats
 * @description /api/games URL - will return information for both types of games
 */
exports.getAllGameStats = (req, res) => {
    Game.find({}, (err, games) => {
        if (err) {
            return err;
        }

        let validArg = false;

        // Check to see if we had a proper stats argument
        if (req.query.stats && acceptedArgs[req.query.stats]) {
            validArg = req.query.stats;
        // If there were query params but they are wrong, warn the dev
        } else if (req.query.length > 0) {
            console.warn(`Invalid API arg, accepted args are: ${Object.keys(acceptedArgs)}`);
        }

        res.send(constructReturnArray(games, validArg));
    });
};

/* ============ HELPER FUNCTIONS ========== */

/**
 * @name validArg
 * @param {String} stat stat of interest
 * @param {String} leagueType MLB vs. NBA
 */
function validateArg(stat, leagueType) {
    if (acceptedArgs[stat]) {
        return true;
    } else if (leagueType === 'NBA' && nbaArgs[stat]) {
        return true;
    } else if (leagueType === 'MLB' && mlbArgs[stat]) {
        return true;
    }

    return false;
}

/**
 * @name validLeague
 * @param {String} league Type of game (MLB vs. NBA)
 */
function validateLeague(league) {
    // Only two types of leagues we currently accept
    if (league !== 'NBA' && league !== 'MLB') {
        return false;
    }

    return true;
}

/**
 * @name constructReturnArray
 * @param {Array} games Array of our games 
 * @param {String | false} queryNoun Stats query noun 
 */
function constructReturnArray(games, queryNoun) {
    let returnArray = [];

    // Iterate through our games
    for (let i = 0; i < games.length; i++) {
        let arrayEle = {};

        // If we have a specific query noun, use it
        if (queryNoun) {
            arrayEle[games[i].gameDetails.league] = games[i].gameDetails[queryNoun]
        } else {
            arrayEle = games[i].gameDetails;
        }

        // Push the result into the array we will return
        returnArray.push(arrayEle);
    }

    return returnArray;
}