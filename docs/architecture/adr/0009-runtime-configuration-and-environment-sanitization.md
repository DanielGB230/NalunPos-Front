# ADR 0009: Carga de Configuración en Runtime mediante APP_CONFIG Token

- **Estado**: Aprobado
- **Fecha**: 2026-10-28
- **Contexto**: Frontend Architecture & 12-Factor App Methodology

---

## 1. Contexto

Anteriormente, la URL del API Backend (`apiUrl: 'https://api.nalunpos.com'`) se encontraba codificada estáticamente en `environment.prod.ts`. Esta práctica presenta severas desventajas en arquitecturas cloud-native y despliegues empresariales:

1. **Violación del factor III de Twelve-Factor App (Configuración)**: La configuración debe ser estrictamente segregada del código y suministrada en el entorno de despliegue.
2. **Re-compilaciones innecesarias**: Mover una versión compilada entre entornos (desarrollo, staging, QA, producción) requería recompilar todo el bundle de Angular con `ng build --configuration=...`.
3. **Imposibilidad de inyectar variables de infraestructura en runtime**: Los contenedores Docker requerían inyectar variables estáticas en tiempo de build o parchear archivos minificados.

---

## 2. Decisión

Se adopta un mecanismo de **configuración dinámica en tiempo de ejecución (Runtime Configuration)** para todas las aplicaciones del monorepo (`NalunPos-Web` y `NalunPos-Admin-Web`):

### 2.1 Archivo `/config.json` Público

Cada aplicación expone un archivo público `/config.json` servido desde la carpeta `public/`:

```json
{
  "apiUrl": "https://api.nalunpos.com",
  "appName": "NalunPos Enterprise",
  "production": true
}
```

### 2.2 Token de Inyección Tipado `APP_CONFIG`

Se define una interfaz estricta `AppConfig` y un `InjectionToken<AppConfig>('APP_CONFIG')` centralizado en `@nalunpos/shared/data-access`:

```typescript
export interface AppConfig {
  readonly apiUrl: string;
  readonly appName: string;
  readonly production: boolean;
}
```

### 2.3 Resolución previa al bootstrap (`main.ts`)

Antes de crear la aplicación, cada `main.ts` resuelve y valida `/config.json` mediante `loadAppConfig()` y provee el valor ya resuelto. Al no existir ninguna fase de carga diferida, es imposible inyectar `APP_CONFIG` sin que la configuración esté cargada:

```typescript
const config = await loadAppConfig('/config.json', environment);

bootstrapApplication(
  AppComponent,
  mergeApplicationConfig(appConfig, {
    providers: [{ provide: APP_CONFIG, useValue: config }],
  }),
);
```

En producción, `loadAppConfig` es _fail-closed_: si `/config.json` retorna un código distinto de HTTP 200, falla la red o el JSON no supera `validateAppConfig`, la promesa se rechaza y `bootstrapApplication` nunca se ejecuta. En desarrollo, y solo en desarrollo, recurre al fallback validado de `environment.ts`.

---

## 3. Consecuencias

### Positivas

- **Inmutabilidad de Artefactos (Build Once, Deploy Anywhere)**: El mismo bundle compilado en `dist/` puede desplegarse en cualquier entorno únicamente montando un volumen o actualizando `/config.json` en el servidor web.
- **Servicios Desacoplados**: Los servicios de datos (`CategoryApiService`, `WarehouseApiService`, `AuthService`, etc.) consumen `APP_CONFIG` mediante `inject(APP_CONFIG)` y jamás importan archivos de entorno estáticos.
- **Resiliencia**: En desarrollo, un fallo al cargar `/config.json` activa el fallback validado de `environment.ts`; en producción la aplicación falla cerrada y no arranca con valores no autorizados.
