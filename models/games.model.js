const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let homeTeamSchema = new Schema(
    {
        gameDetails: Schema.Types.Mixed
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Game', homeTeamSchema);