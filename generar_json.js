const fs = require('fs');
const { SERVICIOS_SALUD } = require('./constantes')
const { PATH_WEBAPP } = require('./config')

const datos = []

SERVICIOS_SALUD.forEach(servicio => {
  let historico = []
  let pronostico = []
  datos.push({
    servicio,
    historico,
    pronostico
  })
})

fs.writeFile("output.json", JSON.stringify(datos), 'utf8', err => {
  if (err) {
    return console.log(err);
  }
  console.log('Archivo JSON guardado');
})