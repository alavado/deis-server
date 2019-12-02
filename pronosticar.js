const { exec } = require('child_process')
const { SERVICIOS_SALUD } = require('./constantes')

SERVICIOS_SALUD.forEach(servicio => {
  exec(`cd r && Rscript pronostico.R --args "${servicio}"`, err => {
    console.log(err)
  })
})