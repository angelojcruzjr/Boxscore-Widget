import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as constants from './constants/constants.js'
import * as utils from './utils/utils.js'

/**
 * Player component that shows the names of high
 * performing/players of interest
 */
class PlayerContainer extends React.Component {
    /**
     * @name constructStatPlayer
     * @param {Object} playerObj Player Object
     */
    constructStatPlayer(playerObj) {
        const stat = constants.playerStats[this.props.league].searchBy
        let playerPerformance = '';
        playerPerformance += `${utils.capitalizeString(stat)}: ${playerObj[stat]}`;

        return (
            <div className="player-card"
                 key={utils.generateKey(playerObj.display_name)}>
                <div className="stats">
                    <div className="player-divider">
                        {utils.createPlayerName(playerObj.display_name, playerObj.team_abbreviation)}
                    </div>
                    <div className="player-divider">
                        {playerPerformance}
                    </div>
                    {
                        constants.playerStats[this.props.league].alsoShow.length > 0 &&
                        <div className="player-divider">
                            {utils.createPlayerStats(playerObj, constants.playerStats[this.props.league].alsoShow)}
                        </div>
                    }
                </div>
            </div>
        );
    }

    /**
     * @name constructCategoryPlayer
     * @param {String} category What is the category that we care about
     * @param {Object} playerObj Player Object
     */
    constructCategoryPlayer(category, playerObj) {
        const alsoShow = constants.playerStats[this.props.league].alsoShow;

        if (alsoShow.length > 0) {
            return (
                <div className="player-card"
                     key={utils.generateKey(playerObj.display_name)}>
                    <div className="stats">
                        <div className="player-divider">
                            {utils.createPlayerName(playerObj.display_name, playerObj.team_abbreviation)}
                        </div>
                        <div className="player-divider">
                            {category.toUpperCase()}
                        </div>
                        <div className="player-divider">
                            {utils.createPlayerStats(playerObj, alsoShow)}
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="player-card"
                     key={utils.generateKey(playerObj.display_name)}>
                    <div className="stats">
                        <div className="player-divider">
                            {utils.createPlayerName(playerObj.display_name, playerObj.team_abbreviation)}
                        </div>
                        <div className="player-divider">
                            {category.toUpperCase()}
                        </div>
                    </div>
                </div>
            );
        }
    }

    render() {
        let players = [];

        if (Array.isArray(this.props.playerInfo)) {
            this.props.playerInfo.forEach((player) => {
                players.push(this.constructStatPlayer(player));
            });
        } else {
            for (let key in this.props.playerInfo) {
                if (this.props.playerInfo.hasOwnProperty(key)) {
                    players.push(this.constructCategoryPlayer(key, this.props.playerInfo[key]));
                }
            }
        }

        return (
            <div className="player-container">
                <div className="players">
                    {players}
                </div>
            </div>
        );
    }
}

/**
 * Overall holder for our Game (upper portion), which
 * is composed of the name of the teams, game status,
 * and the current score(s)
 */
class GameContainer extends React.Component {
    render() {
        return (
            <div className="game-container">
                <TeamColumn gameStatus={this.props.gameStatus}
                    teams={this.props.teams}
                    useSmall={this.props.useSmall} />
                <ScoreTable useSmall={this.props.useSmall}
                    gameScore={this.props.gameScore}
                    league={this.props.league}
                    extraStats={this.props.extraStats} />
            </div>
        );
    }
}

/**
 * Score table which list the periods and other miscellaneous
 * stats that we might be interested in (R, H, E for MLB)
 */
class ScoreTable extends React.Component {
    /**
     * @name createHeaderRow
     * @param {Number} periodLen How many periods
     * @param {Array} extraStatHeaders What other stats do we care about
     */
    createHeaderRow(periodLen, extraStatHeaders) {
        const tempArr = Array.apply(null, Array(periodLen))
            .map((x, i) => { 
                return i + 1;
            });

        return (
            <tr key={utils.generateKey(periodLen)}>
                {
                    tempArr.map((val, i) => {
                        return <td className="score-cell" key={i}>{this.generateHeaderLabel(val)}</td>;
                    })
                }
                {
                    extraStatHeaders.map((header) => {
                        return <td className="score-cell" key={utils.generateKey(header)}>{header}</td>
                    })
                }
            </tr>
        );
    }

    /**
     * @name createScoreRow
     * @param {Array} scores Array of scores for this team
     * @param {Array} extraStats Extra stats for this team
     */
    createScoreRow(scores, extraStats) {
        const randKey = Math.random()*1000

        return (
            <tr key={utils.generateKey(randKey)}>
                {
                    scores.map((val, i) => {
                        return <td className="score-cell" key={utils.generateKey(i)}>{val}</td>
                    })
                }
                {
                    extraStats.map((val, i) => {
                        if (val === '<TOTAL>') {
                            val = scores.reduce((acc, v) => acc + v);
                        }

                        return <td className="score-cell" key={utils.generateKey(i)}>{val}</td>
                    })
                }
            </tr>
        );
    }

    /**
     * @name generateHeaderLabel
     * @param {Number} idx Index of this period
     */
    generateHeaderLabel(idx) {
        let returnStr = '';
    
        if (idx > constants.periods[this.props.league].otCount) {
            returnStr += utils.numReplace(constants.periods[this.props.league].OT, idx);
        } else if (this.props.useSmall) {
            returnStr += utils.numReplace(constants.periods[this.props.league].small, idx);
        } else {
            returnStr += utils.numReplace(constants.periods[this.props.league].normal, idx);
        }
    
        return returnStr;
    }

    /**
     * @name createScoringTable
     */
    createScoringTable() {
        let table = [];
        const extraHeaders = this.props.extraStats.map((val) => {
            return Object.keys(val)[0];
        });

        table.push(this.createHeaderRow(this.props.gameScore.home.length, extraHeaders));
        table.push(this.createScoreRow(this.props.gameScore.away, utils.generateTeamStatsArray(this.props.extraStats, 'away')));
        table.push(this.createScoreRow(this.props.gameScore.home, utils.generateTeamStatsArray(this.props.extraStats, 'home')));

        return table;
    }

    render() {
        const tableData = this.createScoringTable();

        return (
            <div className="game-score">
                <table>
                    <tbody>
                        {tableData}
                    </tbody>
                </table>
            </div>
        );
    }
}

/**
 * Component that holds the name of our teams as well
 * as the status of the overall game
 */
class TeamColumn extends React.Component {
    render() {
        let propToUse = '';

        if (this.props.useSmall) {
            propToUse += 'abbv';
        } else {
            propToUse += 'name';
        }

        return (
            <div className="teams-container">
                <table>
                    <tbody>
                        <tr>
                            <td>
                                {utils.capitalizeString(this.props.gameStatus)}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {this.props.teams.away[propToUse]}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {this.props.teams.home[propToUse]}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

/**
 * Main component that controls state, responsible for
 * the entire boxscore data flow
 */
class Boxscore extends React.Component {
    /**
     * @name constructor
     * @param {Object} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            gameStatus: '',
            league: '',
            scoreInfo: {away: [], home: []},
            playerInfo: {},
            teams: {away: '', home: ''},
            useSmall: false,
            extraStats: []
        }
    }

    /**
     * Remove our custom listener
     */
    componentWillUnmount() {
        window.removeEventListener('resize', () => {
            this.checkWindowSize()
        });
    }

    /**
     * @name checkWindowSize
     */
    checkWindowSize() {
        let width = window.innerWidth;

        // Arbitrary number of px
        if ((width < 1150 && !this.state.useSmall) || (width >= 1150 && this.state.useSmall)) {
            this.updateSizeState();
        }
    }

    /**
     * @name updateSizeState
     */
    updateSizeState() {
        // We want all the data as is just tell all the child
        // components to use smaller text options if they have em
        const newState = this.state;
        newState.useSmall = !this.state.useSmall;

        this.setState(newState);
    }

    /**
     * @name updateGameInfo
     * @param {String} leagueType MLB vs. NBA
     */
    async updateGameInfo(leagueType) {
        // Get all our Data
        const gameInfo = await utils.getGameInformation(leagueType);
        const gameScore = await utils.getGameScore(leagueType);
        const teamInfo = await utils.getTeamInfo(leagueType);
        const playerInfo = await utils.getPlayerInfo(leagueType);
        const extraStats = await utils.getExtraStats(leagueType);

        // Create our new state obj
        let stateObj = {
            league: leagueType
        };

        stateObj.gameStatus = gameInfo.status;
        stateObj.location = gameInfo.location;
        stateObj.scoreInfo = gameScore;
        stateObj.teams = teamInfo;
        stateObj.playerInfo = playerInfo;
        stateObj.extraStats = extraStats;
        
        return stateObj;
    }

    /**
     * Trigger initialdata update as well as our
     * custom window resize listener
     */
    componentDidMount() {
        // Just in case we get some user typos :)
        this.updateGameInfo(constants.LEAGUETYPE.toUpperCase())
            .then((newState) => {
                this.setState(newState);
            });

        window.addEventListener('resize', () => {
            this.checkWindowSize();
        });
    }

    render() {
        return (
            <div className="boxscore-container">
                <GameContainer gameStatus={this.state.gameStatus}
                               gameScore={this.state.scoreInfo}
                               teams={this.state.teams}
                               useSmall={this.state.useSmall}
                               league={this.state.league}
                               extraStats={this.state.extraStats}/>
                <PlayerContainer playerInfo={this.state.playerInfo}
                                 league={this.state.league} />
            </div>
        );
    }
}

ReactDOM.render(
    <Boxscore />,
    document.getElementById('root')
);