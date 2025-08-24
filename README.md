# Proyecto Final

Parte back del TP

**Parte Back del Trabajo**

Cambios realizados:

- Reorganización routes / controllers:
  *Bills
  *Orders
  *Products
  *Suppliers
  \*Users
- Mejor administracion de middlewares
- Creacion de utils para reciclar codigo de envio de mails.
- Creacion controllers profileController, emailController
- Todos los datos sensibles fueron referenciados como process.env.{nombre_variable}
Commit "Agregado de contador AutoIncremental"
- Agregue un nuevo init al index que inicializa los contadores "initCounters"
- Cree un nuevo modelo que se llama counters.js donde se almacenan los contadores
- Agregue la refencia al contador counters en producto llamado code
- En el create del producto obviamente ahora hay que esperar a que la funcion busque en counters el ultimo de producto
