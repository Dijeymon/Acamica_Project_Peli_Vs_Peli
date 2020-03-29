const conn = require("../lib/database");

//  Obtener géneros
async function loadGenres(req, res) {
  await conn.query("SELECT * FROM genero", (error, results, fields) => {
    if (error) return res.status(500).json(error);
    if (results.length == 0) {
      return res.status(422).json("No se han podido cargar los géneros");
    } else {
      var response = {
        generos: results
      };
    }
    res.send(JSON.stringify(response));
  });
}

//  Obtener directores
async function loadDirectors(req, res) {
  await conn.query("SELECT *  FROM director", (error, results, fields) => {
    if (error) return res.status(500).json(error);
    var response = {
      directores: results
    };
    res.send(JSON.stringify(response));
  });
}

//  Obtener actores
async function loadActors(req, res) {
  await conn.query("SELECT *  FROM actor", (error, results, fields) => {
    if (error) return res.status(500).json(error);
    var response = {
      actores: results
    };
    res.send(JSON.stringify(response));
  });
}

//  Obtener competencias
async function showCompetitions(req, res) {
  await conn.query(
    "SELECT *  FROM competencia WHERE activa = true",
    (error, results, fields) => {
      if (error) return res.status(500).json(error.sqlMessage);
      if (results.length == 0) {
        return res
          .status(404)
          .json("No se han podido mostrar las competencias");
      }
      var response = {
        competencias: results
      };
      res.send(JSON.stringify(response));
    }
  );
}

//  Obtener  competencia por ID
async function showCompetitionsById(req, res) {
  const { id } = req.params;
  await conn.query(
    "SELECT * FROM competencia WHERE id = ?",
    [id],
    (error, results, fields) => {
      if (error) return res.status(500).json(error.sqlMessage);
      if (results < 0) {
        return res.status(404).json("Competencia inexistente");
      } else {
        var response = {
          data: results
        };
        console.log(response);
      }
      res.send(JSON.stringify(response));
    }
  );
}

//  Obtener peliculas para votar
async function loadMovies(req, res) {
  const { id } = req.params;
  await conn.query(
    "SELECT nombre FROM competencia WHERE id = ?",
    [id],
    (error, results, fields) => {
      if (error) return res.status(500).json(error.sqlMessage);
      if (results.length == 0) {
        return res.status(404).json("La competencia no existe");
      }
      conn.query(
        "SELECT id,poster,titulo FROM pelicula ORDER BY RAND() LIMIT 2",
        (err, result, field) => {
          if (err) return res.status(500).json(sqlMessage);
          if (results.length == 0) {
            return res
              .status(404)
              .json("No se han encontrado películas para votar");
          } else {
            var response = {
              competencia: results[0].nombre,
              peliculas: result
            };
            res.send(JSON.stringify(response));
          }
        }
      );
    }
  );
}

//  Votar pelicula
async function voteCompetition(req, res) {
  const { id } = req.params;
  const { idPelicula } = req.body;
  await conn.query(
    `INSERT INTO voto (competencia_id,pelicula_id) values(?,?)`,
    [id, idPelicula],
    (error, results, fields) => {
      console.log(error);
      if (error)
        return res
          .status(422)
          .json("No se ha podido registrar el voto ", error.sqlMessage);
      var response = {
        data: results
      };
      res.send(JSON.stringify(response));
    }
  );
}

//  Mostrar resultados
async function showResults(req, res) {
  const { id } = req.params;
  await conn.query(
    "SELECT nombre FROM competencia WHERE id = ?",
    [id],
    (error, results, fields) => {
      console.log(results);
      if (error) return res.status(500).json(error.sqlMessage);
      if (results.length == 0) {
        return res.status(404).json(error.message);
      }
      conn.query(
        "SELECT COUNT(p.id) AS votos , p.id, p.poster, p.titulo FROM competencia c JOIN voto v ON c.id = v.competencia_id JOIN pelicula p ON p.id=v.pelicula_id WHERE c.id = ?  GROUP BY v.pelicula_id ORDER BY COUNT(p.id) DESC LIMIT 3",
        [id],
        (err, result, field) => {
          if (err) return res.status(500).json(err.sqlMessage);
          if (result.length < 0) {
            return res.status(404).json("No hay resultados para mostrar");
          } else {
            var response = {
              competencia: results[0].nombre,
              resultados: result
            };
            res.send(JSON.stringify(response));
          }
        }
      );
    }
  );
}

//  Crear competencia
async function createCompetition(req, res) {
  const { nombre, director, actor, genero } = req.body;
  conn.query(
    "select nombre from competencia where nombre = ?",
    [nombre],
    (error, results, fields) => {
      if (error) return res.status(500).json(error.sqlMessage);
      if (results.length > 0) {
        return res
          .status(422)
          .json("¡¡ El nombre de la competencia ya existe !!");
      }
      conn.query(
        "INSERT INTO competencia (nombre, director_id, genero_id, actor_id) VALUES (?,?,?,?)",
        [nombre, director, genero, actor],
        (error, results, fields) => {
          if (error) return res.status(500).json(error.sqlMessage);
          res.send(JSON.stringify(results));
        }
      );
    }
  );
}

//  Eliminar votos de una competencia
async function deleteVotes(req, res) {
  const { id } = req.params;
  conn.query(
    "DELETE v FROM voto v JOIN competencia c ON v.competencia_id = c.id WHERE c.id = ?",
    [id],
    (error, results, fields) => {
      if (error) return res.status(500).json(error.sqlMessage);
      res.send(JSON.stringify(results));
    }
  );
}

//  Editar una competencia
async function updateCompetition(req, res) {
  const { nombre } = req.body;
  const { id } = req.params;
  conn.query(
    "UPDATE competencia set nombre = ?  where id = ?",
    [nombre, id],
    (error, results, fields) => {
      if (error) return res.status(500).json(error.sqlMessage);
      if (results.length < 0) {
        return res
          .status(422)
          .json("No se ha podido realizar la actualización");
      } else {
        res.send(JSON.stringify(results));
      }
    }
  );
}

async function deleteCompetition(req, res) {
  const { id } = req.params;
  conn.query(
    "UPDATE competencia SET activa = false WHERE id = ?",
    [id],
    (error, results, fields) => {
      if (error) return res.status(500).json(error.sqlMessage);
      res.send(JSON.stringify(results));
    }
  );
}

module.exports = {
  loadGenres: loadGenres,
  loadDirectors: loadDirectors,
  loadActors: loadActors,
  showCompetitions: showCompetitions,
  showCompetitionsById: showCompetitionsById,
  loadMovies: loadMovies,
  voteCompetition: voteCompetition,
  showResults: showResults,
  createCompetition: createCompetition,
  deleteVotes: deleteVotes,
  updateCompetition: updateCompetition,
  deleteCompetition: deleteCompetition
};
