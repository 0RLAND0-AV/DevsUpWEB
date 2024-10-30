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