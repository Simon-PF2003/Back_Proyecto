# TP_DSW_BackEnd
Parte back del TP

# TpDsw

**Parte Back del Trabajo**
PENDIENTES

Caso de uso: Retirar pedido y emitir factura:
•	Emision automática de la factura. Ver como rellenar campos de una factura según los datos del pedido. Convertir precio según datos como IVA.

--------------

Mejoras: 
Caso de uso: Retirar pedido y emitir factura --> Cuando se emite la factura, debe haber un reload que la saque de la interfaz.
Caso de uso de reporte de recaudación --> Si no es dificil, ver como guardar pdf de la factura en BD y permitir al usuario ver la factura.

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
Caso de uso: solicitar stock: LISTO --> Se modificó sección de Ingresar Stock y se reemplazó por gestión. Muestra listado con productos bajos de stock y permite ingresar cantidades a solicitar.
Caso de uso: ingresar stock: LISTO --> Se recuperan productos con stock pendiente y se permite modificar la cantidad a ingresar con advertencias. Se ingresan los productos especificados y se cambia el valor de pending segun la carga de stock.


Caso de uso de reporte: Recaudacion: LISTO --> En la sección de Recaudación, se presenta un filtro de fechas que muestra las facturas en dicho período y el total recaudado
