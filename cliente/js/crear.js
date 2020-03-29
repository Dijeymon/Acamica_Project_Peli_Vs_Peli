// Al finalizarse de cargar el DOM:
$(function() {
  var competenciasController = new CompetenciasController();
  // Se obtienen y cargan los géneros, directores/as y actores/actrices en los elementos select
  competenciasController.cargarGeneros();
  competenciasController.cargarDirectores();
  competenciasController.cargarActores();

  // Al enviarse el formulario, se debe ejecutar un POST al servidor
  $("#formCompetencia").ajaxForm({
    url: server + "/competencias",
    type: "POST",
    // En caso de éxito, se redirige a index.html
    success: function(res) {
      window.location.replace("./index.html?exito=True");
    },
    // En caso de error por validación, se muestra el mensaje de error en el contenedor para tal fin
    error: function(response, status, xhr) {
      if (response.status == 422) {
        Swal.fire({
          title: "Error!",
          text: "El nombre de la competencia ya existe",
          icon: "error",
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
