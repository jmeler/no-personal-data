# No Personal Data 

Aquesta aplicació web permet **pseudonimitzar** o **anonimitzar** un full de càlcul (CSV, Excel o ODS) directament des del navegador. L’objectiu és separar les dades sensibles en un fitxer privat i deixar un fitxer públic, apte per a analítica o compartició.

## Què fa

1. **Carrega un full de càlcul** `.csv`,`.xlsx`, `.ods` o `.pdf` des del navegador.
2. Mostra una **previsualització de 3 files** del full original.
3. Permet **seleccionar quines columnes vols “anonimitzar”** (p. ex. nom, email, telèfon, DNI…).
4. Genera un **identificador autonumèric** per a cada registre (`1, 2, 3, ...`).
5. Crea dos fitxers resultants:

   * **Fitxer privat**: conté `id` + **les columnes seleccionades** (dades personals).
   * **Fitxer públic**: conté `id` + **la resta de columnes** (dades no personals).
6. Mostra una **previsualització de 3 files** dels dos resultats en paral·lel (privat/públic).
7. Permet **descarregar** els dos fitxers amb el mateix nom que l’original, afegint:

   * `_private.xlsx`
   * `_public.xlsx`

## Per què és útil

* Mantens la traçabilitat entre dades privades i públiques mitjançant un camp clau `id`.
* Pots compartir el fitxer públic sense risc, mantenint la correspondència privada en un canal segur.
* Tot el processament és **local al navegador**. No s'envia cap dada fora del dispositiu de l'usuari. 

## Privacitat i seguretat

* L’aplicació funciona **100%** al navegador web: les dades **no s’envien a cap servidor**.
* Estrictament parlant, l'aplicació fa pseudoanonimització, perquè permet reconstruir l'identitat dels registres del fitxer públic a partir del privat. Per tenir anonimització completa, simplement elimina el fixter privat una vegada generat. 
* No publiquis ni comparteixis el fitxer `_private`.

## Formats suportats

* Entrada: `.csv`, `.xlsx`, `.ods`, `.pdf` (detecta la primera taula del document)
* Sortida: `.xlsx` (dos fitxers)


## Llicència

MIT — © 2026 Xavier Meler
