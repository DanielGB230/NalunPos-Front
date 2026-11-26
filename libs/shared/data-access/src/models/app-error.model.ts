// =============================================================================
// AppError & ProblemDetails — NalunPos Data Access
// Modelos unificados de error HTTP para el consumo de backend .NET
// =============================================================================

export interface ProblemDetails {
  readonly type?: string;
  readonly title: string;
  readonly status: number;
  readonly detail?: string;
  readonly instance?: string;
  readonly errors?: Record<string, string[]>;
  /** Código de error de dominio RFC 9457 expuesto por el backend (ADR 0023). */
  readonly code?: string;
}

export interface AppError {
  readonly code: string;
  readonly message: string;
  readonly status: number;
  readonly details?: Record<string, string[]>;
}
