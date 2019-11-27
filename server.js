const puppeteer = require('puppeteer')
const $ = require('cheerio')
const { URL_DEIS, SERVICIOS_SALUD } = require('./constantes')

const servicio = SERVICIOS_SALUD[6]

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
      console.log('obteniendo datos para ', servicio)
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
    const datos = procesarPaginaDEIS(html)
    console.log(JSON.stringify(datos))
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