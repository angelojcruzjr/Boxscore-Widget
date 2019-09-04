const Game = require('../models/games.model');
Request = require('request');

/**
 * @class apiUpdater
 * @description Drives all of our updating action to the given
 *              url endpoints aka serves as a liason between Node
 *              and Mongo.
 */
class apiUpdater {
    /**
     * @constructor
     */
    constructor() {
        // Consider these our "tweakables"
        this.urls = {
            mlb: 'https://chumley.barstoolsports.com/dev/data/games/eed38457-db28-4658-ae4f-4d4d38e9e212.json',
            nba: 'https://chumley.barstoolsports.com/dev/data/games/6c974274-4bfc-4af8-a9c4-8b926637ba74.json'
        }
        this.secondComparator = 15.0;
    }

    /**
     * @name checkGameExists
     * @param {String} gameType Type of game (MLB vs. NBA)
     * @returns {Promise} Does our Mongo DB already contain a record
     *                    for this type of game?
     */
    checkGameExists(gameType) {
        return new Promise((res, rej) => {
            // Look through our games
            Game.find({}, (err, data) => {
                if (err) {
                    rej(err);
                }
            })
                .exec()
                // If we have it, return an object of crucial details
                .then((data) => {
                    res(this.getGameLastCreated(data, gameType.toUpperCase()));
                })
                .catch((err) => {
                    return err;
                });
        });
    }

    /**
     * @name getGameLastCreated
     * @param {Object} games JS Object of Games
     * @param {String} gameType Type of game (MLB vs. NBA)
     * @returns {Object | false} Game details object or false if does not exist
     */
    getGameLastCreated(games, gameType) {
        // Iterate through our games
        for (let game in games) {
            // If we see a match on gameTypes we already have this type of game
            if (games[game].gameDetails.league === gameType) {
                return {
                    updatedAt: games[game].updatedAt,
                    id: games[game]._id
                };
            }
        }

        return false;
    }

    /**
     * @name dataUpdate
     * @returns {void}
     */
    dataUpdate() {
        return new Promise((res, rej) => {
            // Iterate through our urls
            for (let key in this.urls) {
                if (this.urls.hasOwnProperty(key)) {
                    // Check if we have the game already
                    this.checkGameExists(key)
                        .then((existingEntry) => {
                            // If we do and haven't updated recently
                            if (existingEntry && this.updateTooStale(existingEntry.updatedAt)) {
                                this.updateData(this.urls[key], existingEntry.id)
                                    .then((resp) => {
                                        if (resp) {
                                            res(true);
                                        } else {
                                            rej('Something went wrong updating...');
                                        }
                                    })
                                    .catch((err) => {
                                        rej(err);
                                    });
                                // Case that it doesn't already exist, create it
                            } else if (!existingEntry) {
                                this.saveData(this.urls[key])
                                    .then((resp) => {
                                        if (resp) {
                                            res(false);
                                        } else {
                                            rej('Something went wrong creating...');
                                        }
                                    })
                                    .catch((err) => {
                                        rej(err);
                                    });
                                // Else, no need to update! Just send what's already in Mongo
                            } else {
                                res(false);
                            }
                        })
                        .catch((err) => {
                            rej(err);
                        });
                } else {
                    rej('Somethings not right...');
                }
            }
        });
    }

    /**
     * @name updateTooStale
     * @param {Date} timeLastUpdated Time last updated
     * @returns {Boolean} Is the diff between timeLastUpdated and the current time
     *                    greater than our secondComparator?
     */
    updateTooStale(timeLastUpdated) {
        const currTime = new Date();

        return ((currTime - timeLastUpdated) / 1000) > this.secondComparator;
    }

    /**
     * @name fetchAPIData
     * @param {String} url url endpoint to hit
     * @returns {Promise} Data resulting from the given endpoint 
     */
    fetchAPIData(url) {
        try {
            return new Promise((res, rej) => {
                // Try to fetch our data
                Request.get(url, (err, resp, body) => {
                    if (err) {
                        rej(err);
                    }

                    // We got it, make sure we parse!
                    res(JSON.parse(body));
                });
            });
        } catch (err) {
            return err;
        }
    }

    /**
     * @name saveData
     * @param {String} url URL endpoint to hit
     * @returns {void}
     */
    saveData(url) {
        return new Promise((res, rej) => {
            // Get our json response data
            this.fetchAPIData(url)
                .then((jsonData) => {
                    // Create a new game with it
                    let newGame = new Game();
                    newGame.gameDetails = jsonData;

                    newGame.save()
                        .exec()
                        .then((doc) => {
                            // After it has saved, then we can go back to the previous flow
                            if (doc) {
                                res(true)
                            } else {
                                rej('Something went wrong creating our data...');
                            }
                        })
                        .catch((err) => {
                            rej(err);
                        });
                })
                .catch((err) => {
                    rej(err);
                })
        });
    }

    /**
     * @name updateData
     * @param {String} url URL endpoint to hit
     * @param {String} id Unique collection _id
     * @returns {void} 
     */
    updateData(url, id) {
        return new Promise((res, rej) => {
            // Get our json response data
            this.fetchAPIData(url)
                .then((jsonData) => {
                    // Use it to update
                    Game.update({ _id: id }, { $set: { gameDetails: jsonData } })
                        .exec()
                        .then((doc) => {
                            // After we've updated, then we can go back to the previous flow
                            if (doc) {
                                res(true);
                            } else {
                                rej('Something went wrong updating...');
                            }
                        });
                })
                .catch((err) => {
                    rej(err);
                })
        });
    }
};

module.exports = () => { return new apiUpdater() }