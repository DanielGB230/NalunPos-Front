# ADR 0003 — Estrategia de Almacenamiento del Token JWT

**Fecha:** 2026-09-09  
**Estado:** Aprobado  
**Contexto:** El token JWT del backend debe almacenarse en el cliente para adjuntarlo en requests subsiguientes.

## Decisión
Almacenar el token en **memoria (Signal)** como fuente de verdad, con **sessionStorage** como respaldo para persistencia dentro de la pestaña activa.

## `localStorage` está PROHIBIDO.

## Razones
- **Seguridad XSS:** `localStorage` es accesible por cualquier script JavaScript en la página. Un ataque XSS puede robar el token permanentemente. `sessionStorage` tiene el mismo riesgo en la sesión activa, pero el daño se limita a esa pestaña y ese momento.
- **Sesión por pestaña:** `sessionStorage` se limpia al cerrar la pestaña. Esto es el comportamiento correcto para una aplicación POS de negocio (un cajero no debería quedar "logueado" si cierra el navegador).
- **Signal como caché en memoria:** El `authInterceptor` lee el token del Signal, evitando accesos repetidos a `sessionStorage` en cada request.

## Consecuencias
- Al recargar la página, el token se restaura desde `sessionStorage` si existe y no ha expirado.
- Al cerrar la pestaña o el navegador, la sesión se pierde y el usuario debe volver a loguearse.
- En ambientes con SSO futuro, este ADR deberá revisarse.
