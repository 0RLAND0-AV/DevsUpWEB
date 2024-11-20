document.addEventListener('DOMContentLoaded', function() {
    var checkbox = document.getElementById('id_estadoUsuario');  // Obtén el checkbox por su id

    checkbox.addEventListener('change', function(event) {
        // Verificar si el checkbox está marcado antes de mostrar la alerta
        if (!checkbox.checked) {
            // Mostrar la alerta clásica de confirmación cuando se cambie el estado
            var confirmSuspension = window.confirm("¿Estás seguro de suspender a este usuario?");
            
            if (!confirmSuspension) {
                // Si el usuario cancela, revertir el estado del checkbox
                checkbox.checked = !checkbox.checked;
            }
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Crear el botón de "Cancelar"
    var button = document.createElement("button");
    button.textContent = "Cancelar";
    button.className = "btn btn-cancel form-control"; // Se añade la clase form-control para asegurar que tenga el mismo tamaño

    // Añadir el botón al contenedor deseado
    var actionContainer = document.querySelector("#jazzy-actions");
    if (actionContainer) {
        var div = document.createElement("div");
        div.className = "form-group";
        div.appendChild(button);
        actionContainer.appendChild(div);
    }

    // Función para resetear el formulario y redirigir
    button.addEventListener("click", function(event) {
        event.preventDefault();  // Prevenir el comportamiento predeterminado del botón (por ejemplo, enviar el formulario)

        // Resetear el formulario
        var form = document.querySelector('form');
        if (form) {
            form.reset();  // Resetea todos los campos del formulario
        }

        // Redirigir a la página de lista de usuarios
        window.location.href = '/admin/sitioWeb/usuario/';  // Redirige a la lista de usuarios
    });
});

// Identificar por el texto contenido
document.querySelectorAll('th').forEach(th => {
    if (th.textContent.trim() === 'EstadoUsuario') {
        th.textContent = 'Activo/Inactivo';
        th.style.color = 'black';  // Cambia el color del texto a negro
    }
});
