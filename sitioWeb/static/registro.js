// para activar y desactivar el required

function toggleRequired(input) {
    if (input.value.length > 0) {
        input.setAttribute('required', 'required');
    } else {
        input.removeAttribute('required');
    }
}


// notificacion cuando las contraseñas no coinciden

document.addEventListener('DOMContentLoaded', function() {
    const toasts = document.querySelectorAll('.toast');
    toasts.forEach(toast => {
        toast.classList.add('show'); // Muestra la notificación

        // Oculta la notificación después de 3 segundos (3000 ms)
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    });
});



// controla en tiempo real el ingreso de SOLO letras en el input de nombre
function validateUsername(input) {
    // Permite solo letras y al menos 3 caracteres
    input.value = input.value.replace(/[^A-Za-z]/g, ''); // Remueve caracteres no permitidos

    // Si tiene menos de 3 caracteres, muestra el mensaje de error
    if (input.value.length < 3) {
        input.setCustomValidity('El nombre debe tener almenos 3 caracteres');
    } else {
        input.setCustomValidity(''); // Remueve el mensaje de error si es válido
    }
}