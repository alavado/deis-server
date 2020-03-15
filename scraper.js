const puppeteer = require('puppeteer')
const stringify = require('csv-stringify')
const $ = require('cheerio')
const path = require('path');
const fs = require('fs');
const { URL_DEIS, SERVICIOS_SALUD } = require('./constantes')

const navOptions = {
  waitUntil: 'domcontentloaded',
  timeout: 20000
}
const XPATHServicio = servicio => `//option[@dv="${servicio}"]`
const XPATHAño = año => `//option[@dv="${año}"]`
const XPATHEnviarSolicitud = `//button[contains(text(), 'Nueva solicitud')]`

const leerAtencionesServicio = async (servicio, año) => {
  console.log('scraping', servicio)
  const browser = await puppeteer.launch({})
  const pagina = await browser.newPage()
  await pagina.goto(URL_DEIS)
  try {
    await pagina.waitForNavigation(navOptions)
  }
  catch (error) { }
  const optionAño = await pagina.$x(XPATHAño(año))
  await optionAño[0].click()
  if (servicio !== 'Chile') {
    const optionServicio = await pagina.$x(XPATHServicio(servicio))
    await optionServicio[0].click()
  }
  const boton = await pagina.$x(XPATHEnviarSolicitud)
  await boton[0].click()
  try {
    await pagina.waitForNavigation(navOptions)
  }
  catch (error) { }
  const html = await pagina.content()
  browser.close()
  return procesarPaginaServicio(html)
}

const procesarPaginaServicio = html => {
  let empezoLoBueno = false
  let datos = []
  $('td', html).each(function() {
    const texto = $(this).text().replace(/\./g, '')
    if (empezoLoBueno) {
      if (isNaN(texto)) {
        empezoLoBueno = false
      }
      else {
        datos.push(Number(texto))
      }
    }
    else {
      empezoLoBueno = texto === 'TOTAL CAUSAS SISTEMA RESPIRATORIO'
    }
  })
  return datos
}

const stringifier = stringify({
  delimiter: ','
})

const leerTodosLosServicios = async año => {
  for (let i = 0; i < SERVICIOS_SALUD.length; i++) {
    const datosServicio = await leerAtencionesServicio(SERVICIOS_SALUD[i], año)
    if (i === 0) {
      stringifier.write(['Servicio', 'Total', ...[...datosServicio.keys()].filter(i => i > 0)])
    }
    stringifier.write([SERVICIOS_SALUD[i], ...datosServicio])
  }
}

const añoActual = 2020//new Date().getFullYear()
leerTodosLosServicios(añoActual)
  .then(() => {
    const wstream = fs.createWriteStream(path.join('scrapes', `datos_${añoActual}.csv`))
    stringifier.pipe(wstream)
    stringifier.end()
  })
