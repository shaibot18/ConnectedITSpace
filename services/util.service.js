const crc = require('crc');

module.exports = { crcEncrypt, padLeft };

function padLeft(...args) {
  const string = args[0];
  if (args[1]) {
    const nOfBytes = args[1];
    return ('0000'.concat(string)).slice((-2) * nOfBytes);
  }
  return ('00'.concat(string)).slice(-2);
}

function crcEncrypt(resultString) {
  const buffer = new ArrayBuffer(resultString.length / 2);
  const v8 = new Int8Array(buffer);
  const resultArray = resultString.match(/[\w]{2}/g);
  for (let i = 0; i < resultArray.length; i++) {
    v8[i] = parseInt(resultArray[i], 16);
  }
  return padLeft(crc.crc16modbus(v8).toString(16).toUpperCase(), 2);
}