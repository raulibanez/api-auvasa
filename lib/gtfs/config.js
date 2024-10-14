const { environment } = require('../utils');

const { GTFS_DIR } = environment;

const config = {
  sqlitePath: `${GTFS_DIR}/database.sqlite`,
  agencies: [
    {
      agency_key: 'AUVASA',
      path: `${GTFS_DIR}/static`,
      realtimeUrls: [
        'https://proxy.vallabus.com/GTFSRTapi/api/tripupdate',
        'https://proxy.vallabus.com/GTFSRTapi/api/vehicleposition',
        'https://proxy.vallabus.com/GTFSRTapi/api/alert',
      ],
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
  staticUrl: 'https://proxy.vallabus.com/GTFSRTapi/api/GTFSFile',
  ignoreDuplicates: true,
};

module.exports = config;
