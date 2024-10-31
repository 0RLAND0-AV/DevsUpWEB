let carrito = JSON.parse(localStorage.getItem('carrito')) || [];  // Carga el carrito desde localStorage o un arreglo vacío si no existe

document.addEventListener('DOMContentLoaded', function () {
    // Actualiza el contador al cargar la página
    updateCartCount();

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
        cartPopup.setAttribute('data-event-registered', 'true');

        // Delegación de eventos para los botones de eliminar del carrito
        cartPopup.addEventListener('click', function (event) {
            if (event.target.classList.contains('remove-from-cart')) {
                const productId = event.target.getAttribute('data-id');
                eliminarDelCarrito(productId);
            }
        });
    }

    // Actualiza el total al abrir el popup
    cartPopup.addEventListener('mouseenter', calcularTotalCarrito);
});

function agregarAlCarrito(productId) {
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
            alert(data.mensaje);
            actualizarPopup(data.productos);
            saveCarrito();  // Guarda el carrito en localStorage
        } else {
            alert('Error: ' + data.mensaje);
        }
    })
    .catch(error => {
        console.error('Error en la solicitud:', error);
    });
}

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
            actualizarPopup(data.productos);
            saveCarrito();  // Guarda el carrito en localStorage
        }
    })
    .catch(error => {
        console.error('Error en la solicitud:', error);
    });
}

function actualizarPopup(productos) {
    const cartPopup = document.getElementById('cart-popup');
    cartPopup.innerHTML = `<h3>Carrito de Compras</h3>`;

    if (!Array.isArray(carrito) || carrito.length === 0) {
        cartPopup.innerHTML += `<p>No hay productos en el carrito.</p>`;
    } else {
        let total = 0;

        carrito.forEach(id => {
            const producto = productos.find(p => p.id === id);
            if (producto) {
                total += producto.precio;
                cartPopup.innerHTML += `
                    <div class="cart-item" data-precio="${producto.precio}">
                        <span>${producto.nombre} - ${producto.precio.toFixed(2)} Bs</span>
                        <button class="remove-from-cart" data-id="${producto.id}">Eliminar</button>
                    </div>
                `;
            }
        });

        cartPopup.innerHTML += `<p class="cart-total">Total: <strong id="cart-total">${total.toFixed(2)}</strong> Bs</p>`;
    }

    updateCartCount();
    saveCarrito();  // Guarda el carrito en localStorage
}

function calcularTotalCarrito() {
    const items = document.querySelectorAll('.cart-item');
    let total = 0;

    items.forEach(item => {
        const precio = parseFloat(item.getAttribute('data-precio'));
        total += precio;
    });

    document.getElementById('cart-total').textContent = total.toFixed(2);
}

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

function updateCartCount() {
    const cartCountDisplay = document.querySelector(".dropbtn span");

    if (cartCountDisplay) {
        const cartCount = carrito.length;
        cartCountDisplay.textContent = cartCount;
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

function saveCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));  // Guarda el carrito en localStorage
}