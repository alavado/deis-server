const puppeteer = require('puppeteer');
const $ = require('cheerio');
const url = 'http://cognos.deis.cl/ibmcognos/cgi-bin/cognos.cgi?b_action=cognosViewer&ui.action=run&ui.object=%2fcontent%2ffolder%5b%40name%3d%27PUB%27%5d%2ffolder%5b%40name%3d%27REPORTES%27%5d%2ffolder%5b%40name%3d%27Atenciones%20de%20Urgencia%27%5d%2freport%5b%40name%3d%27Atenciones%20Urgencia%20-%20Vista%20por%20semanas%20-%20Servicios%27%5d&ui.name=Atenciones%20Urgencia%20-%20Vista%20por%20semanas%20-%20Servicios&run.outputFormat=&run.prompt=true';

const textoBoton = 'Nueva solicitud'
const servicioSalud = 'Arica'

puppeteer
  .launch()
  .then(function(browser) {
    return browser.newPage();
  })
  .then(function(page) {
    return page.goto(url).then(async function() {
      const option = await page.$x(`//option[text()='${servicioSalud}']`);
      await option[0].click()
      const boton = await page.$x(`//button[contains(text(), '${textoBoton}')]`);
      await boton[0].click()
      try {
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
      }
      catch (error) {
        console.log(error)
      }
      return page.content();
    });
  })
  .then(function(html) {
    let empezoLoBueno = false
    $('td', html).each(function() {
      const texto = $(this).text()
      if (empezoLoBueno) {
        console.log(texto);
        if (isNaN(texto)) {
          empezoLoBueno = false
        }
      }
      else {
        empezoLoBueno = texto === 'TOTAL CAUSAS SISTEMA RESPIRATORIO'
      }
    });
  })
  .catch(function(err) {
    console.log(err)
  })
  .finally(() => {
    console.log('se acabo')
  })