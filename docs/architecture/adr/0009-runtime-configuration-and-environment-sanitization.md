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

### 2.3 Inicialización con `provideAppInitializer()`

Durante el arranque de Angular (`main.ts`), la función `provideRuntimeConfig()` carga y valida `/config.json` antes de que se instancie cualquier componente o servicio:

```typescript
provideAppInitializer(() => {
  const http = inject(HttpClient);
  const configService = inject(AppConfigService);
  return firstValueFrom(
    http.get<AppConfig>('/config.json').pipe(
      tap((config) => configService.setConfig(config)),
      catchError(() => {
        configService.setConfig(fallbackConfig);
        return of(fallbackConfig);
      }),
    ),
  );
});
```

---

## 3. Consecuencias

### Positivas

- **Inmutabilidad de Artefactos (Build Once, Deploy Anywhere)**: El mismo bundle compilado en `dist/` puede desplegarse en cualquier entorno únicamente montando un volumen o actualizando `/config.json` en el servidor web.
- **Servicios Desacoplados**: Los servicios de datos (`CategoryApiService`, `WarehouseApiService`, `AuthService`, etc.) consumen `APP_CONFIG` mediante `inject(APP_CONFIG)` y jamás importan archivos de entorno estáticos.
- **Resiliencia**: En caso de fallo transitorio al cargar `/config.json`, se activa una configuración de fallback segura.
