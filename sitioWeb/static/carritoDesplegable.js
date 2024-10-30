let carrito = [];  
document.addEventListener('DOMContentLoaded', function () {
    // Agregar eventos a los botones para agregar al carrito
    const botonesCarrito = document.querySelectorAll('.agregar-button');
    botonesCarrito.forEach(boton => {
        boton.addEventListener('click', function () {
            const productId = this.getAttribute('data-id');
            agregarAlCarrito(productId);
        });
    });

    // Verifica si ya se registró el evento para evitar duplicados
    const cartPopup = document.getElementById('cart-popup');
    if (cartPopup && !cartPopup.hasAttribute('data-event-registered')) {
        cartPopup.setAttribute('data-event-registered', 'true');  // Marca que ya está registrado

        // Delegación de eventos para los botones de eliminar del carrito
        cartPopup.addEventListener('click', function (event) {
            if (event.target.classList.contains('remove-from-cart')) {
                const productId = event.target.getAttribute('data-id');
                alert("Eliminado del Carrito");
                eliminarDelCarrito(productId);
                //actualizarPopup(productId)
            }
        });
    }

    // Función para calcular el total del carrito
    function calcularTotalCarrito() {
        const items = document.querySelectorAll('.cart-item');
        let total = 0;

        // Itera sobre los productos y acumula los precios
        items.forEach(item => {
            const precio = parseFloat(item.getAttribute('data-precio'));
            total += precio;
        });

        // Actualiza el total en el popup
        document.getElementById('cart-total').textContent = total.toFixed(2);
    }

    // Cada vez que se abra el popup, recalcula el total
    cartPopup.addEventListener('mouseenter', calcularTotalCarrito);

});
// Función para agregar al carrito usando fetch
function agregarAlCarrito(productId) {
    //alert('estas en agregar al carrito');
    fetch(`/agregar/${productId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            carrito = data.productos.map(producto => producto.id);
            //Swal.fire(data.menssage + "PRODUCTO AGREGADO AL CARRITO");
            alert(data.mensaje);
            actualizarPopup(data.productos); // Pasar los productos a la función actualizarPopup
        } else {
            alert('Error: ' + data.mensaje);
        }
    })
    .catch(error => {
        console.error('Error en la solicitud:', error);
    });
}

// Función para eliminar del carrito usando fetch
function eliminarDelCarrito(productId) {
    fetch(`/eliminar/${productId}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            carrito = data.productos.map(producto => producto.id);
            //alert(data.mensaje);
            actualizarPopup(data.productos); // Actualiza el popup después de eliminar
        } else {
            //alert('Error: ' + data.mensaje);
        }
    })
    .catch(error => {
        console.error('Error en la solicitud:', error);
    });
}
// Función para actualizar el popup del carrito
// Función para actualizar el popup del carrito
function actualizarPopup(productos) {
    const cartPopup = document.getElementById('cart-popup');
    cartPopup.innerHTML = ''; // Limpiar contenido previo

    // Agregar el título del carrito
    cartPopup.innerHTML += `<h3>Carrito de Compras</h3>`;

    if (!Array.isArray(carrito) || carrito.length === 0) {
        cartPopup.innerHTML += `<p>No hay productos en el carrito.</p>`;
    } else {
        let total = 0; // Inicializa total

        // Muestra la lista de productos en el carrito
        carrito.forEach(id => {
            const producto = productos.find(p => p.id === id); // Buscar producto en los datos recibidos
            if (producto) {
                total += producto.precio; // Acumula el precio
                cartPopup.innerHTML += `
                    <div class="cart-item" id="cartItems" data-precio="${producto.precio}">
                        <span>${producto.nombre} - ${producto.precio.toFixed(2)} Bs</span>
                        <button class="remove-from-cart" data-id="${producto.id}">Eliminar</button>
                    </div>
                `;
            }
        });

        // Mostrar el total
        cartPopup.innerHTML += `<p class="cart-total">Total: <strong id="cart-total">${total.toFixed(2)}</strong> Bs</p>`;

        // Vuelve a agregar los event listeners para los botones de eliminar
        const botonesEliminar = cartPopup.querySelectorAll('.remove-from-cart');
        botonesEliminar.forEach(boton => {
            boton.addEventListener('click', function () {
                const productId = this.getAttribute('data-id');
                eliminarDelCarrito(productId);
            });
        });
    }
}
// Función para obtener el token CSRF
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

//Funcion para el CONTADOR del carrito//
document.addEventListener("DOMContentLoaded", function () {
    updateCartCount();

    // Escuchar eventos de eliminación de productos
    document.querySelectorAll(".remove-from-cart").forEach(button => {
        button.addEventListener("click", function () {
            const item = this.closest(".cart-item");
            item.remove();  // Remover el producto del carrito en el DOM

            // Actualizar el contador
            updateCartCount();
        });
    });
});

function updateCartCount() {
    const cartCountDisplay = document.querySelector(".dropbtn span");
    
    if (cartCountDisplay) {
        const cartCount = carrito.length; // Obtener el número de productos en el carrito
        cartCountDisplay.textContent = cartCount; // Actualizar el número en el contador

        // Asegura el estilo
        cartCountDisplay.style.backgroundColor = "#FFA500";
        cartCountDisplay.style.color = "white";
        cartCountDisplay.style.fontWeight = "bold";
        cartCountDisplay.style.fontSize = "14px";
        cartCountDisplay.style.padding = "2px 6px";
        cartCountDisplay.style.borderRadius = "50%";
        cartCountDisplay.style.marginLeft = "8px";
        cartCountDisplay.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.2)";
        cartCountDisplay.style.display = "inline-block";
    }
}

function actualizarPopup(productos) {
    const cartPopup = document.getElementById('cart-popup');
    cartPopup.innerHTML = ''; // Limpiar contenido previo

    cartPopup.innerHTML += `<h3>Carrito de Compras</h3>`;

    if (!Array.isArray(carrito) || carrito.length === 0) {
        cartPopup.innerHTML += `<p>No hay productos en el carrito.</p>`;
    } else {
        let total = 0;

        carrito.forEach(id => {
            const producto = productos.find(p => p.id === id);
            if (producto) {
                total += producto.precio;
                cartPopup.innerHTML += `
                    <div class="cart-item" id="cartItems" data-precio="${producto.precio}">
                        <span>${producto.nombre} - ${producto.precio.toFixed(2)} Bs</span>
                        <button class="remove-from-cart" data-id="${producto.id}">Eliminar</button>
                    </div>
                `;
            }
        });

        cartPopup.innerHTML += `<p class="cart-total">Total: <strong id="cart-total">${total.toFixed(2)}</strong> Bs</p>`;

        const botonesEliminar = cartPopup.querySelectorAll('.remove-from-cart');
        botonesEliminar.forEach(boton => {
            boton.addEventListener('click', function () {
                const productId = this.getAttribute('data-id');
                eliminarDelCarrito(productId);
            });
        });
    }

    updateCartCount(); // Llama después de actualizar el popup
}