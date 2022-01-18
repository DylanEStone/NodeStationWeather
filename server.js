//require('dotenv').config();
import dotenv from "dotenv";
import express from 'express';
import fetch from 'node-fetch';

const result = dotenv.config()

if (result.error) {
  throw result.error
}

console.log(result.parsed)

const app = express();
const port = 8080;

// DATABASE STUFF
import sqlite3 from 'sqlite3';
import Datastore from 'nedb'

let db = new sqlite3.Database('./db/station_weather.db', (err) => {
  if (err) {
  return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');

  db.run("CREATE TABLE if not exists station_weather (pk INTEGER PRIMARY KEY AUTOINCREMENT,station TEXT DEFAULT \"\",txt_status TEXT DEFAULT \"Trouble Communicating with server\",wind_speed REAL DEFAULT 0.0,cloud_coverage int Default 0, icon TEXT,table_constraints);");
});

function insertDBRow(station, fetchResp) {
  db.run("Insert into station_weather(station, txt_status,wind_speed, cloud_coverage, icon) Values(" + "\"" + station + "\"" + ", " + fetchResp + ")");
}

// // Executes to populate data when server starts
fetchJSON("Goldstone");
fetchJSON("Canberra");
fetchJSON("Madrid");
// continues populating DB every 5 minutes
setInterval(() => fetchJSON("Goldstone"), 300000);
setInterval(() => fetchJSON("Canberra"), 300000);
setInterval(() => fetchJSON("Madrid"), 300000);

function fetchJSON(station) {
  var obj
  var resp = ""
   return fetch('https://api.openweathermap.org/data/2.5/weather?q=' + station + '&appid='+ process.env.AUTH_TOKEN)
    .then(res => res.json())
    .then(data => obj = data)
    .then(() => resp += String("\"" + obj.weather[0].description + "\"" + ", "))
    .then(() => resp += String(obj.wind.speed + ", "))
    .then(() => resp += String(obj.clouds.all + ", "))
    .then(() => resp += String("\"" + obj.weather[0].icon + "\""))
    .then(() => insertDBRow(station, resp))
}

let database = new Datastore('./db/station_weather.db');
database.loadDatabase();

app.get('/api/:station', (request, response) => {
  var arr = [];
  db.all('SELECT Max(pk), txt_status, wind_speed, cloud_coverage, icon FROM station_weather WHERE  station="' + request.params.station + '"', [], (err, rows) => {
    if (err) {
      console.log(err)
      response.end();
      return;
    }
    rows.forEach((row) => {
      arr.push(row);
    });
    response.json(arr);
  });
});

app.post('/api', (request, response) => {
  const data = request.body;
  console.log(data);
  response.json(data);
})

app.use(express.static('pages'))

app.listen(port, () => {
  console.log(`Station Weather app listening at http://localhost:${port}`)
})