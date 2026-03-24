# No Personal Data

Esta aplicación web permite **pseudonimizar** o **anonimizar** una hoja de cálculo (CSV, Excel u ODS) directamente desde el navegador. El objetivo es separar los datos sensibles en un archivo privado y dejar un archivo público, apto para analítica o compartición.

## Qué hace

1. **Carga una hoja de cálculo** `.csv`, `.xlsx`, `.ods` o `.pdf` desde el navegador.
2. Muestra una **previsualización de 3 filas** de la hoja original.
3. Permite **seleccionar qué columnas quieres “anonimizar”** (p. ej., nombre, email, teléfono, DNI...).
4. Genera un **identificador autonumérico** para cada registro (`1, 2, 3, ...`).
5. Crea dos archivos resultantes:

   * **Archivo privado**: contiene `id` + **las columnas seleccionadas** (datos personales).
   * **Archivo público**: contiene `id` + **el resto de columnas** (datos no personales).
6. Muestra una **previsualización de 3 filas** de ambos resultados en paralelo (privado/público).
7. Permite **descargar** los dos archivos con el mismo nombre que el original, añadiendo:

   * `_private.xlsx`
   * `_public.xlsx`

## Por qué es útil

* Mantienes la trazabilidad entre datos privados y públicos mediante un campo clave `id`.
* Puedes compartir el archivo público sin riesgo, manteniendo la correspondencia privada en un canal seguro.
* Todo el procesamiento es **local en el navegador**. No se envía ningún dato fuera del dispositivo del usuario.

## Privacidad y seguridad

* La aplicación funciona **100%** en el navegador web: los datos **no se envían a ningún servidor**.
* Estrictamente hablando, la aplicación hace pseudoanonimización, porque permite reconstruir la identidad de los registros del archivo público a partir del privado. Para tener anonimización completa, simplemente elimina el archivo privado una vez generado.
* No publiques ni compartas el archivo `_private`.

## Formatos soportados

* Entrada: `.csv`, `.xlsx`, `.ods`, `.pdf` (detecta la primera tabla del documento)
* Salida: `.xlsx` (dos archivos)

## Licencia

MIT — © 2026 Xavier Meler
