from django.shortcuts import render, redirect, get_object_or_404
from django.urls import path
from django.contrib import admin
from .models import Usuario , Producto ,Categoria,CarritoProducto , Departamento,Provincia,subCategoria,EstadoDelProducto,Imagenes
from django.http import HttpResponse ,JsonResponse,HttpResponseRedirect
from django.contrib.auth import authenticate, login ,logout , authenticate
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model



# Create your views here.
def baseView(request):
    '''Esto es la pagina principal'''
        
    user_id = request.session.get('user_id')
    user = None
    if user_id:
        user = Usuario.objects.get(idUsuario=user_id)
    productos = Producto.objects.filter(estado_producto=True) #solo mostrare los productos que este activos
    categorias = Categoria.objects.prefetch_related('subcategorias').all()  # Obtiene todas las categorías y sus subcategorías   
    carritos = CarritoProducto.objects.filter(usuario=user)
    return render(request, "base.html",{'user': user, 'productos': productos, 'categorias': categorias,'carritos': carritos})

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        
        # Autenticar usuario
        user = Usuario.objects.filter(nombre=username, contraseña=password).first()

        if user:
            # Guardar usuario en la sesión
            request.session['user_id'] = user.idUsuario
            request.session['username'] = user.nombre  # Guardar el nombre del usuario en la sesión
            messages.success(request, '¡Bienvenido, {}! Has iniciado sesión correctamente.'.format(user.nombre))
            return redirect('base')  # Redirige a la página principal
        else:
            messages.error(request, 'Usuario o contraseña incorrectos')
            return redirect('base')  # Redirige a la página principal
    
    return render(request, 'base.html')

# se añadio telefono con el valor de NumTelefono para mandarlo a la BD(celular)
def registroView(request):
    if request.method == 'POST':
        # Obtener los datos del formulario
        nombre = request.POST.get('username')
        correo = request.POST.get('email')
        telefono = request.POST.get('NumTelefono')
        contraseña = request.POST.get('password')
        confirmar_contraseña = request.POST.get('confirmPassword')

        # Validación básica
        if contraseña != confirmar_contraseña:
            messages.error(request, 'Las contraseñas no coinciden.')
            return redirect('registro')

        if Usuario.objects.filter(correo=correo).exists():
            messages.error(request, 'El correo electrónico ya está registrado.')
            return redirect('registro')

        # Crear y guardar el usuario en la base de datos
        usuario = Usuario(nombre=nombre, correo=correo, contraseña=contraseña, celular=telefono)
        try:
            usuario.save()
            messages.success(request, 'Usuario registrado exitosamente.')
            return redirect('base')  # Redirige al login después del registro
        except ValidationError as e:
            messages.error(request, 'Ocurrió un error al guardar el usuario.')
            return redirect('registro')

    return render(request, 'registro.html')

def perfil_view(request):
    user_id = request.session.get('user_id')
    
    if not user_id:
        return redirect('login')  # Redirigir al login si no está autenticado
    
    user = Usuario.objects.get(idUsuario=user_id)
    carritos = CarritoProducto.objects.filter(usuario=user)

    if request.method == 'POST':
        # Si hay un archivo de imagen en la solicitud
        if 'imagenPerfil' in request.FILES:
            user.foto = request.FILES['imagenPerfil']  # Asigna la nueva imagen
        
        # Actualizar el nombre y el correo electrónico
        user.nombre = request.POST.get('nombre', user.nombre)  # Obtiene el nuevo nombre, o mantiene el antiguo
        user.correo = request.POST.get('correo', user.correo)  # Actualiza el correo electrónico

        nueva_contraseña = request.POST.get('contraseña')
        if nueva_contraseña:  # Si se proporcionó una nueva contraseña
            user.contraseña = nueva_contraseña  # Asigna la nueva contraseña

        nuevo_celular = request.POST.get('celular')
        if nuevo_celular:  # Si se proporcionó una nueva contraseña
            user.celular = nuevo_celular  # Asigna la nueva contraseña
            
        user.save()  # Guarda los cambios en la base de datos

    return render(request, 'perfil.html', {'user': user,'is_profile_page': True,'carritos': carritos})

def logout_request(request):
    logout(request)
    messages.info(request, "Saliste exitosamente")
    return redirect("base")
#para eliminar
#@login_required
def eliminar_del_carrito(request, producto_id):
    if request.method == "DELETE":
        try:
            #obtenemos al usuario primero
            user_id = request.session.get('user_id')
            user = Usuario.objects.get(idUsuario=user_id)
            #obtenemos al carrito que quiere eliminar si hay un error nos mostrara la pagina 404
            carrito_item = get_object_or_404(CarritoProducto, usuario=user, producto__id=producto_id)
            carrito_item.delete()
            mensaje = f"El producto ha sido eliminado del carrito."

            # Recuperar todos los productos en el carrito
            productos_en_carrito = CarritoProducto.objects.filter(usuario=user)
            lista_productos = [{'id': item.producto.id, 'nombre': item.producto.nombre, 'precio': int(item.producto.precio)} for item in productos_en_carrito]

            return JsonResponse({
                'mensaje': mensaje,
                'success': True,
                'productos': lista_productos  # Enviar la lista de productos en el carrito
            })
        except Exception as e:
            return JsonResponse({'mensaje': 'Error al eliminar el producto.', 'success': False}, status=500)

    return JsonResponse({'mensaje': 'Método no permitido.', 'success': False}, status=405)


@require_POST
def agregar_al_carrito(request, producto_id):
    print(f"Solicitud recibida: {request.method} para producto ID: {producto_id}")

    if request.method == "POST":
        try:
            producto = get_object_or_404(Producto, id=producto_id)
            print(f"Producto encontrado: {producto.nombre}")
            user_id = request.session.get('user_id')
            user = Usuario.objects.get(idUsuario=user_id)
            print(f"Usuario encontrado: {user.nombre}")

            # Verificación: Evitar que el usuario agregue su propio producto
            if producto.usuario == user:
                mensaje = "No puedes agregar tu propio producto al carrito."
                print(mensaje)
                return JsonResponse({'mensaje': mensaje, 'success': False})


            carrito_producto, created = CarritoProducto.objects.get_or_create(usuario=user, producto=producto)
            print(f"Item del carrito {'creado' if created else 'ya existente'}: {carrito_producto}")

            if created:
                mensaje = f"El producto '{producto.nombre}' se agregó al carrito."
            else:
                mensaje = f"El producto '{producto.nombre}' ya está en tu carrito."

            # Recuperar todos los productos en el carrito
            productos_en_carrito = CarritoProducto.objects.filter(usuario=user)
            lista_productos = [{'id': item.producto.id, 'nombre': item.producto.nombre, 'precio': int(item.producto.precio)} for item in productos_en_carrito]

            print(f"Mensaje enviado: {mensaje}")
            return JsonResponse({
                'mensaje': mensaje,
                'success': True,
                'productos': lista_productos  # Enviar la lista de productos en el carrito
            })

        except Exception as e:
            print(f"Error al agregar al carrito: {e}")
            return JsonResponse({'mensaje': 'Error interno del servidor.', 'success': False}, status=500)

    print("Método no permitido.")
    return JsonResponse({'mensaje': 'Método no permitido.', 'success': False}, status=405)
  
# Vista para obtener provincias según el departamento seleccionado
def cargar_provincias_por_departamento(request):
    departamento_id = request.GET.get('departamento_id')
    if departamento_id:
        provincias = Provincia.objects.filter(departamento_id=departamento_id).values('id', 'nombre')
        return JsonResponse({'provincias': list(provincias)}, status=200)
    return JsonResponse({'error': 'No se encontraron provincias'}, status=404)


def ofertarMView(request):
    # Obtener el usuario desde la sesión
    user_id = request.session.get('user_id')
    carritos = CarritoProducto.objects.filter(usuario=user_id)
    # Si no hay usuario en sesión, redirigir al login
    if not user_id:
        return redirect('login')

    # Obtener el usuario o lanzar un 404 si no existe
    user = get_object_or_404(Usuario, idUsuario=user_id)

    if request.method == 'POST':
        # Obtener los datos del formulario
        titulo = request.POST.get('titulo')
        provincia = request.POST.get('provincia')
        direccion = request.POST.get('urlMapa')
        material = request.POST.get('material')
        precio = request.POST.get('precio')
        estados = request.POST.get('estado')
        descripcion = request.POST.get('descripcion')

        print(f"Material recibido: {material}")
        print(f"provincia: {provincia}")
        print(f"estado: {estados}")
        # Recuperar las instancias necesarias
        subcategoria_obj = subCategoria.objects.get(nombre=material)
        estado_obj = EstadoDelProducto.objects.get(estado=estados)
        provincia_obj = Provincia.objects.get(nombre=provincia)

        # Crear el nuevo producto
        producto = Producto(
            nombre=titulo,
            provincia=provincia_obj,
            subcategoria=subcategoria_obj,
            precio=precio,
            descripcion=descripcion,
            estado=estado_obj,
            usuario=user  # Relacionar el producto con el usuario actual
        )

        # Guardar el producto
        producto.save()

        # Guardar las imágenes subidas
        for archivo in request.FILES.getlist('archivo'):
            imagen = Imagenes(ruta=archivo, producto=producto)
            imagen.save()

        messages.success(request, '¡Oferta creada exitosamente!')
        return redirect('base')

    # Si la solicitud es GET, renderizar el formulario con el usuario
    return render(request, 'ofertar.html', {'user': user,'is_profile_page': True,'carritos': carritos})


def mis_materiales(request):
    user_id = request.session.get('user_id')
    user = get_object_or_404(Usuario, idUsuario=user_id)
    carritos = CarritoProducto.objects.filter(usuario=user_id)

    # Recupera todos los productos del usuario autenticado
    productos = Producto.objects.filter(usuario=user_id)

    # Filtra los productos si se selecciona una opción en el filtro
    filtro = request.GET.get('filtro')
    if filtro == 'activos':
        productos = productos.filter(estado_producto=True)
    elif filtro == 'inactivos':
        productos = productos.filter(estado_producto=False)


    return render(request, 'productos_usuario.html', {'user': user,'is_profile_page': True,'carritos': carritos,'misProductos': productos})

def detalle_producto(request, producto_id):
    user_id = request.session.get('user_id')
    user = get_object_or_404(Usuario, idUsuario=user_id)
    carritos = CarritoProducto.objects.filter(usuario=user_id)

    producto = get_object_or_404(Producto, id=producto_id)
    categorias = Categoria.objects.all()  # Traer todas las categorías
    subcategorias = subCategoria.objects.filter(categoria=producto.subcategoria.categoria)  # Subcategorías de la categoría del producto
    departamentos = Departamento.objects.all()  # Todos los departamentos
    provincias = Provincia.objects.filter(departamento=producto.provincia.departamento)  # Provincias del departamento del producto
    estados = EstadoDelProducto.objects.all()  # Todos los estados de los productos

    if request.method == 'POST':
        # Actualizar los datos del producto
        producto.nombre = request.POST.get('nombre')
        producto.descripcion = request.POST.get('descripcion')
        producto.precio = request.POST.get('precio')
        producto.subcategoria_id = request.POST.get('subcategoria')
        producto.provincia_id = request.POST.get('provincia')
        producto.estado_id = request.POST.get('estado')
        producto.estado_producto = 'estado_producto' in request.POST

        # Verificar que el nombre no sea nulo
        if not producto.nombre:
            messages.error(request, "El nombre del producto no puede estar vacío.")
            return render(request, 'detalle_producto.html', {'producto': producto, 'categorias': categorias, 'subcategorias': subcategorias, 'departamentos': departamentos, 'provincias': provincias, 'estados': estados})

        # Guardar el producto actualizado
        producto.save()

        # Procesar las nuevas imágenes
        if request.FILES.getlist('nuevas_imagenes'):
            for imagen in request.FILES.getlist('nuevas_imagenes'):
                Imagenes.objects.create(producto=producto, ruta=imagen)

       

        return redirect('detalle_producto', producto_id=producto.id)

    return render(request, 'detalle_producto.html', {
        'user': user,
        'is_profile_page': True,
        'carritos': carritos,
        'producto': producto,
        'categorias': categorias,
        'subcategorias': subcategorias,
        'departamentos': departamentos,
        'provincias': provincias,
        'estados': estados,
        #'imagenes': producto.imagenes.all(),
    })
def eliminar_imagenes(request):
    if request.method == 'POST':
        imagenes_a_eliminar = request.POST.getlist('imagenes_a_eliminar')
        
        for imagen_id in imagenes_a_eliminar:
            imagen = get_object_or_404(Imagenes, id=imagen_id)
            imagen.delete()
        
        # Retorna una respuesta de éxito como JSON
        return JsonResponse({'status': 'success', 'message': 'Imágenes eliminadas correctamente.'})
    
    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)

def obtener_subcategorias(request, categoria_id):
    subcategorias = subCategoria.objects.filter(categoria_id=categoria_id).values('id', 'nombre')
    return JsonResponse({'subcategorias': list(subcategorias)})

def obtener_provincias(request, departamento_id):
    provincias = Provincia.objects.filter(departamento_id=departamento_id).values('id', 'nombre')
    return JsonResponse({'provincias': list(provincias)})

def eliminar_producto(request, producto_id):
    producto = get_object_or_404(Producto, id=producto_id)

    if request.method == 'POST':
        try:
            producto.delete()
            messages.success(request, 'El producto ha sido eliminado exitosamente.')
            return redirect('mis_materiales')  # Redirigir a la vista de productos o la página principal
        except Exception as e:
            messages.error(request, 'Hubo un problema al eliminar el producto: {}'.format(str(e)))
            return redirect('detalle_producto', producto_id=producto_id)

    # Para propósitos de prueba, permite eliminar también con GET (NO RECOMENDADO en producción)
    elif request.method == 'GET':
        try:
            producto.delete()
            messages.success(request, 'El producto ha sido eliminado exitosamente.')
            return redirect('mis_materiales')
        except Exception as e:
            messages.error(request, 'Hubo un problema al eliminar el producto: {}'.format(str(e)))
            return redirect('detalle_producto', producto_id=producto_id)

    messages.error(request, 'Método no permitido.')
    return redirect('detalle_producto', producto_id=producto_id)
@csrf_exempt  # Solo si tienes problemas con CSRF, de lo contrario no lo uses
def eliminar_productos(request):
    if request.method == 'POST':
        product_ids = json.loads(request.POST.get('product_ids', '[]'))

        # Eliminar los productos seleccionados
        Producto.objects.filter(id__in=product_ids).delete()

        # Redirigir de nuevo a la página anterior
        return HttpResponseRedirect(request.META.get('HTTP_REFERER', '/'))

    return JsonResponse({'error': 'Método no permitido.'}, status=405)


