# Boxscore-Widget

Very bare-bones boxscore widget that solves the problem presented here: https://github.com/BarstoolSports/fullstack-challenge

The backend is built using NodeJS with a [cloud Mongo instance](https://www.mongodb.com/cloud/atlas) for storage. When hitting the API, the API will first check how recently the underlying data has been updated - if it was last updated more than 15 seconds ago, the Mongo DB will update before sending the results.

# Backend API

The API is configured to use localhost port 8080 currently. There are only a handful of GET requests that the API supports, namely:
1. /api/games - Returns ALL data for ALL games
2. /api/games/MLB || /api/games/NBA - This will return ALL data for specifically the baseball or basketball game in the Mongo DB
3. /api/games/:league?stats=[STATISTIC] - This will fetch a specific stastics for a game. An acceptable list of statistics can be found in the games.controller.js file
4. api/games?stats=[STATISTIC] - This will fetch overlapping data for both the MLB and NBA game that the Mongo DB holds

# Getting Started

After downloading/cloning the repository, getting started is easy, simply:
1. Run `npm start` in the command line in the main repository to startup the Node Server
2. cd to the client folder
3. Again, run `npm start` in the command line to get the react app up and going
4. Navigate to http://localhost:3000/ to view the resulting widget example
5. IMPORTANT! To update what results are displayed, navigate to the ./constants/constants.js file in the client code (/client folder in the main repo) and change `export const LEAGUETYPE = 'MLB'` to `export const LEAGUETYPE = 'NBA'` (or vice versa). If you are running the client/frontend code correctly then the results will automatically be updated

Only 'NBA' and 'MLB' are currently supported, any other types will break the widget unfortunately 😞

# TODO
While this is a barebones app there are still various improvments that can be made to both the backend and frontend. In the backend serving new responses can often be timely and there may be an easier way to structure the architecture such that we are not using a huge string of promises tied to each other. Also, there is minimal error handling and communication of improper API requests that go back to the client. On the frontend, the client is responsible for much of the data transformation that has to occur to be able to be viewed correctly - it is certainly possible to refactor this stress to be on the backend. Additionally, there are various react concepts such as memoization that could further improve performance. Lastly, we definitely <u>do not</u> need to put our node_modules folder here but I have kept it in for convenience. 😊

# Sample Output
Here is what the NBA game will output (don't judge the css ):
(https://github.com/angelojcruzjr/Boxscore-Widget/blob/master/screenshots/App%20Screencapture.PNG?raw=true)

<b>Pro Tip:</b> Resize your window to see the widgets built-in responsiveness!
