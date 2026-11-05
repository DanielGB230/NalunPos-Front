---
name: inventory-domain-rules
description: Reglas del dominio de inventario, Kardex/Ledger de stock y concurrencia (inventory-001, inventory-002, inventory-003). Usar al trabajar con stock, movimientos de almacén, transferencias o ajustes.
---

<!-- Origen: D:\NalunPosApp\.agents\skills\inventory-domain-rules (copiado el 2026-11-05) -->

> **Nota:** Las especificaciones de dominio que cita este skill (inventory-001, inventory-002, inventory-003) corresponden al repositorio NalunPos-Api, NO a docs/architecture/adr de este repo. En el frontend prevalecen AGENTS.md y los ADR 0001-0014 locales.

# NalunPos Inventory Domain Rules Skill

## 1. Patrón Ledger + Cantidad Materializada (inventory-001)

- Todo cambio de stock se registra de forma **inmutable** como un movimiento en el Kardex/Ledger (`StockMovement`).
- La cantidad actual en el almacén es una **vista materializada** calculada o actualizada a partir del flujo de movimientos, garantizando trazabilidad total de auditoría.
- Prohibido modificar o eliminar registros de `StockMovement` existentes; los errores de carga se corrigen mediante un nuevo movimiento de ajuste (`StockAdjustment`).

## 2. Concurrencia Optimista en Stock (inventory-003)

- El control de concurrencia para evitar overselling (venta sin stock disponible) se implementa mediante **concurrencia optimista** (versionado/RowVersion).
- En caso de conflicto de concurrencia al decrementar stock, se reintenta el caso de uso o se retorna una excepción de dominio clara (`StockConcurrencyException`).

## 3. Modelo de Almacenes y Contenedores (inventory-002)

- La gestión de stock está asociada a sucursales (`BranchId`) y almacenes (`WarehouseId`).
- Las transferencias entre almacenes (`StockTransfer`) requieren almacén de origen y almacén de destino con estado de trazabilidad.
