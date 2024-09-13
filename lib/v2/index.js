const {
  gtfsGetStop,
  gtfsGetStops,
  gtfsGetAlerts,
  gtfsGetBusPosition,
  fetchShapesForTrip,
  fetchStopsForTrip,
  suspendedStops,
  gtfsGetTripSequence,
} = require('../gtfs');

const {
  gbfsGetStops
} = require('../gbfs');

const getParada = async (stopCode, routeShortName = null, date = null) => {
  const result = await gtfsGetStop(stopCode, routeShortName, date);
  return result;
};

const getParadas = async () => {
  const result = await gtfsGetStops();
  return result;
};

const getAlerts = async () => {
  const result = await gtfsGetAlerts();
  return result;
};

const getBusPosition = async (tripId) => {
  const result = await gtfsGetBusPosition(tripId);
  return result;
};

const getShapesForTrip = async (tripId) => {
  const result = await fetchShapesForTrip(tripId);
  return result;
};

const getStopsElementsForTrip = async (tripId) => {
  const result = await fetchStopsForTrip(tripId);
  return result;
};

const getSuspendedStops = async () => {
  const result = await suspendedStops();
  return result;
};

const getTripSequence = async (tripId) => {
  const result = await gtfsGetTripSequence(tripId);
  return result;
};

const getGbfsParadas = async () => {
  const result = await gbfsGetStops();
  return result;
};

const config = require('../gtfs/config');
const gbfsConfig = require('../gbfs/config');

const checkServicesStatus = async () => {
  const status = {
    gtfs: {
      static: false,
      realtime: {}
    },
    gbfs: false
  };

  const checkUrl = async (url, timeout = 3000) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error(`Error al verificar la URL ${url}:`, error);
      return false;
    }
  };

  // Realizar todas las verificaciones en paralelo
  const checks = [
    checkUrl(config.staticUrl).then(result => status.gtfs.static = result),
    checkUrl(gbfsConfig.gbfsUrl).then(result => status.gbfs = result),
    ...config.agencies.flatMap(agency => [
      agency.realtimeAlerts && checkUrl(agency.realtimeAlerts.url).then(result => {
        status.gtfs.realtime[agency.agency_key] = status.gtfs.realtime[agency.agency_key] || {};
        status.gtfs.realtime[agency.agency_key].alerts = result;
      }),
      agency.realtimeTripUpdates && checkUrl(agency.realtimeTripUpdates.url).then(result => {
        status.gtfs.realtime[agency.agency_key] = status.gtfs.realtime[agency.agency_key] || {};
        status.gtfs.realtime[agency.agency_key].tripUpdates = result;
      }),
      agency.realtimeVehiclePositions && checkUrl(agency.realtimeVehiclePositions.url).then(result => {
        status.gtfs.realtime[agency.agency_key] = status.gtfs.realtime[agency.agency_key] || {};
        status.gtfs.realtime[agency.agency_key].vehiclePositions = result;
      })
    ]).filter(Boolean)
  ];

  await Promise.all(checks);

  return status;
};

module.exports = {
  getParada,
  getParadas,
  getAlerts,
  getBusPosition,
  getShapesForTrip,
  getStopsElementsForTrip,
  getTripSequence,
  getSuspendedStops,
  getGbfsParadas,
  checkServicesStatus,
};
