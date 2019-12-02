const { exec } = require('child_process')
const { SERVICIOS_SALUD } = require('./constantes')

const comando = servicio => `cd r && Rscript pronosticar.R --args "${servicio}"`

SERVICIOS_SALUD.forEach(servicio => {
  exec(comando(servicio), err => {
    console.log(err)
  })
})