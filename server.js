const puppeteer = require('puppeteer')
const $ = require('cheerio')
const { URL_DEIS, SERVICIOS_SALUD } = require('./constantes')

const textoBoton = 'Nueva solicitud'
const servicioSalud = 'Arica'

puppeteer
  .launch()
  .then(browser => {
    return browser.newPage()
  })
  .then(page => {
    return page.goto(URL_DEIS).then(async () => {
      try {
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
      }
      catch (error) {
        console.log(error)
      }
      const option = await page.$x(`//option[text()='${SERVICIOS_SALUD[0]}']`)
      await option[0].click()
      const boton = await page.$x(`//button[contains(text(), '${textoBoton}')]`)
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
    const datos = procesarPaginaDEIS(html)
    console.log(JSON.stringify(datos))
  })
  .catch(err => {
    console.log(err)
  })
  .finally(() => {
    console.log('se acabo')
  })

const procesarPaginaDEIS = html => {
  let empezoLoBueno = false
  let i = 1
  let datos = {
    semanas: []
  }
  $('td', html).each(function() {
    const texto = $(this).text()
    if (empezoLoBueno) {
      if (isNaN(texto)) {
        empezoLoBueno = false
      }
      else if (!datos.total) {
        datos.total = Number(texto.replace('.', ''))
      }
      else {
        datos.semanas.push({
          semana: i++,
          atenciones: Number(texto.replace('.', ''))
        })
      }
    }
    else {
      empezoLoBueno = texto === 'TOTAL CAUSAS SISTEMA RESPIRATORIO'
    }
  })
  return datos
}