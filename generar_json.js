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

const formatearJSON = datos => {
  const llaves = Object.keys(datos)
  return llaves
    .filter(k => !isNaN(k))
    .sort((x, y) => Number(x) > Number(y) ? 1 : -1)
    .map(k => Number(datos[k]))
}

const generarJSON = async () => {
  const datos = []
  await Promise.all(
    SERVICIOS_SALUD.map(async servicio => {
      let historico2018 = await leerHistorico(2018)
      let historico2019 = await leerHistorico(2019)
      let historico2020 = await leerHistorico(2020)
      let pronostico = await leerPronostico(servicio)
      datos.push({
        servicio,
        historico: {
          2018: formatearJSON(historico2018.find(s => s.Servicio === servicio)),
          2019: formatearJSON(historico2019.find(s => s.Servicio === servicio)),
          2020: formatearJSON(historico2020.find(s => s.Servicio === servicio))
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