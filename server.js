const puppeteer = require('puppeteer')
const stringify = require('csv-stringify')
const $ = require('cheerio')
const path = require('path');
const fs = require('fs');
const { URL_DEIS, SERVICIOS_SALUD } = require('./constantes')

const stringifier = stringify({
  delimiter: ','
})
const wstream = fs.createWriteStream(path.join('scrapes', 'tmp.csv'));

const leerAtencionesServicio = async servicio => {
  return puppeteer
    .launch()
    .then(browser => browser.newPage())
    .then(page => {
      return page.goto(URL_DEIS).then(async () => {
        try {
          await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
        }
        catch (error) {
          console.log(error)
        }
        const option = await page.$x(`//option[@dv="${servicio}"]`)
        await option[0].click()
        const boton = await page.$x("//button[contains(text(), 'Nueva solicitud')]")
        await boton[0].click()
        try {
          await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
        }
        catch (error) {
          console.log(error)
        }
        return page.content()
      })
    })
    .then(html => {
      return procesarPaginaDEIS(html)
    })
}

const procesarPaginaDEIS = html => {
  let empezoLoBueno = false
  let datos = []
  $('td', html).each(function() {
    const texto = $(this).text()
    if (empezoLoBueno) {
      if (isNaN(texto)) {
        empezoLoBueno = false
      }
      else {
        datos.push(Number(texto.replace('.', '')))
      }
    }
    else {
      empezoLoBueno = texto === 'TOTAL CAUSAS SISTEMA RESPIRATORIO'
    }
  })
  return datos
}

const leerTodosLosServicios = async () => {
  for (let i = 0; i < 2; i++) {
    const datosServicio = await leerAtencionesServicio(SERVICIOS_SALUD[i])
    if (i === 0) {
      stringifier.write(['Servicio', 'Total', ...[...datosServicio.keys()].filter(i => i > 0)])
    }
    stringifier.write([SERVICIOS_SALUD[i], ...datosServicio])
  }
}

leerTodosLosServicios()
  .then(() => {
    stringifier.pipe(wstream)
    stringifier.end()
  })
