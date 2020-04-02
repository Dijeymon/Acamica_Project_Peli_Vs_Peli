const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const controller = require("./controller/competencias.controller");

// Initialization
const app = express();

//  Settings
app.set("port", process.env.PORT || 8080);

//  Middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

//  Routes
app.get("/generos", controller.loadGenres);
app.get("/directores", controller.loadDirectors);
app.get("/actores", controller.loadActors);
app.get("/competencias/:id/peliculas", controller.loadMovies);
app.post("/competencias/:id/voto", controller.voteCompetition);
app.get("/competencias/:id/resultados", controller.showResults);
app.get("/competencias/:id", controller.showCompetitionsById);
app.get("/competencias", controller.showCompetitions);
app.post("/competencias", controller.createCompetition);
app.put("/competencias/:id", controller.updateCompetition);
app.delete("/competencias/:id/votos", controller.deleteVotes);
app.delete("/competencias/:id", controller.deleteCompetition);

module.exports = app;
