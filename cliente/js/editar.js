// Al finalizarse de cargar el DOM:
$(function() {
  // Se obtiene el id en la URL usando la función en helpers.js
  var idCompetencia = getQueryParam("id");
  // Se obtienen del backend y cargan en el DOM los detalles de la competencia
  var competenciasController = new CompetenciasController();
  competenciasController.obtenerCompetencia(idCompetencia);
  // Al enviarse el formulario, se debe ejecutar un PUT al servidor
  $("#formCompetencia").ajaxForm({
    url: server + "/competencias/" + idCompetencia,
    type: "put",
    // En caso de éxito, se redirige a index.html
    success: function(res) {
      window.location.replace("./index.html?exito=True");
    },
    // En caso de error por validación, se muestra el mensaje de error en el contenedor para tal fin
    error: function(response, status, xhr) {
      if (response.status == 404) {
        Swal.fire({
          text: "No se ha podido registrar la actualización",
          icon: "error",
          confirmButtonText: "OK"
        });
      } else if (response.status == 422) {
        Swal.fire({
          text: "El nombre de la competencia ya existe",
          icon: "warning",
          confirmButtonText: "OK"
        });
      }
    }
  });
  // Si el usuario cancela, se redirige a index.html
  $(".cancelar").click(function() {
    window.location.replace("./index.html");
  });
});
