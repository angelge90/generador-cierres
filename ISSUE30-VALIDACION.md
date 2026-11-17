# Generador territorial — comprobaciones del issue 30

- El literal `-` en el KPI NPS se exporta como dato no disponible (`null`), nunca como cero. No se aplica esta excepción a importes ni a otras columnas.
- Un responsable ausente del directorio JE solo se admite cuando una única fila del resumen acredita su identidad exacta: su matrícula coincide con su JE y dispone de nombre válido. Si existe en el directorio, el nombre debe coincidir. Referencias desconocidas, nombres contradictorios y asignaciones ambiguas siguen bloqueadas.
- Se conservan todos los técnicos, incluidos días trabajados cero, sus importes y su periodo. Se mantienen los dos Excel territoriales y las seis hojas de detalles, sin solicitar matrícula JE. El modo individual se conserva.
- Se mantiene la comprobación de disponibilidad de `periodMetadata` y se cambia la versión de caché del script normalizado.

Pruebas sintéticas ejecutadas: 15 pruebas focalizadas, sin fallos; 8 comprobaciones de navegador local, sin errores JavaScript. El recorrido exporta 43 técnicos ficticios, dos máster no incluidos en JE, seis NPS ausentes, importes literales y seis hojas con sus asociaciones exactas. También comprueba periodo contradictorio, confirmación de periodo sin metadatos, errores sin acumulación y exportación individual.

El Excel original no está disponible en este entorno. No se declara homologado enero ni los otros cierres reales. La publicación en GitHub Pages tampoco se declara validada: las peticiones HTTP fueron bloqueadas y la navegación pública agotó su tiempo de espera. Los cambios se han probado sirviendo localmente los mismos archivos de aplicación; la autorización pública existente no se ha modificado.
