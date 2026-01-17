# No Personal Data — Anonimitzador de dades (client-side)

Aquesta aplicació web permet **pseudonimitzar** un full de càlcul (CSV o Excel) directament des del navegador. L’objectiu és separar les dades sensibles (PII) en un fitxer privat i deixar un fitxer públic apte per a analítica o compartició.

## Què fa

1. **Carrega un fitxer** `.csv` o `.xlsx` des del navegador.
2. Mostra una **previsualització de 3 files** del contingut.
3. Permet **seleccionar quines columnes vols “anonimitzar”** (p. ex. nom, email, telèfon, DNI…).
4. Genera un **identificador autonumèric** per a cada registre (`1, 2, 3, ...`).
5. Crea dos fitxers resultants:

   * **Fitxer privat**: conté `id` + **les columnes seleccionades** (dades sensibles).
   * **Fitxer públic**: conté `id` + **la resta de columnes** (dades no sensibles).
6. Mostra una **previsualització de 3 files** dels dos resultats en paral·lel (privat/públic).
7. Permet **descarregar** els dos fitxers amb el mateix nom que l’original, afegint:

   * `_private.xlsx`
   * `_public.xlsx`

## Per què és útil

* Mantens la traçabilitat entre dades privades i públiques mitjançant un `id`.
* Pots compartir el fitxer públic amb menys risc, mantenint la correspondència privada en un canal segur.
* Tot el processament és **local al navegador**.

## Privacitat i seguretat

* L’aplicació funciona **100%** al navegador web: les dades **no s’envien a cap servidor**.
* Estrictament parlant, l'aplicació fa pseudoanonimització, perquè permet reconstruir l'identitat dels registres del fitxer públic a partir del privat. Per tenir anonimització completa, simplement elimina el fixter privat una vegada generat. 
* No publiquis ni comparteixis el fitxer `_private`.

## Formats suportats

* Entrada: `.csv`, `.xlsx`
* Sortida: `.xlsx` (dos fitxers)


## Llicència

A determinar.