# TP_DSW_BackEnd
Parte back del TP

# TpDsw

**Parte Front del Trabajo**
PENDIENTES

Caso de uso: Registrar Cliente:
•	Se genera una solicitud al admin que debe aceptar al usuario (incluir en alta de usuarios o nueva sección de admin panel).
•	Se debe generar id y contraseña automática. Ingresa con ID, no con email. CAMBIAR LOGIN.

Caso de uso: Realizar pedido:
•	Validar temas de moroso o al día. Para esto vamos a tener que hacer temas de facturación 

Caso de uso: Retirar pedido y emitir factura:
•	Deberíamos hacer búsqueda por mas de una cosa, inchequeable el nro de pedido. 
•	Emision automática de la factura. Ver como rellenar campos de una factura según los datos del pedido. Convertir precio según datos como IVA.

Caso de uso: agregar o actualizar cliente:
•	Incluir lo del registro. Profundizar edición. 
o	Raro lo de agregar un cliente porque deberías agregarlo manualmente desde esta sección y después te llega la notificación para que lo aceptes y le generes id y contraseña

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

Caso de uso: Ordena clientes
•	No se como esta el diagrama. Si hay entidad de facturas, tenemos que crearla y acambiar la fecha de ultima venta a la fecha de factura en vez de pedido. Si no, ya esta hecho.

---------------

PREGUNTAS
Caso de uso: Actualizar o agregar producto:
o	Es necesario el cambio en la interfaz en la actualización?? Ralentiza los tiempos de carga, es poco accesible y poco usable. Tener que buscar al producto por ID es ridículo. Me gusta mas como esta hecho. PREGUNTAR A RIPANI

--------------

TERMINADOS
Caso de uso: Conformar pedido: LISTO
Caso de uso: Cancelar pedido: Listo 
Caso de uso: Agrupar por categoría: LISTO