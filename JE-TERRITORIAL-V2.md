# Corrección de responsables en el modo V2

## Causa reproducida

El exportador normalizado aplicaba una clave que eliminaba signos de puntuación. De ese modo, `JE` y el auxiliar `JE?` se convertían en la misma cabecera y producían «Cabecera ausente o ambigua: JE». El generador individual conserva `?` al normalizar sus cabeceras. La corrección utiliza esa misma regla para identificar al responsable y reproduce el conflicto mediante archivos totalmente sintéticos. No se ha leído el cierre original de enero ni se declara homologado.

## Reglas

- Matrícula JE y su etiqueta/lista están completamente ocultas y deshabilitadas en el modo V2. No intervienen en la exportación territorial.
- Se recorre todo el resumen: una fila por matrícula y periodo, sin filtrar JE ni días trabajados. Los ceros se conservan.
- `JE?` nunca se utiliza como responsable. Se exige una columna literal `JE`, con la normalización de acentos, espacios y mayúsculas que utiliza el modo individual; se conserva la puntuación.
- Se carga el directorio de la pestaña JE con encabezados únicos `JE` y `NOMBRE COMPLETO`. Los nombres provienen exclusivamente de esa pestaña; el modo V2 no usa nombres de respaldo ni asignaciones inventadas.
- Si hay varias columnas literales JE, se comprueba cada una contra el directorio en todas las filas del resumen. Solo se acepta una columna completa válida. Si varias dan exactamente las mismas asignaciones en todas las filas, se documentan como equivalentes. Si dan responsables distintos, se bloquea; no se elige la primera por posición.
- Un identificador desconocido, vacío o ambiguo, o un responsable sin nombre válido, genera un error específico y no exporta parcialmente el resumen. Los mensajes no incluyen identificadores personales.
- Los identificadores numéricos JE sin formato se representan por su decimal exacto cuando son enteros seguros y coinciden con el directorio. No se añaden ceros ni se equiparan `123` y `00123`. Las matrículas de técnicos mantienen sus validaciones anteriores.
- Las seis hojas de DETALLES conservan el periodo, matrícula y JE exactos del resumen. Se mantienen los recuentos ajenos y pendientes.

## Periodo y mensajes

El selector solo se muestra en el modo V2. Se rellena únicamente con MES/AÑO comprobables en sus celdas de control C3/D3 y C4/D4. Si no existen, se exige selección y confirmación; si contradicen lo seleccionado se bloquea. Al cambiar de archivo se borran tanto la selección anterior como su confirmación antes de leer el nuevo periodo.

Cada intento V2 reemplaza el estado anterior y sus errores. Al cambiar de modo o cargar otro libro también se limpia el mensaje. La lectura de metadatos consulta únicamente las celdas de control, evitando recorrer hojas adicionales en el modo individual.

## Comprobaciones

- `node --test tests/normalizados.test.cjs`: **13 superadas, 0 fallidas**. Incluye JE/JE?, duplicados literales válidos/equivalentes/contradictorios, directorio incompleto, ceros de identificación, 43 técnicos de nueve JE, días cero, seis hojas, importes y periodos.
- `tests/v2-responsables.browser.cjs`: **7 comprobaciones superadas**, cero errores JavaScript. Comprueba campo JE invisible, dos descargas territoriales con ambas jefaturas, seis hojas, periodos fiables, errores sin acumulación, confirmación no heredada y generación individual conservada.
- Se utilizan las bibliotecas que ya carga el Generador. El navegador de prueba sirve el código local y bibliotecas locales de prueba con datos inventados. No se han ejecutado baterías de otros proyectos ni modificado Área Técnica V2, Render o Neon.

Para repetir el recorrido de navegador se necesitan Node.js, Playwright, ExcelJS, JSZip y Chromium disponibles como dependencias de prueba. Ejecutar `node tests/v2-responsables.browser.cjs` con `XLSX_TEST_BUNDLE` apuntando a una copia local de la misma biblioteca xlsx-js-style 1.2.0 que utiliza la aplicación y, si corresponde, `NODE_PATH`/`CHROMIUM_PATH` para las herramientas instaladas. El uso normal de la página no añade dependencias nuevas.

La propuesta requiere revisión antes de fusionar. No se publica ni se modifica main en esta entrega.
