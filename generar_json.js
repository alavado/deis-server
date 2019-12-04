const fs = require('fs');
const csv = require('csvtojson')
const { SERVICIOS_SALUD } = require('./constantes')
const { PATH_WEBAPP } = require('./config')

const leerPronostico = servicio => {
  csv()
    .fromFile(`./r/pronosticos/${servicio}.csv`)
    .then(json => {
    })
    .catch(err => console.log(servicio))
}

const datos = []

SERVICIOS_SALUD.forEach(servicio => {
  let historico = []
  let pronostico = leerPronostico(servicio)
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