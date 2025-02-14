# TP_DSW_BackEnd
Parte back del TP

# TpDsw

**Parte Front del Trabajo**
PENDIENTES

Caso de uso: Retirar pedido y emitir factura:
•	Emision automática de la factura. Ver como rellenar campos de una factura según los datos del pedido. Convertir precio según datos como IVA.


Caso de uso: Actualizar o agregar producto:
o	Es necesario el cambio en la interfaz en la actualización?? Ralentiza los tiempos de carga, es poco accesible y poco usable. Tener que buscar al producto por ID es ridículo. Me gusta mas como esta hecho. PREGUNTAR A RIPANI.
•	Validar existencia del producto según el nombre (si es que no esta hecho).

Caso de uso: Actualizar o agregar proveedor:
•	Si no me equivoco, falta la actualización, pero no me acuerdo.

Caso de uso: solicitar stock:
•	Agregar OC.
o	Esta hecha la parte del stock mínimo. Mantendria eso como listado para hacer los pedidos, pero no cargaría las cantidades directamente. Generamos una OC que se guarde y después vemos si manual o automáticamente reciclamos el mismo listado para ingresarlo definitivamente al sistema.

Caso de uso: ingresar stock:
•	Listado de todos los productos y agregar stock manualmente. Digamos que ya esta medio hecho, pero habría que eliminar el campo de stock mínimo en esa sección. 
Caso de uso: Recaudacion periodo de fechas:
•	Falta todo. Primero hay que hacer las faturas.

Caso de uso de reporte: Recaudacion
---------------

PREGUNTAS
Caso de uso: Actualizar o agregar producto:
o	Es necesario el cambio en la interfaz en la actualización?? Ralentiza los tiempos de carga, es poco accesible y poco usable. Tener que buscar al producto por ID es ridículo. Me gusta mas como esta hecho. PREGUNTAR A RIPANI

--------------

TERMINADOS
Caso de uso: Conformar pedido: LISTO
Caso de uso: Cancelar pedido: Listo 
Caso de uso: Agrupar por categoría: LISTO
Caso de uso: Registrar Cliente: LISTO
Caso de uso: Ordenar Clientes: LISTO --> Se cambio la fecha de ultima venta mostrada desde pedidos hasta facturas.
Caso de uso: Realizar Pedido: LISTO --> Al realizar tema de facturación, si seleccionamos que no realizó el pago el cliente pasa a ser moroso y no se le permite la compra. Si seleccionamos que lo realizó, sigue al día.

Caso de uso: agregar o actualizar cliente: LISTO --> Se agregó una sección MODIFICAR USUARIOS en Admin Panel. Muestra un listado de usuarios que pueden filtrarse y modificarse. Existe un boton de agregar clientes para dar de alta a un cliente en la BD con todos los campos necesarios llenos. 