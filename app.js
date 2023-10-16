let express = require("express");
let app = express();
app.use(express.json());
let { open } = require("sqlite");
let sqlite3 = require("sqlite3");
let path = require("path");
let dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
let connectDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3003, () => {
      console.log("server started");
    });
  } catch (err) {
    console.log(`there is an ${err.message}`);
  }
};
connectDatabase();

app.get(`/players/`, async (request, response) => {
  let getQuery = `
                   SELECT player_id AS playerId,player_name AS  playerName
                   FROM player_details
             `;
  let getResponse = await db.all(getQuery);
  console.log(getResponse);
  response.send(getResponse);
});

app.get(`/players/:playerId/`, async (request, response) => {
  let { playerId } = request.params;
  let getQuery2 = `
             SELECT player_id AS playerId,player_name AS  playerName
             FROM player_details
             WHERE player_id = ${playerId}
    `;
  let getResponse2 = await db.get(getQuery2);
  console.log(getResponse2);
  response.send(getResponse2);
});

app.put(`/players/:playerId/`, async (request, response) => {
  let { playerId } = request.params;
  let { playerName } = request.body;
  console.log(playerName);
  let putQuery = `
                    UPDATE player_details
                    SET player_name = '${playerName}'
         `;
  await db.run(putQuery);
  response.send("Player Details Updated");
});

app.get(`/matches/:matchId/`, async (request, response) => {
  let { matchId } = request.params;
  let getQuery = `
            SELECT match_id AS matchId,match AS match,year AS year
            FROM match_details
            WHERE match_id = ${matchId}
    `;
  let getResponse3 = await db.get(getQuery);
  console.log(getResponse3);
  response.send(getResponse3);
});

app.get("/players/:playerId/matches", async (request, response) => {
  try {
    let { playerId } = request.params;
    let getQuery4 = `
                     SELECT match_details.match_id AS matchId,match_details.match AS match,match_details.year AS year
                     FROM  (match_details JOIN player_match_score ON match_details.match_id = player_match_score.match_id) AS t JOIN player_details ON t.player_id = player_details.player_id
                     WHERE player_details.player_id = ${playerId}
                      
                `;
    let getResponse4 = await db.all(getQuery4);
    console.log(getResponse4);
    response.send(getResponse4);
  } catch (err) {
    console.log(err.message);
  }
});

app.get(`/matches/:matchId/players`, async (request, response) => {
  let { matchId } = request.params;
  console.log(matchId);
  let getQuery5 = `
                     SELECT player_details.player_id AS playerId,player_details.player_name AS  playerName
                     FROM  player_match_score NATURAL JOIN player_details 
                     WHERE match_id = ${matchId}
                      
                 `;
  let getResponse5 = await db.all(getQuery5);
  console.log(getResponse5);
  response.send(getResponse5);
});

app.get(`/players/:playerId/playerScores`, async (request, response) => {
  let { playerId } = request.params;
  let getQuery6 = `
              SELECT player_id AS playerId,player_name AS playerName,SUM(score) AS totalScore,SUM(fours) AS totalFours,SUM(sixes) AS totalSixes
              FROM  player_match_score NATURAL JOIN player_details
              WHERE player_id = ${playerId}
               
    
    `;
  let getResponse6 = await db.get(getQuery6);
  response.send(getResponse6);
});

module.exports = app;
