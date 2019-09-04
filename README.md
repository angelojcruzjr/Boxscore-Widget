# Boxscore-Widget

Very bare-bones boxscore widget that solves the problem presented here: https://github.com/BarstoolSports/fullstack-challenge

The backend is built using NodeJS with a cloud Mongo instance for storage. When hitting the API, the API will first check how recently the underlying data has been update - if it is more than 15 seconds, the Mongo DB will update before sending the results.

# Backend API

The API is configured to use localhose port 8080 currently. There are only a handful of GET requests that the API supports, namely:
1. /api/games - Returns ALL data for ALL games
2. /api/games/MLB || /api/games/NBA - This will return ALL data for specifically the baseball or basketball game in the Mongo DB
3. /api/games/:league?stats=[STATISTIC] - This will fetch a specific stastics for a game. An acceptable list of statistics can be found in the games.controller.js file
4. api/games?stats=[STATISTIC] - This will fetch overlapping data for both the MLB and NBA game that the Mongo DB holds

# Getting Started

After downloading/cloning the repository, getting started is easy, simply:
1. Run 'npm start' in the command line in the main repository to startup the Node Server
2. cd to the clients folder
3. Again, run 'npm start' in the command line to get the react app up and going
4. Navigate to http://localhost:3000/ to view the resulting widget example

# TODO
While this is a barebones app there are still various improvments that can be made to both the backend and frontend. In the backend serving new responses can often be timely and there may be an easier way to structure the architecture such that we are not using a huge string of promises tied to each other. On the frontend, the client is responsible for much of the data transformation that has to occur to be able to be viewed correctly - it is certainly possible to refactor this stress to be on the backend. Additionally, there are various react concepts such as memoization that could further improve performance.
