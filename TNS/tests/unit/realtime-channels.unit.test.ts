import assert from "node:assert/strict";
import test from "node:test";
import {
  parseChannelsFromQuery,
  realtimeChannels,
} from "../../services/realtime/src/realtime-server.js";

test("parseChannelsFromQuery valida e normaliza lista de canais", () => {
  const channels = parseChannelsFromQuery("trip.progress.v1,alert.event.v1,trip.progress.v1");

  assert.deepEqual(channels, ["trip.progress.v1", "alert.event.v1"]);
  assert.deepEqual(parseChannelsFromQuery(null), []);
  assert.deepEqual(parseChannelsFromQuery(""), []);
  assert.deepEqual(realtimeChannels, ["trip.progress.v1", "alert.event.v1"]);
});

test("parseChannelsFromQuery rejeita canal invalido", () => {
  assert.throws(
    () => parseChannelsFromQuery("trip.progress.v1,unknown.channel"),
    /Canal websocket invalido/i,
  );
});
