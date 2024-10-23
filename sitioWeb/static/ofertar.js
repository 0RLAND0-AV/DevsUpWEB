(function () {
    'use strict';
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation');
  
    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          // Validar los archivos antes de la validación del formulario
          if (!validarArchivos() || !form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
          }
  
          // Agregar la clase de validación de Bootstrap
          form.classList.add('was-validated');
  
          // Si el formulario es válido, manejar el envío
          if (form.checkValidity()) {
            validarFormulario(event);
          }
        }, false);
      });
  })();
// Módulo de validación y manejo de archivos
const validarArchivos = () => {
    const archivoInput = document.getElementById('archivo');
    const fileNameDisplay = document.getElementById('file-name');
    const previewContainer = document.getElementById('preview-container');

    if (!archivoInput) return false;

    const fileList = Array.from(archivoInput.files);
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxFileSize = 2 * 1024 * 1024; // 2 MB en bytes
    const maxFiles = 8; // Máximo de archivos permitidos
    const validFiles = [];
    const removedFiles = [];

    // Limpiar cualquier vista previa anterior
    previewContainer.innerHTML = "";

    // Filtrar archivos válidos y acumular los que se eliminarán
    fileList.forEach(file => {
        const isValidType = validTypes.includes(file.type);
        const isValidSize = file.size <= maxFileSize;

        if (!isValidType || !isValidSize) {
            removedFiles.push(file.name); // Archivo no válido
        } else {
            // Solo agregar hasta un máximo de archivos válidos
            if (validFiles.length < maxFiles) {
                validFiles.push(file);

                // Crear una miniatura para cada imagen válida
                const reader = new FileReader();
                reader.onload = function (e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    previewContainer.appendChild(img); // Añadir la miniatura al contenedor
                };
                reader.readAsDataURL(file); // Leer el archivo como DataURL para mostrar la imagen
            } else {
                // Si se alcanza el máximo, añadir a la lista de eliminados
                removedFiles.push(file.name);
            }
        }
    });

    // Mostrar alerta personalizada si hay archivos eliminados
    if (removedFiles.length > 0) {
        Swal.fire({
            icon: 'error',
            title: 'Archivos eliminados',
            text: `Los siguientes archivos fueron eliminados porque se excedió el límite de ${maxFiles} archivos válidos: ${removedFiles.join(', ')}`,
            footer: '<label>Solo se aceptan 8 archivos en formato [.jpg, .jpeg, .png] de peso máximo 2MB</label>'
        });
    }

    // Mostrar nombres de archivos seleccionados en el elemento <span>
    if (validFiles.length > 0) {
        fileNameDisplay.textContent = `Archivos seleccionados: ${validFiles.map(file => file.name).join(', ')}`;
        fileNameDisplay.style.color = 'black'; // Cambiar el color a negro si hay archivos válidos
    } else {
        fileNameDisplay.textContent = "Debe seleccionar almenos una foto para su publicacion";
        fileNameDisplay.style.color = 'red'; // Cambiar el color a rojo si no hay archivos válidos
    }
    return validFiles.length > 0; // Retorna true si hay archivos válidos
};




// Habilitar o deshabilitar el botón de ofertar

// Módulo de validación del formulario y tardanza del envio del Form, tod para que se vea la alerta
const validarFormulario = (event) => {
    // Mostrar la alerta de éxito y retrasar el envío del formulario
    event.preventDefault(); // Prevenir el envío del formulario
    Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Tu oferta fue publicada correctamente",
        showConfirmButton: false,
        timer: 1750 // 1.5 segundos
    });

    setTimeout(() => {
        event.target.submit(); // Enviar el formulario después del tiempo de la alerta
    }, 1750);
};

// Módulo de inicialización de eventos
const inicializarEventos = () => {
    /*Swal.fire({
        title: 'Completa todos los campos del formulario, porfavor',
        confirmButtonText: 'Continuar', // Cambia el texto del botón aquí
        confirmButtonColor: '#02735E' // Puedes personalizar el color del botón
      });*/
    //Añadir reporte de JS al apretar el boton Cancelar
    document.getElementById('button-cancelar').addEventListener('click', function() {
        Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Los datos ingresados NO se guardaran!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#666666",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí",
        cancelButtonText: "Cancelar"
        }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
            title: "¡Oferta eliminada!",
            text: "Tu publicacion ha sido eliminado correctamente",
            icon: "success"
        }).then(() => {
            // Redireccionar a la página home.html
            window.location.href = '/';
        });   
        }
        });
    });       
 
    // Asociar la validación de archivos al cambio del input de archivos
    document.getElementById('archivo').addEventListener('change', validarArchivos);
    
    // Asociar la validación completa del formulario al submit
    //document.getElementById('ofertaForm').addEventListener('submit', validarFormulario);


    // Asociar el cambio del departamento para actualizar las provincias
    document.getElementById('departamento').addEventListener('change', function() {
        const provinciaSelect = document.getElementById('provincia');
        provinciaSelect.innerHTML = '<option value="" disabled selected>Seleccionar Provincia</option>';

        const provincias = JSON.parse(this.options[this.selectedIndex].getAttribute('data-provincias'));

        provincias.forEach(function(provincia) {
            const option = document.createElement('option');
            option.value = provincia;
            option.textContent = provincia;
            provinciaSelect.appendChild(option);
        });
    });   
};

// Inicializar eventos cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', inicializarEventos);