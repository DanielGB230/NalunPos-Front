# Política de Seguridad de NalunPos Frontend

El equipo de **NalunPos** se compromete a mantener la máxima integridad, confidencialidad y resiliencia en todas las aplicaciones del monorepo (`NalunPos-Web`, `NalunPos-Admin-Web`) y sus librerías compartidas. Agradecemos la colaboración de la comunidad de seguridad y de los desarrolladores en la identificación y reporte responsable de vulnerabilidades.

---

## 1. Versiones con Soporte de Seguridad

Únicamente la rama principal de producción recibe activamente parches, actualizaciones y revisiones de seguridad:

| Versión / Rama                             | Estado de Soporte         | Notas                                                                                      |
| :----------------------------------------- | :------------------------ | :----------------------------------------------------------------------------------------- |
| **`main`**                                 | **Soportada activamente** | Es la única rama que recibe parches y correcciones de seguridad inmediatas.                |
| Versiones anteriores / Releases históricas | **No soportadas**         | Cualquier entorno productivo debe mantenerse sincronizado con la última versión de `main`. |

---

## 2. Cómo Reportar una Vulnerabilidad (Divulgación Responsable)

Si has descubierto una vulnerabilidad de seguridad en NalunPos Frontend, te solicitamos **no divulgarla públicamente** (ni a través de issues de GitHub, foros o redes sociales) hasta que haya sido analizada y mitigada de forma coordinada.

### Canal de Notificación

> **Canal de Contacto:** `PENDIENTE: definir contacto de seguridad`

_(Nota: En tanto se define formalmente la casilla o plataforma dedicada de seguridad, cualquier reporte debe canalizarse de manera privada y confidencial a través de la vía designada por el equipo de administración)._

### Información Necesaria en el Reporte

Para acelerar la evaluación y resolución del incidente, por favor incluye en tu comunicación:

1. **Descripción detallada:** Explicación precisa de la vulnerabilidad y el vector de ataque detectado.
2. **Pasos para reproducir:** Instrucciones paso a paso, peticiones HTTP de muestra o un script de Prueba de Concepto (PoC) mínimo y reproducible.
3. **Alcance:** Módulos, componentes o aplicaciones afectadas (`apps/NalunPos-Web`, `apps/NalunPos-Admin-Web`, `libs/shared/*`).
4. **Impacto:** Evaluación del impacto potencial sobre la confidencialidad, integridad o disponibilidad de la sesión o datos de los usuarios.

---

## 3. Qué NO se Considera un Reporte Válido (Fuera de Alcance)

Para evitar ruido y saturación en los canales de atención, los siguientes casos se consideran **fuera de alcance** y no serán procesados como vulnerabilidades de seguridad:

- **Reportes automáticos sin PoC:** Salidas crudas o volcados masivos de escáneres automatizados (SAST/DAST) que no demuestren un vector de explotación viable en el contexto de nuestra aplicación.
- **Ataques de denegación de servicio:** Intentos de DoS o DDoS contra la infraestructura o servicios de hosting.
- **Ingeniería social y phishing:** Ataques dirigidos contra colaboradores, desarrolladores o usuarios de la plataforma.
- **Ataques físicos o de compromiso local previo:** Ataques que requieran acceso físico no autorizado al equipo de la víctima o privilegios elevados (root/administrador) sobre el sistema operativo o navegador del usuario.
- **Vulnerabilidades teóricas en herramientas de build:** Vulnerabilidades reportadas en herramientas que residen exclusivamente en `devDependencies` (e.g. Linters, compilers, plugins de desarrollo) y cuyos artefactos no se ejecutan ni empaquetan en el entorno de producción (`dist/`).
- **Buenas prácticas teóricas sin vector explotable:** Reclamaciones por la ausencia de cabeceras HTTP complementarias o configuraciones que no supongan una falla directa a la Content Security Policy (CSP) fija del proyecto.
