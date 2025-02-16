# TP_DSW_BackEnd
Parte back del TP

# TpDsw

**Parte Back del Trabajo**

Mejoras: 
Caso de uso de reporte de recaudación --> Si no es dificil, ver como guardar pdf de la factura en BD y permitir al usuario ver la factura.
PAGINACION ¿?

--------------

TERMINADOS
Caso de uso: Conformar pedido: LISTO
Caso de uso: Cancelar pedido: Listo 
Caso de uso: Agrupar por categoría: LISTO
Caso de uso: Registrar Cliente: LISTO
Caso de uso: Ordenar Clientes: LISTO
Caso de uso: Realizar Pedido: LISTO
Caso de uso: Retirar pedido y emitir factura: LISTO --> Al emitir la factura, se descarga la factura emitida como pdf con la fecha actual y el id.

Caso de uso: agregar o actualizar cliente: LISTO
Caso de uso: Actualizar o agregar producto: LISTO --> Se valido al crear un nuevo producto que no este cargada su descripcion para no tener productos repetidos (no case sensitive). Se creo una sección de Modificar Productos que muestra un listado de los productos existentes y pueden filtrarse para editarlos.
Caso de uso: Actualizar o agregar proveedor: LISTO --> Se agregó una sección Modificar Proveedores que muestra un listado de proveedores, pudiendo filtrarlos por razon social o cuit, y editarlos.
Caso de uso: solicitar stock: LISTO --> Se modificó sección de Ingresar Stock y se reemplazó por gestión. Muestra listado con productos bajos de stock y permite ingresar cantidades a solicitar.
Caso de uso: ingresar stock: LISTO --> Se recuperan productos con stock pendiente y se permite modificar la cantidad a ingresar con advertencias. Se ingresan los productos especificados y se cambia el valor de pending segun la carga de stock.


Caso de uso de reporte: Recaudacion: LISTO --> En la sección de Recaudación, se presenta un filtro de fechas que muestra las facturas en dicho período y el total recaudado
