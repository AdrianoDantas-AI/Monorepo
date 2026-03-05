import type { AlertFilters, AlertRecord } from "./alerts.js";

const cloneAlert = (alert: AlertRecord): AlertRecord => structuredClone(alert);

export interface AlertRepository {
  create(alert: AlertRecord): Promise<AlertRecord>;
  listByTenant(tenantId: string, filters?: AlertFilters): Promise<AlertRecord[]>;
}

const compareByNewestFirst = (left: AlertRecord, right: AlertRecord): number =>
  Date.parse(right.created_at) - Date.parse(left.created_at);

export class InMemoryAlertRepository implements AlertRepository {
  private readonly alerts: AlertRecord[];

  constructor(initialAlerts: AlertRecord[] = []) {
    this.alerts = initialAlerts.map((alert) => cloneAlert(alert));
  }

  async create(alert: AlertRecord): Promise<AlertRecord> {
    this.assertAlertIsValid(alert);
    const persisted = cloneAlert(alert);
    this.alerts.push(persisted);
    return cloneAlert(persisted);
  }

  async listByTenant(tenantId: string, filters: AlertFilters = {}): Promise<AlertRecord[]> {
    const filtered = this.alerts
      .filter((alert) => alert.tenant_id === tenantId)
      .filter((alert) => {
        if (filters.trip_id && alert.trip_id !== filters.trip_id) {
          return false;
        }

        if (filters.severity && alert.severity !== filters.severity) {
          return false;
        }

        if (filters.status && alert.status !== filters.status) {
          return false;
        }

        return true;
      })
      .sort(compareByNewestFirst);

    return filtered.map((alert) => cloneAlert(alert));
  }

  private assertAlertIsValid(alert: AlertRecord): void {
    if (
      !alert.id.trim() ||
      !alert.tenant_id.trim() ||
      !alert.trip_id.trim() ||
      !alert.vehicle_id.trim()
    ) {
      throw new TypeError("Alerta invalido: id, tenant_id, trip_id e vehicle_id sao obrigatorios.");
    }

    if (!alert.event.trim()) {
      throw new TypeError("Alerta invalido: event obrigatorio.");
    }

    if (!alert.created_at.trim() || Number.isNaN(Date.parse(alert.created_at))) {
      throw new TypeError("Alerta invalido: created_at deve ser datetime ISO valido.");
    }

    if (!alert.updated_at.trim() || Number.isNaN(Date.parse(alert.updated_at))) {
      throw new TypeError("Alerta invalido: updated_at deve ser datetime ISO valido.");
    }
  }
}
