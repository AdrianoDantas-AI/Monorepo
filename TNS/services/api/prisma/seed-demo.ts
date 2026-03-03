import { pathToFileURL } from "node:url";

export type TripSeedStatus = "draft" | "planned" | "active" | "completed" | "canceled";

export interface DemoStopSeed {
  id: string;
  order: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface DemoLegSeed {
  id: string;
  fromStopId: string;
  toStopId: string;
  polyline: string;
  distanceM: number;
  durationS: number;
}

export interface DemoRoutePlanSeed {
  id: string;
  totalDistanceM: number;
  totalDurationS: number;
}

export interface DemoRouteTrackSeed {
  id: string;
  progressPct: number;
  distanceDoneM: number;
  distanceRemainingM: number;
  etaS: number | null;
}

export interface DemoTripSeed {
  id: string;
  tenantId: string;
  vehicleId: string;
  driverId: string;
  status: TripSeedStatus;
  stops: DemoStopSeed[];
  legs: DemoLegSeed[];
  routePlan: DemoRoutePlanSeed;
  routeTrack: DemoRouteTrackSeed;
}

export interface DemoTripSeedSummary {
  trips: number;
  stops: number;
  legs: number;
  routePlans: number;
  routeTracks: number;
  tenants: string[];
  tripIds: string[];
}

interface SeedTransactionClient {
  trip: {
    deleteMany(args: { where: { id: string } }): Promise<unknown>;
    create(args: {
      data: {
        id: string;
        tenantId: string;
        vehicleId: string;
        driverId: string;
        status: TripSeedStatus;
      };
    }): Promise<unknown>;
  };
  stop: {
    createMany(args: {
      data: Array<{
        id: string;
        tripId: string;
        order: number;
        name: string;
        address: string;
        lat: number;
        lng: number;
      }>;
    }): Promise<unknown>;
  };
  leg: {
    createMany(args: {
      data: Array<{
        id: string;
        tripId: string;
        fromStopId: string;
        toStopId: string;
        polyline: string;
        distanceM: number;
        durationS: number;
      }>;
    }): Promise<unknown>;
  };
  routePlan: {
    create(args: {
      data: {
        id: string;
        tripId: string;
        totalDistanceM: number;
        totalDurationS: number;
      };
    }): Promise<unknown>;
  };
  routeTrack: {
    create(args: {
      data: {
        id: string;
        tripId: string;
        progressPct: number;
        distanceDoneM: number;
        distanceRemainingM: number;
        etaS: number | null;
      };
    }): Promise<unknown>;
  };
}

export interface SeedPrismaClient {
  $transaction<T>(fn: (tx: SeedTransactionClient) => Promise<T>): Promise<T>;
  $disconnect?(): Promise<void>;
}

export interface RunDemoTripSeedOptions {
  dryRun?: boolean;
}

export interface RunDemoTripSeedResult {
  mode: "dry-run" | "applied";
  summary: DemoTripSeedSummary;
  trips: DemoTripSeed[];
}

const DEMO_TRIP_SEED: readonly DemoTripSeed[] = [
  {
    id: "trip_demo_sp_001",
    tenantId: "tenant_demo_alpha",
    vehicleId: "vehicle_demo_sp_101",
    driverId: "driver_demo_sp_201",
    status: "planned",
    stops: [
      {
        id: "stop_demo_sp_001",
        order: 0,
        name: "CD Paulista",
        address: "Av. Paulista, Sao Paulo - SP",
        lat: -23.55052,
        lng: -46.633308,
      },
      {
        id: "stop_demo_sp_002",
        order: 1,
        name: "Cliente Pinheiros",
        address: "Rua dos Pinheiros, Sao Paulo - SP",
        lat: -23.56168,
        lng: -46.69904,
      },
      {
        id: "stop_demo_sp_003",
        order: 2,
        name: "Cliente Vila Mariana",
        address: "Rua Vergueiro, Sao Paulo - SP",
        lat: -23.5899,
        lng: -46.6345,
      },
    ],
    legs: [
      {
        id: "leg_demo_sp_001",
        fromStopId: "stop_demo_sp_001",
        toStopId: "stop_demo_sp_002",
        polyline: "sp_polyline_001",
        distanceM: 9200,
        durationS: 1500,
      },
      {
        id: "leg_demo_sp_002",
        fromStopId: "stop_demo_sp_002",
        toStopId: "stop_demo_sp_003",
        polyline: "sp_polyline_002",
        distanceM: 7800,
        durationS: 1320,
      },
    ],
    routePlan: {
      id: "route_plan_demo_sp_001",
      totalDistanceM: 17000,
      totalDurationS: 2820,
    },
    routeTrack: {
      id: "route_track_demo_sp_001",
      progressPct: 35.3,
      distanceDoneM: 6000,
      distanceRemainingM: 11000,
      etaS: 1900,
    },
  },
  {
    id: "trip_demo_rj_001",
    tenantId: "tenant_demo_beta",
    vehicleId: "vehicle_demo_rj_102",
    driverId: "driver_demo_rj_202",
    status: "active",
    stops: [
      {
        id: "stop_demo_rj_001",
        order: 0,
        name: "CD Centro RJ",
        address: "Av. Rio Branco, Rio de Janeiro - RJ",
        lat: -22.906847,
        lng: -43.172896,
      },
      {
        id: "stop_demo_rj_002",
        order: 1,
        name: "Cliente Botafogo",
        address: "Rua Voluntarios da Patria, Rio de Janeiro - RJ",
        lat: -22.9519,
        lng: -43.1822,
      },
      {
        id: "stop_demo_rj_003",
        order: 2,
        name: "Cliente Barra",
        address: "Av. das Americas, Rio de Janeiro - RJ",
        lat: -23.0004,
        lng: -43.3659,
      },
      {
        id: "stop_demo_rj_004",
        order: 3,
        name: "Cliente Niteroi",
        address: "Av. Ernani do Amaral Peixoto, Niteroi - RJ",
        lat: -22.8832,
        lng: -43.1034,
      },
    ],
    legs: [
      {
        id: "leg_demo_rj_001",
        fromStopId: "stop_demo_rj_001",
        toStopId: "stop_demo_rj_002",
        polyline: "rj_polyline_001",
        distanceM: 6500,
        durationS: 1080,
      },
      {
        id: "leg_demo_rj_002",
        fromStopId: "stop_demo_rj_002",
        toStopId: "stop_demo_rj_003",
        polyline: "rj_polyline_002",
        distanceM: 15600,
        durationS: 2280,
      },
      {
        id: "leg_demo_rj_003",
        fromStopId: "stop_demo_rj_003",
        toStopId: "stop_demo_rj_004",
        polyline: "rj_polyline_003",
        distanceM: 24100,
        durationS: 3300,
      },
    ],
    routePlan: {
      id: "route_plan_demo_rj_001",
      totalDistanceM: 46200,
      totalDurationS: 6660,
    },
    routeTrack: {
      id: "route_track_demo_rj_001",
      progressPct: 12.5,
      distanceDoneM: 5800,
      distanceRemainingM: 40400,
      etaS: 5400,
    },
  },
];

const cloneDemoTripSeed = (trips: readonly DemoTripSeed[]): DemoTripSeed[] =>
  trips.map((trip) => ({
    ...trip,
    stops: trip.stops.map((stop) => ({ ...stop })),
    legs: trip.legs.map((leg) => ({ ...leg })),
    routePlan: { ...trip.routePlan },
    routeTrack: { ...trip.routeTrack },
  }));

const sumBy = <T>(items: readonly T[], read: (item: T) => number): number =>
  items.reduce((total, item) => total + read(item), 0);

export const isDryRunMode = (
  argv: readonly string[] = process.argv,
  env: NodeJS.ProcessEnv = process.env,
): boolean => argv.includes("--dry-run") || env.SEED_DRY_RUN === "1";

export const getDemoTripSeedData = (): DemoTripSeed[] => cloneDemoTripSeed(DEMO_TRIP_SEED);

export const summarizeDemoTripSeed = (trips: readonly DemoTripSeed[]): DemoTripSeedSummary => ({
  trips: trips.length,
  stops: sumBy(trips, (trip) => trip.stops.length),
  legs: sumBy(trips, (trip) => trip.legs.length),
  routePlans: trips.length,
  routeTracks: trips.length,
  tenants: [...new Set(trips.map((trip) => trip.tenantId))].sort(),
  tripIds: trips.map((trip) => trip.id).sort(),
});

export const validateDemoTripSeedConsistency = (trips: readonly DemoTripSeed[]): void => {
  for (const trip of trips) {
    if (trip.stops.length < 2) {
      throw new Error(`Trip ${trip.id} precisa de ao menos 2 stops.`);
    }

    const expectedOrders = Array.from({ length: trip.stops.length }, (_, index) => index);
    const sortedOrders = trip.stops
      .map((stop) => stop.order)
      .slice()
      .sort((a, b) => a - b);
    if (sortedOrders.join(",") !== expectedOrders.join(",")) {
      throw new Error(`Trip ${trip.id} possui ordem de stops invalida.`);
    }

    const stopIds = new Set(trip.stops.map((stop) => stop.id));
    for (const leg of trip.legs) {
      if (!stopIds.has(leg.fromStopId) || !stopIds.has(leg.toStopId)) {
        throw new Error(
          `Trip ${trip.id} possui leg com referencia de stop inexistente (${leg.id}).`,
        );
      }
    }

    const distanceFromLegs = sumBy(trip.legs, (leg) => leg.distanceM);
    const durationFromLegs = sumBy(trip.legs, (leg) => leg.durationS);
    if (distanceFromLegs !== trip.routePlan.totalDistanceM) {
      throw new Error(`Trip ${trip.id} com totalDistanceM inconsistente no routePlan.`);
    }
    if (durationFromLegs !== trip.routePlan.totalDurationS) {
      throw new Error(`Trip ${trip.id} com totalDurationS inconsistente no routePlan.`);
    }

    const distanceTrack = trip.routeTrack.distanceDoneM + trip.routeTrack.distanceRemainingM;
    if (distanceTrack !== trip.routePlan.totalDistanceM) {
      throw new Error(`Trip ${trip.id} com routeTrack inconsistente em distancia.`);
    }
  }
};

export const applyDemoTripSeed = async (
  prisma: SeedPrismaClient,
  trips: readonly DemoTripSeed[],
): Promise<DemoTripSeedSummary> => {
  validateDemoTripSeedConsistency(trips);

  await prisma.$transaction(async (tx) => {
    for (const trip of trips) {
      await tx.trip.deleteMany({ where: { id: trip.id } });
      await tx.trip.create({
        data: {
          id: trip.id,
          tenantId: trip.tenantId,
          vehicleId: trip.vehicleId,
          driverId: trip.driverId,
          status: trip.status,
        },
      });

      await tx.stop.createMany({
        data: trip.stops.map((stop) => ({
          id: stop.id,
          tripId: trip.id,
          order: stop.order,
          name: stop.name,
          address: stop.address,
          lat: stop.lat,
          lng: stop.lng,
        })),
      });

      await tx.leg.createMany({
        data: trip.legs.map((leg) => ({
          id: leg.id,
          tripId: trip.id,
          fromStopId: leg.fromStopId,
          toStopId: leg.toStopId,
          polyline: leg.polyline,
          distanceM: leg.distanceM,
          durationS: leg.durationS,
        })),
      });

      await tx.routePlan.create({
        data: {
          id: trip.routePlan.id,
          tripId: trip.id,
          totalDistanceM: trip.routePlan.totalDistanceM,
          totalDurationS: trip.routePlan.totalDurationS,
        },
      });

      await tx.routeTrack.create({
        data: {
          id: trip.routeTrack.id,
          tripId: trip.id,
          progressPct: trip.routeTrack.progressPct,
          distanceDoneM: trip.routeTrack.distanceDoneM,
          distanceRemainingM: trip.routeTrack.distanceRemainingM,
          etaS: trip.routeTrack.etaS,
        },
      });
    }
  });

  return summarizeDemoTripSeed(trips);
};

const buildRuntimePrismaClient = async (): Promise<SeedPrismaClient> => {
  const prismaModule = await import("@prisma/client");
  const PrismaClient = prismaModule.PrismaClient as unknown as { new (): SeedPrismaClient };
  return new PrismaClient();
};

export const runDemoTripSeed = async (
  options: RunDemoTripSeedOptions = {},
): Promise<RunDemoTripSeedResult> => {
  const dryRun = options.dryRun ?? isDryRunMode();
  const trips = getDemoTripSeedData();
  const summary = summarizeDemoTripSeed(trips);
  validateDemoTripSeedConsistency(trips);

  if (dryRun) {
    return {
      mode: "dry-run",
      summary,
      trips,
    };
  }

  const prisma = await buildRuntimePrismaClient();
  try {
    const appliedSummary = await applyDemoTripSeed(prisma, trips);
    return {
      mode: "applied",
      summary: appliedSummary,
      trips,
    };
  } finally {
    if (prisma.$disconnect) {
      await prisma.$disconnect();
    }
  }
};

const isMainModule = (() => {
  if (!process.argv[1]) {
    return false;
  }
  return import.meta.url === pathToFileURL(process.argv[1]).href;
})();

if (isMainModule) {
  runDemoTripSeed()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "erro desconhecido";
      console.error(`[seed-demo] falha ao executar seed: ${message}`);
      process.exit(1);
    });
}
