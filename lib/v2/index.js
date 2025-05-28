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

const {
  coloresLineas,
} = require('../utils');

const getParada = async (stopCode, routeShortName = null, date = null) => {
  const result = await gtfsGetStop(stopCode, routeShortName, date);
  return result;
};

const getPanelForParada = async (stopCode) => {
  const paradaInfo = await getParada(stopCode);
  const panel = [];
  const ahora = new Date();
  const ahoraMenos1Minuto = new Date(ahora.getTime() - 60 * 1000);

  paradaInfo.lineas.forEach(linea => {
    // Solo datos realtime
    const proximos = (linea.realtime || [])
      .map(r => ({
        ...r,
        llegadaDate: new Date(r.fechaHoraLlegada)
      }))
      // Filtrar buses con llegada > hace 1 minuto (incluye el minuto en curso)
      .filter(r => r.llegadaDate > ahoraMenos1Minuto)
      // Ordenar por llegada más próxima
      .sort((a, b) => a.llegadaDate - b.llegadaDate);

    if (proximos.length > 0) {
      const siguiente = proximos[0];
      // Calcular minutos hasta llegada, mínimo 0
      let minutosRestantes = Math.round((siguiente.llegadaDate - ahora) / 60000);
      if (minutosRestantes < 0) minutosRestantes = 0;
      const minutos = minutosRestantes > 30 ? "+30'" : `${minutosRestantes}'`;
      const codLinea = linea.linea.toString();
      const colores = coloresLineas[codLinea] || { colorFondo: "#CCCCCC", colorTexto: "#000000" };

      panel.push({
        linea: linea.linea,
        destino: linea.destino,
        minutos,
        colorFondo: colores.colorFondo,
        colorTexto: colores.colorTexto,
      });
    }
  });

  panel.sort((a, b) => {
    const aNum = parseInt(a.minutos);
    const bNum = parseInt(b.minutos);
    return aNum - bNum;
  });

  return { stopCode, panel };
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
  getPanelForParada,
  getAlerts,
  getBusPosition,
  getShapesForTrip,
  getStopsElementsForTrip,
  getTripSequence,
  getSuspendedStops,
  getGbfsParadas,
  checkServicesStatus,
};
