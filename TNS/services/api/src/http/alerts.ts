export const alertSeverityValues = ["critical", "high", "medium", "low"] as const;
export type AlertSeverity = (typeof alertSeverityValues)[number];

export const alertStatusValues = ["open", "acknowledged", "resolved"] as const;
export type AlertStatus = (typeof alertStatusValues)[number];

export type AlertRecord = {
  id: string;
  tenant_id: string;
  trip_id: string;
  vehicle_id: string;
  event: string;
  severity: AlertSeverity;
  status: AlertStatus;
  created_at: string;
  updated_at: string;
  data: Record<string, unknown>;
};

export type AlertFilters = {
  trip_id?: string;
  severity?: AlertSeverity;
  status?: AlertStatus;
};

const parseEnumQuery = <T extends string>(
  rawValue: string | null,
  allowedValues: readonly T[],
  queryName: string,
): T | undefined => {
  if (rawValue === null || rawValue.trim() === "") {
    return undefined;
  }

  const normalized = rawValue.trim();
  if (!allowedValues.includes(normalized as T)) {
    throw new TypeError(
      `Parametro de query invalido: ${queryName} deve ser um de ${allowedValues.join(", ")}.`,
    );
  }

  return normalized as T;
};

export const parseAlertFiltersFromQuery = (searchParams: URLSearchParams): AlertFilters => {
  const tripIdRaw = searchParams.get("trip_id");
  const tripId = tripIdRaw?.trim() ? tripIdRaw.trim() : undefined;

  return {
    trip_id: tripId,
    severity: parseEnumQuery(searchParams.get("severity"), alertSeverityValues, "severity"),
    status: parseEnumQuery(searchParams.get("status"), alertStatusValues, "status"),
  };
};
