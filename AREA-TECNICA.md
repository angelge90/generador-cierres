# Exportación para Área Técnica

Se conserva el modo individual por JE. El segundo modo exporta todos los técnicos del resumen, incluidos los de cero días. No necesita seleccionar JE ni modifica el original.

1. Cargar un cierre mensual, elegir EXPORTAR PARA ÁREA TÉCNICA V2 e indicar periodo comercial.
2. Si MES/AÑO no son fiables, confirmar expresamente el periodo; si contradicen la selección se bloquea.
3. Generar exactamente DATOS_Y_ECONOMICOS.xlsx (RESUMEN e INFORME agregado) y DETALLES.xlsx (seis hojas).
4. Revisar la conciliación. Un resumen con identificación o KPI esencial inválido no se exporta. Un detalle con operaciones sin matrícula o campos sin resultado se identifica como pendiente; se permite exportar el resumen e incorporarlo por separado.

Los encabezados de matrícula y KPI deben ser únicos, con porcentajes decimales o texto porcentual explícito. Productividad es numérica; Prod s/josmil no se equipara a Prod. Los campos originales del resumen se conservan después del contrato, incluidos conceptos económicos. Errores/fórmulas sin caché se marcan mediante texto de estado, nunca cero. Nombres de JE se extraen de JE, sin asignarlos por semejanza. La V2 valida de nuevo rol y ámbito contra su directorio.

Ambos archivos contienen un identificador de lote. DETALLES únicamente puede incorporarse a ese resumen, matrícula, JE y periodo; no actualiza otra versión por coincidencia. DATOS contiene una fila por matrícula y periodo. Los seis detalles se filtran exactamente por las matrículas del resumen; las ajenas y las no identificadas se contabilizan. No se recalculan importes ni KPI.

La primera versión procesa un cierre mensual por ejecución. Para diez meses repetir la exportación mensual, manteniendo los archivos de cada periodo en carpetas separadas. No se añade consolidación masiva opcional en esta entrega.

Las pruebas utilizan datos ficticios. Pendiente contrastar ambos Excel contra un original autorizado: no se declara homologación real. El modo individual conserva sus reglas previas; las validaciones estrictas descritas aquí pertenecen al modo normalizado. Se utilizan las bibliotecas ya existentes del Generador y sus recursos de carga; el fichero de cierre se procesa en el navegador.

Pruebas unitarias del exportador: `node --test tests/normalizados.test.cjs`. El recorrido navegador y la integración con PostgreSQL están documentados en la PR de Área Técnica V2, utilizando la misma versión de normalizados.js.
