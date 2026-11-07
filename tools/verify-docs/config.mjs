// =============================================================================
// tools/verify-docs/config.mjs — Configuración desacoplada de verificación
// =============================================================================

export const VERIFY_DOCS_CONFIG = {
  // Documentos markdown obligatorios en la raíz del monorepo
  rootDocs: ['README.md', 'AGENTS.md', 'CONTRIBUTING.md', 'SECURITY.md'],

  // Directorios escaneados recursivamente en busca de archivos .md
  docDirectories: ['docs', '.agents/skills'],

  // Términos obsoletos prohibidos en la documentación
  obsoleteTerms: [
    {
      id: 'auth-interceptor-bare',
      pattern: /\bauthInterceptor\b/,
      message:
        'Uso del interceptor obsoleto "authInterceptor". Debe usarse "authTokenInterceptor" y/o "sessionExpiredInterceptor".',
    },
    {
      id: 'coverage-greater-than-70',
      pattern: />\s*70\s*%/,
      message:
        'Cita de cobertura estimada ">70%". Debe citarse el valor empírico exacto medido por Vitest.',
    },
    {
      id: 'coverage-greater-than-95',
      pattern: />\s*95\s*%/,
      message:
        'Cita de cobertura estimada ">95%". Debe citarse el valor empírico exacto medido por Vitest.',
    },
    {
      id: 'adr-range-0001-0012',
      pattern: /(?:ADR\s+)?0001\s*(?:-|–|a)\s*0012(?!\d)/i,
      message:
        'Rango histórico desactualizado "ADR 0001 - 0012". El repositorio cuenta con 14 ADRs (ADR 0001 - 0014).',
    },
    {
      id: 'public-config-json',
      pattern: /public\/config\.json/i,
      message:
        'Referencia prohibida a "public/config.json". Por ADR 0014, /config.json no va en assets/public.',
    },
    {
      id: 'handle-session-expired',
      pattern: /\bhandleSessionExpired\b/,
      message:
        'Referencia a "handleSessionExpired" obsoleta. La lógica reside en sessionExpiredInterceptor.',
    },
    {
      id: 'adr-0017',
      pattern: /\bADR\s+0017\b/i,
      message:
        'Referencia obsoleta a "ADR 0017". En NalunPos-Front existen únicamente los ADR 0001 a 0014.',
    },
    {
      id: 'commit-a6a2a46',
      pattern: /\ba6a2a46\b/,
      message:
        'Referencia al hash de commit histórico obsoleto "a6a2a46". Debe eliminarse de la documentación.',
    },
  ],

  // Exclusiones globales de directorios para búsqueda de archivos en el repositorio
  repoIgnoreDirs: ['.git', 'node_modules', 'dist', '.nx', '.angular', 'coverage'],
};
