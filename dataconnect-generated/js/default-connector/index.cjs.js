const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'MilanPilatesStudio_Updated',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

