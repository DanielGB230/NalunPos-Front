---
name: saas-multitenancy-and-security
description: Arquitectura de Multi-tenancy SaaS, aislamiento de datos, onboarding y seguridad (ADR 0008, ADR 0009, ADR 0012, ADR 0015). Usar al trabajar con tenants, autenticación, claims o roles.
---

<!-- Origen: D:\NalunPosApp\.agents\skills\saas-multitenancy-and-security (copiado el 2026-11-05) -->

# NalunPos SaaS Multi-Tenancy & Security Skill

## 1. Estrategia de Aislamiento de Tenant (ADR 0008, ADR 0009)

- Base de Datos Compartida con Filtros Globales de Consulta (**Shared DB + Global Query Filters**).
- Entidades de negocio implementan la interfaz marker `ITenantOwnedEntity`.
- `TenantDbContext` / EF Core aplica automáticamente el filtro por `TenantId` en cada consulta.

## 2. Onboarding & Separación Control Plane / Application Plane (ADR 0012)

- Modelo de alta asistida vía **SuperAdmin** (`Pos.Admin.Web` / `Controllers/Platform`).
- `Application/Platform` equivale al **Control Plane** (administración de tenants, suscripciones y planes).
- Los módulos de negocio operativos representan el **Application Plane** (`Pos.App.Web` / `Controllers/Tenant`).

## 3. Autenticación, JWT y Revocación (ADR 0015)

- Claim `tid` obligatorio para roles operativos (`TenantAdmin`, `Supervisor`, `InventoryManager`, `Cajero`).
- `TenantId` **ausente/null** para `SuperAdmin`.
- Revocación asíncrona de permisos y sesiones respaldada por invalidación de tokens/caché de seguridad.
