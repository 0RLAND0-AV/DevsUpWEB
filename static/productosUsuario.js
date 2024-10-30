// Filtra productos según el estado y orden de fecha seleccionados
document.addEventListener("DOMContentLoaded", function() {
    const filtroEstado = document.getElementById("filtro");
    const filtroOrden = document.getElementById("filtro-fechas");
    const productosContainer = document.getElementById("product-gridd");
    const productos = Array.from(document.querySelectorAll(".tarjeta-productoo"));

    function aplicarFiltros() {
        const estadoSeleccionado = filtroEstado.value;
        const ordenSeleccionado = filtroOrden.value;

        // Filtrar por estado
        const productosFiltrados = productos.filter(producto => {
            const esActivo = producto.querySelector(".boton-estado").classList.contains("activo");
            return (
                estadoSeleccionado === "todos" ||
                (estadoSeleccionado === "activos" && esActivo) ||
                (estadoSeleccionado === "inactivos" && !esActivo)
            );
        });

        // Ordenar por fecha
        productosFiltrados.sort((a, b) => {
            // Convertir la fecha del formato 'd/m/Y H:i' a 'Y-m-d H:i'
            const obtenerFecha = (fechaTexto) => {
                const [fecha, hora] = fechaTexto.replace("Publicado el: ", "").trim().split(" ");
                const [dia, mes, año] = fecha.split("/").map(Number);
                return new Date(año, mes - 1, dia, ...hora.split(":").map(Number));
            };

            const fechaA = obtenerFecha(a.querySelector(".fecha-publicacionn").textContent);
            const fechaB = obtenerFecha(b.querySelector(".fecha-publicacionn").textContent);
            return ordenSeleccionado === "ascendente" ? fechaA - fechaB : fechaB - fechaA;
        });

        // Limpiar y mostrar productos filtrados y ordenados
        productosContainer.innerHTML = "";
        productosFiltrados.forEach(producto => productosContainer.appendChild(producto));
    }

    // Escucha los cambios en los selectores de filtros
    filtroEstado.addEventListener("change", aplicarFiltros);
    filtroOrden.addEventListener("change", aplicarFiltros);

    aplicarFiltros(); // Aplicar filtros al cargar la página
});


// Seleccionar/Deseleccionar todos los productos
document.getElementById('seleccionar-todo').addEventListener('click', function() {
    const allCheckboxes = document.querySelectorAll('.producto-checkbox');
    const isChecked = this.checked;
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
});


document.getElementById('eliminarSeleccionados').addEventListener('click', function () {
    const checkboxes = document.querySelectorAll('.checkbox-productoo:checked');
    const ids = Array.from(checkboxes).map(checkbox => checkbox.getAttribute('data-id'));

    if (ids.length === 0) {
        alert('Por favor, selecciona al menos un producto para eliminar.');
        return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar los productos seleccionados?')) {
        // Agregar los IDs seleccionados al input oculto del formulario
        document.getElementById('product-ids-input').value = JSON.stringify(ids);

        // Enviar el formulario
        document.getElementById('form-eliminar-productos').submit();
    }
});

function toggleCheckboxes(source) {
    const checkboxes = document.querySelectorAll('.checkbox-productoo');
    checkboxes.forEach(checkbox => {
        checkbox.checked = source.checked;
    });
}