require('dotenv').config();

const { GTFS_RT_CACHE_EXPIRE } = process.env;

const NodeCache = require('node-cache');
// Establecer el TTL de la caché a 10 minutos por defecto
const gtfsCache = new NodeCache({ stdTTL: GTFS_RT_CACHE_EXPIRE || 600 }); // 10 minutos si no hay config

const checkCache = (key) => gtfsCache.has(key);
const storeInCache = (key, value) => gtfsCache.set(key, value);
const getCacheKeyTtl = (key) => Math.round(gtfsCache.getTtl(key) / 1000);
const getCacheKey = (key) => {
  return gtfsCache.get(key)
    ? {
        ...gtfsCache.get(key),
        ttl: getCacheKeyTtl(key),
      }
    : {};
};

const getAllCacheKeys = (filter) => {
  const keys = gtfsCache.keys();
  return keys.reduce((acc, key) => {
    // Aplicar el filtro directamente dentro de reduce para evitar iteraciones innecesarias
    if (!filter || key.includes(filter)) {
      acc[key] = getCacheKey(key); // Modificar el acumulador directamente
    }
    return acc; // Devolver el acumulador para la siguiente iteración
  }, {});
};

// Compara dos objetos y devuelve true si son diferentes
// Excluye la propiedad ttl
const compareObjects = (a, b) => {
  // Flag para controlar si hubo cambios
  let differencesFound = false;

  // Creamos copias de a y b sin la propiedad 'ttl'
  const aWithoutTtl = JSON.parse(JSON.stringify(a));
  delete aWithoutTtl.ttl;
  const bWithoutTtl = JSON.parse(JSON.stringify(b));
  delete bWithoutTtl.ttl;

  // Iteramos sobre las propiedades del primer objeto
  Object.keys(aWithoutTtl).forEach((key) => {
    // Comparamos valores de la propiedad actual en a y en b
    if (aWithoutTtl[key]!== bWithoutTtl[key]) {
      //console.log(`Propiedad "${key}" cambió de ${aWithoutTtl[key]} a ${bWithoutTtl[key]}`);
      differencesFound = true;
    }
  });

  return differencesFound;
};

const coloresLineas = {
  "1":   { colorFondo: "#36AD30", colorTexto: "#FFFFFF" },
  "2":   { colorFondo: "#F5C636", colorTexto: "#000000" },
  "3":   { colorFondo: "#EE4BA4", colorTexto: "#000000" },
  "4":   { colorFondo: "#AA541A", colorTexto: "#FFFFFF" },
  "5":   { colorFondo: "#2FB7B7", colorTexto: "#FFFFFF" },
  "6":   { colorFondo: "#F59EC4", colorTexto: "#000000" },
  "7":   { colorFondo: "#7A2B37", colorTexto: "#FFFFFF" },
  "8":   { colorFondo: "#EA5D00", colorTexto: "#FFFFFF" },
  "9":   { colorFondo: "#009EE6", colorTexto: "#FFFFFF" },
  "10":  { colorFondo: "#A01A4A", colorTexto: "#FFFFFF" },
  "13":  { colorFondo: "#0051A1", colorTexto: "#FFFFFF" },
  "14":  { colorFondo: "#887CB9", colorTexto: "#000000" },
  "16":  { colorFondo: "#82D0F7", colorTexto: "#000000" },
  "17":  { colorFondo: "#C2D400", colorTexto: "#FFFFFF" },
  "18":  { colorFondo: "#BEBCBD", colorTexto: "#000000" },
  "19":  { colorFondo: "#E59351", colorTexto: "#000000" },
  "C1":  { colorFondo: "#555553", colorTexto: "#FFFFFF" },
  "C2":  { colorFondo: "#6C6C69", colorTexto: "#FFFFFF" },
  "24":  { colorFondo: "#0F4895", colorTexto: "#FFFFFF" },
  "H":   { colorFondo: "#E42333", colorTexto: "#000000" },
};

module.exports = {
  compareObjects,
  checkCache,
  environment: process.env,
  getAllCacheKeys,
  getCacheKey,
  storeInCache,
  coloresLineas,
};
