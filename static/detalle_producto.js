

// Habilitar los campos para editar el producto
document.getElementById('editar-producto').addEventListener('click', function() {
    // Verificar si el botón está siendo clickeado correctamente
    console.log('Edit button clicked!');

    // Habilitar inputs, textareas y selects
    document.querySelectorAll('#producto-formulario input, #producto-formulario textarea, #producto-formulario select').forEach(input => {
        console.log('Habilitando campo:', input.name); // Verificar cada campo que está siendo habilitado
        input.disabled = false;
    });
    // Mostrar el label de "nuevas-imagenes" y habilitar el input correspondiente
    document.querySelector('label[for="nuevas-imagenes"]').hidden = false;
    // Mostrar el label de "nuevas-imagenes" y habilitar el input correspondiente
    document.querySelector('button[for="borrar-imagenes"]').hidden = false;

    // Habilitar todos los checkboxes de "imagenes_a_eliminar"
    const checkboxes = document.querySelectorAll('input[name="imagenes_a_eliminar"]');

    checkboxes.forEach((checkbox) => {
        checkbox.disabled = false; // Habilitar todos los checkboxes
        checkbox.hidden = false; // Asegurarse de que no estén ocultos
    });

    // Mostrar el botón de guardar y cancelar
    document.getElementById('boton-guardar-producto').style.display = 'inline-block'; 
    document.getElementById('boton-cancelar-producto').style.display = 'inline-block'; 
    console.log('Botón Guardar mostrado.');

    // Ocultar el botón de editar
    this.style.display = 'none';

    // ocultar el botón de eliminar
    document.getElementById("eliminar-producto").hidden = true; // Corrección aquí
});
// Escuchar el clic en el botón de cancelar
document.getElementById('boton-cancelar-producto').addEventListener('click', function(event) {
    event.preventDefault(); // Evita que el formulario se restablezca de inmediato

    // Mostrar alerta de confirmación
    Swal.fire({
        title: "¿Estás seguro?",
        text: "Todos los cambios realizados se perderán al descartar",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#666666",
        cancelButtonColor: "#d33",
        confirmButtonText: "Descartar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            // Si el usuario confirma, restablecer el formulario y recargar la página
            location.reload();
        }
    });
});

//Restrición para las imagenes 
function manejarRestriccionesDeImagenes() {
    const inputImagenes = document.getElementById('nuevas-imagenes');
    const previewContainer = document.querySelector('#imagenes-producto ul');
    const maxFiles = 8; // Máximo de imágenes permitidas
    const maxFileSize = 2 * 1024 * 1024; // 2 MB en bytes
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const validFiles = [];
    const removedFiles = [];

    // Contar las imágenes ya existentes que vienen de la base de datos
    const existingImagesCount = document.querySelectorAll('#imagenes-producto ul li img').length;
    let remainingSlots = maxFiles - existingImagesCount;

    if (!inputImagenes) return;

    // Evento al seleccionar archivos en el input
    inputImagenes.addEventListener('change', () => {
        const files = Array.from(inputImagenes.files);

        // Limpiar el contenedor de vista previa de nuevas imágenes
        previewContainer.innerHTML = "";

        // Verificar si se supera el número máximo de archivos permitidos, considerando las imágenes existentes
        if (files.length > remainingSlots) {
            Swal.fire({
                icon: 'warning',
                title: 'Límite de archivos',
                text: `Puedes agregar solo ${remainingSlots} imagen(es) más para no exceder el límite de ${maxFiles}.`
            });

            // Limitar el array de archivos a los primeros espacios disponibles
            files.splice(remainingSlots);
        }

        files.forEach(file => {
            // Validar tipo y tamaño de archivo
            const isValidType = validTypes.includes(file.type);
            const isValidSize = file.size <= maxFileSize;

            if (isValidType && isValidSize) {
                validFiles.push(file);

                // Crear vista previa para cada archivo válido
                const reader = new FileReader();
                reader.onload = function (e) {
                    const li = document.createElement('li');
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = "Vista previa de imagen";
                    li.appendChild(img);
                    previewContainer.appendChild(li);
                };
                reader.readAsDataURL(file);
            } else {
                removedFiles.push(file.name);
            }
        });

        // Mostrar alerta si algunos archivos fueron eliminados
        if (removedFiles.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Archivos no válidos',
                text: `Se eliminaron algunos archivos no válidos por formato o tamaño: ${removedFiles.join(', ')}`,
                footer: 'Solo se aceptan archivos .jpg, .jpeg, .png de máximo 2 MB.'
            });
        }

        // Asignar los archivos válidos nuevamente al input
        const dataTransfer = new DataTransfer();
        validFiles.forEach(file => dataTransfer.items.add(file));
        inputImagenes.files = dataTransfer.files;
    });
}

// Llama a la función cuando se carga la página
document.addEventListener('DOMContentLoaded', manejarRestriccionesDeImagenes);


// Actualización dinámica de subcategorías según la categoría seleccionada
document.getElementById('categoria-producto').addEventListener('change', function () {
    const categoriaId = this.value;
    console.log('Categoría seleccionada:', categoriaId); // Log para verificar la categoría seleccionada
    fetch(`/subcategorias/${categoriaId}/`)
        .then(response => response.json())
        .then(data => {
            const subcategoriaSelect = document.getElementById('subcategoria-producto');
            subcategoriaSelect.innerHTML = '';
            data.subcategorias.forEach(subcategoria => {
                const option = document.createElement('option');
                option.value = subcategoria.id;
                option.textContent = subcategoria.nombre;
                subcategoriaSelect.appendChild(option);
            });
        });
});

// Actualización dinámica de provincias según el departamento seleccionado
document.getElementById('departamento-producto').addEventListener('change', function () {
    const departamentoId = this.value;
    console.log('Departamento seleccionado:', departamentoId); // Log para verificar el departamento seleccionado
    fetch(`/provincias/${departamentoId}/`)
        .then(response => response.json())
        .then(data => {
            const provinciaSelect = document.getElementById('provincia-producto');
            provinciaSelect.innerHTML = '';
            data.provincias.forEach(provincia => {
                const option = document.createElement('option');
                option.value = provincia.id;
                option.textContent = provincia.nombre;
                provinciaSelect.appendChild(option);
            });
        });
});


document.getElementById('borrar-imagenes1').addEventListener('click', function(event) {
    event.preventDefault(); // Evita el envío predeterminado del formulario

    // Obtener los IDs de los checkboxes seleccionados
    const selectedImages = Array.from(document.querySelectorAll('input[name="imagenes_a_eliminar"]:checked'))
                                .map(checkbox => checkbox.value);

    if (selectedImages.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Selecciona al menos 1 imagen ',
            text: 'Por favor marca en el cuadrito las imagenes que quieres eliminar',
            confirmButtonText: 'OK',
            confirmButtonColor: '#02735E' // Color verde
        })
        return;
    }

    // Confirmación de eliminación
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Las imágenes seleccionadas se eliminarán!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#666666",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            // Crear el cuerpo de la solicitud con múltiples entradas de 'imagenes_a_eliminar'
            const formData = new URLSearchParams();
            selectedImages.forEach(id => formData.append('imagenes_a_eliminar', id));

            // Realizar la solicitud AJAX
            fetch('/eliminar-imagenes/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': getCookie('csrftoken') // Agrega el CSRF token
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    Swal.fire({
                        title: "¡Imágenes eliminadas!",
                        text: data.message,
                        icon: "success",
                        confirmButtonColor: "#03A678"
                    }).then(() => {
                        // Aquí puedes actualizar el DOM para reflejar la eliminación sin recargar
                        selectedImages.forEach(id => {
                            document.querySelector(`input[value="${id}"]`).closest('li').remove();
                        });
                    });
                } else {
                    Swal.fire("Error", data.message, "error");
                }
            })
            .catch(error => console.error('Error en la solicitud:', error));
        }
    });
});

// Función para obtener el CSRF token desde las cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

document.getElementById('eliminar-producto').addEventListener('click', function() {
    var url = this.getAttribute('data-url'); // Obtiene la URL del atributo data-url

    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        console.log('Eliminando producto...');

        window.location.href = url; // Redirige a la URL de eliminación
    }
});