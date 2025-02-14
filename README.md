# TP_DSW_BackEnd
Parte back del TP

# TpDsw

**Parte Back del Trabajo**
PENDIENTES

Caso de uso: Retirar pedido y emitir factura:
•	Emision automática de la factura. Ver como rellenar campos de una factura según los datos del pedido. Convertir precio según datos como IVA.

Caso de uso: solicitar stock:
•	Agregar OC.
o	Esta hecha la parte del stock mínimo. Mantendria eso como listado para hacer los pedidos, pero no cargaría las cantidades directamente. Generamos una OC que se guarde y después vemos si manual o automáticamente reciclamos el mismo listado para ingresarlo definitivamente al sistema.

Caso de uso: ingresar stock:
•	Listado de todos los productos y agregar stock manualmente. Digamos que ya esta medio hecho, pero habría que eliminar el campo de stock mínimo en esa sección. 
Caso de uso: Recaudacion periodo de fechas:
•	Falta todo. Primero hay que hacer las faturas.

Caso de uso de reporte: Recaudacion
---------------

Mejoras a hacer
Busquedas de productos o por cuit/razon social --> Que si la busqueda esta vacia, devuelva todo.

--------------

TERMINADOS
Caso de uso: Conformar pedido: LISTO
Caso de uso: Cancelar pedido: Listo 
Caso de uso: Agrupar por categoría: LISTO
Caso de uso: Registrar Cliente: LISTO
Caso de uso: Ordenar Clientes: LISTO
Caso de uso: Realizar Pedido: LISTO

Caso de uso: agregar o actualizar cliente: LISTO
Caso de uso: Actualizar o agregar producto: LISTO --> Se valido al crear un nuevo producto que no este cargada su descripcion para no tener productos repetidos (no case sensitive). Se creo una sección de Modificar Productos que muestra un listado de los productos existentes y pueden filtrarse para editarlos.
Caso de uso: Actualizar o agregar proveedor: LISTO --> Se agregó una sección Modificar Proveedores que muestra un listado de proveedores, pudiendo filtrarlos por razon social o cuit, y editarlos.
