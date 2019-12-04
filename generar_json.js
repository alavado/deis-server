const fs = require('fs');
const csv = require('csvtojson')
const { SERVICIOS_SALUD } = require('./constantes')
const { PATH_WEBAPP } = require('./config')

const leerHistorico = async año => {
  return csv().fromFile(`./scrapes/datos_${año}.csv`)
}

const leerPronostico = async servicio => {
  return csv().fromFile(`./r/pronosticos/${servicio}.csv`)
}

const generarJSON = async () => {
  const datos = []
  await Promise.all(
    SERVICIOS_SALUD.map(async servicio => {
      let historico2017 = await leerHistorico(2017)
      let historico2018 = await leerHistorico(2018)
      let historico2019 = await leerHistorico(2019)
      let pronostico = await leerPronostico(servicio)
      datos.push({
        servicio,
        historico: {
          2017: historico2017.find(s => s.Servicio === servicio),
          2018: historico2018.find(s => s.Servicio === servicio),
          2019: historico2019.find(s => s.Servicio === servicio)
        },
        pronostico: pronostico.map(p => Math.round(Number(p['Point Forecast'])))
      })
    })
  )
  fs.writeFile("output.json", JSON.stringify(datos), 'utf8', err => {
    if (err) {
      return console.log(err);
    }
    console.log('Archivo JSON guardado');
  })
}

generarJSON()