export type AccuracyQuality = "reliable" | "degraded";

export type AccuracyFilterResult = {
  quality: AccuracyQuality;
  should_ignore_transition: boolean;
};

export const isAccuracyDegraded = (
  accuracyM: number,
  degradedAccuracyThresholdM: number,
): boolean => {
  if (!Number.isFinite(accuracyM) || accuracyM < 0) {
    throw new TypeError("accuracy_m invalido: esperado numero >= 0.");
  }

  if (!Number.isFinite(degradedAccuracyThresholdM) || degradedAccuracyThresholdM < 0) {
    throw new TypeError("degraded_accuracy_m invalido: esperado numero >= 0.");
  }

  return accuracyM > degradedAccuracyThresholdM;
};

export const classifyAccuracyForDetection = (
  accuracyM: number,
  degradedAccuracyThresholdM: number,
): AccuracyFilterResult => {
  const degraded = isAccuracyDegraded(accuracyM, degradedAccuracyThresholdM);
  return {
    quality: degraded ? "degraded" : "reliable",
    should_ignore_transition: degraded,
  };
};
