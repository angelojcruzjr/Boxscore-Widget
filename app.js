// app.js - main backend file

/* ========== Requirements =========== */
const express = require('express');
const bodyParser = require('body-parser');
const apiUpdater = require('./modifiers/apiUpdate.js')();
const game = require('./routes/games.route'); // Imports routes for the products

/* ========== INITIALIZE OUR APP =========== */
const app = express();

/* ========== MONGO CONNECTOR =========== */
const mongoose = require('mongoose');
const db_url = 'mongodb+srv://admin:adminuser1234@boxscorecluster-lukjz.mongodb.net/test?retryWrites=true&w=majority';
const mongoDB = process.env.MONGODB_URI || db_url;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

/* ========== INITIALIZE BODYPARSER =========== */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/api', game);

/* ========== GLOBAL CONSTANTS =========== */
const port = 8080;

app.listen(port, () => {});