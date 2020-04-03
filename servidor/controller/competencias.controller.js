const conn = require("../lib/database");

//  Obtener géneros
async function loadGenres(req, res) {
  await conn.query("SELECT * FROM genero", (error, results, fields) => {
    if (error) return res.status(500).json(error);
    if (results.length == 0) {
      return res.status(404).json("No se han podido cargar los géneros");
    } else {
      res.send(JSON.stringify(results));
    }
  });
}

//  Obtener directores
async function loadDirectors(req, res) {
  await conn.query("SELECT *  FROM director", (error, results, fields) => {
    if (error) return res.status(500).json(error);
    if (results.length == 0) {
      return res.status(404).json("No se han podido cargar los directores");
    } else {
      res.send(JSON.stringify(results));
    }
  });
}

//  Obtener actores
async function loadActors(req, res) {
  await conn.query("SELECT *  FROM actor", (error, results, fields) => {
    if (error) return res.status(500).json(error);
    if (results.length == 0) {
      return res.status(404).json("No se han podido cargar los actores");
    } else {
      res.send(JSON.stringify(results));
    }
  });
}

//  Obtener competencias
async function showCompetitions(req, res) {
  await conn.query("SELECT *  FROM competencia", (error, results, fields) => {
    if (error) return res.status(500).json(error.sqlMessage);
    if (results.length == 0) {
      return res.status(404).json("No existe ninguna competencia");
    } else {
      res.send(JSON.stringify(results));
    }
  });
}

//  Obtener  competencia por ID
async function showCompetitionsById(req, res) {
  const { id } = req.params;
  await conn.query(
    "SELECT c.nombre AS nombre, g.nombre AS genero_nombre, d.nombre AS director_nombre, a.nombre AS actor_nombre FROM competencia c LEFT JOIN genero g ON c.genero_id = g.id LEFT JOIN director d ON c.director_id = d.id LEFT JOIN actor a ON c.actor_id = a.id WHERE c.id = ?",
    [id],
    (error, results, fields) => {
      if (error) return res.status(500).json(error.sqlMessage);
      if (results.length === 0) {
        return res.status(404).json("No se encuentran los datos");
      } else {
        res.send(JSON.stringify(results[0]));
      }
    }
  );
}

//  Obtener peliculas para votar
async function loadMovies(req, res) {
  const { id } = req.params;
  var sql = "";
  await conn.query(
    "SELECT nombre, genero_id,director_id,actor_id FROM competencia WHERE id = ?",
    [id],
    (error, results, fields) => {
      if (error) return res.status(500).json(error.sqlMessage);
      if (results.length == 0) {
        return res.status(404).json("La competencia no existe");
      }
      req.body = results[0];
      const { genero_id, director_id, actor_id } = req.body;
      if (genero_id) {
        sql = `SELECT id,poster,titulo FROM pelicula WHERE genero_id = ${genero_id} ORDER BY RAND() LIMIT 2`;
      } else if (director_id) {
        sql = `SELECT p.id, p.poster, p.titulo FROM pelicula p JOIN director_pelicula dp ON p.id = dp.pelicula_id where dp.director_id = ${director_id} ORDER BY RAND() LIMIT 2`;
      } else if (actor_id) {
        sql = `SELECT p.id, p.poster, p.titulo FROM pelicula p JOIN actor_pelicula ap ON p.id = ap.pelicula_id where ap.actor_id = ${actor_id} ORDER BY RAND() LIMIT 2`;
      } else {
        sql = `SELECT id, poster, titulo FROM pelicula ORDER BY RAND() LIMIT 2`;
      }
      conn.query(sql, (err, result, field) => {
        if (err) return res.status(500).json(err.sqlMessage);
        if (result.length == 0) {
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
      });
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
      if (error) return res.status(422).json(error.sqlMessage);
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
    "SELECT c.nombre AS nombre, COUNT(p.id) AS votos , p.id, p.poster, p.titulo FROM competencia c JOIN voto v ON c.id = v.competencia_id JOIN pelicula p ON p.id=v.pelicula_id WHERE c.id = ?  GROUP BY v.pelicula_id ORDER BY COUNT(p.id) DESC LIMIT 3",
    [id],
    (error, results, fields) => {
      if (error) return res.status(500).json(error.sqlMessage);
      if (results.length == 0) {
        return res.status(404).json("No hay datos para mostrar");
      } else {
        var response = {
          competencia: results[0].nombre,
          resultados: results
        };
        res.send(JSON.stringify(response));
      }
    }
  );
}

//  Crear competencia
async function createCompetition(req, res) {
  const { nombre } = req.body;
  await conn.query(
    "SELECT * FROM competencia WHERE nombre = ?",
    [nombre],
    (error, results, fields) => {
      if (error) return res.status(500).json(error.sqlMessage);
      if (results.length > 0) {
        return res
          .status(422)
          .json("¡¡ El nombre de la competencia ya existe !!");
      } else {
        const genero = req.body.genero > 0 ? req.body.genero : undefined;
        const director = req.body.director > 0 ? req.body.director : undefined;
        const actor = req.body.actor > 0 ? req.body.actor : undefined;
        if (!nombre) {
          return res.status(404).json(error);
        } else {
          if (genero) {
            sql = `select * from pelicula where genero_id = ${genero}`;
          } else if (actor) {
            sql = `select * from actor_pelicula where actor_id = ${actor}`;
          } else if (director) {
            sql = `select * from director_pelicula where director_id = ${director}`;
          }
          conn.query(sql, (err, result, field) => {
            if (err) return res.status(523).json(err);
            if (result.length < 2) {
              return res.status(409).json(err);
            } else {
              conn.query(
                "INSERT INTO competencia (nombre, genero_id, director_id, actor_id) VALUES(?,?,?,?)",
                [nombre, genero, director, actor],
                (err, result, field) => {
                  if (err) return res.status(502).json(err.sqlMessage);
                  res.send(JSON.stringify(result));
                }
              );
            }
          });
        }
      }
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
  await conn.query(
    "SELECT * FROM competencia WHERE nombre = ?",
    [nombre],
    (error, results, fields) => {
      if (error) return res.status(500).json(error.sqlMessage);
      if (results.length > 0) {
        return res
          .status(422)
          .json("¡¡ El nombre de la competencia ya existe !!");
      } else {
        conn.query(
          "UPDATE competencia SET nombre = ?  WHERE id = ?",
          [nombre, id],
          (error, results, fields) => {
            if (error) return res.status(500).json(error.sqlMessage);
            if (results.length <= 0) {
              return res
                .status(404)
                .json("No se ha podido registrar la actualización");
            } else {
              res.send(JSON.stringify(results));
            }
          }
        );
      }
    }
  );
}

//  Eliminar una competencia
async function deleteCompetition(req, res) {
  const { id } = req.params;
  conn.query(
    "DELETE FROM competencia WHERE id = ?",
    [id],
    (error, results, fields) => {
      if (error) return res.status(500).json(error.message);
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
