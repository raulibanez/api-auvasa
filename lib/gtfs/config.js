const { environment } = require('../utils');

const { GTFS_DIR } = environment;

const config = {
  sqlitePath: `${GTFS_DIR}/database.sqlite`,
  agencies: [
    {
      agency_key: 'AUVASA',
      path: `${GTFS_DIR}/static`,
      "realtimeAlerts": {
        "url": "http://212.170.201.204:50080/GTFSRTapi/api/alert",
      },
      "realtimeTripUpdates": {
        "url": "http://212.170.201.204:50080/GTFSRTapi/api/tripupdate",
      },
      "realtimeVehiclePositions": {
        "url": "http://212.170.201.204:50080/GTFSRTapi/api/vehicleposition",
      }
    },
    {
      agency_key: 'ECSA',
      path: `${GTFS_DIR}/static/ecsa`,
    },
    {
      agency_key: 'LaRegional',
      path: `${GTFS_DIR}/static/laregional`,
    },
    {
      agency_key: 'LINECAR',
      path: `${GTFS_DIR}/static/linecar`,
    },
  ],
  staticUrl: 'http://212.170.201.204:50080/GTFSRTapi/api/GTFSFile',
  ignoreDuplicates: true,
  ignoreErrors: true,
  gtfsRealtimeExpirationSeconds: 40,
};

module.exports = config;
