const puppeteer = require('puppeteer')
const $ = require('cheerio')
const url = 'http://cognos.deis.cl/ibmcognos/cgi-bin/cognos.cgi?b_action=cognosViewer&ui.action=run&ui.object=%2fcontent%2ffolder%5b%40name%3d%27PUB%27%5d%2ffolder%5b%40name%3d%27REPORTES%27%5d%2ffolder%5b%40name%3d%27Atenciones%20de%20Urgencia%27%5d%2freport%5b%40name%3d%27Atenciones%20Urgencia%20-%20Vista%20por%20semanas%20-%20Servicios%27%5d&ui.name=Atenciones%20Urgencia%20-%20Vista%20por%20semanas%20-%20Servicios&run.outputFormat=&run.prompt=true'

const textoBoton = 'Nueva solicitud'
const servicioSalud = 'Arica'

puppeteer
  .launch()
  .then(browser => {
    return browser.newPage()
  })
  .then(page => {
    return page.goto(url).then(async () => {
      const option = await page.$x(`//option[text()='${servicioSalud}']`)
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