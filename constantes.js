const URL_DEIS = 'http://cognos.deis.cl/ibmcognos/cgi-bin/cognos.cgi?b_action=cognosViewer&ui.action=run&ui.object=%2fcontent%2ffolder%5b%40name%3d%27PUB%27%5d%2ffolder%5b%40name%3d%27REPORTES%27%5d%2ffolder%5b%40name%3d%27Atenciones%20de%20Urgencia%27%5d%2freport%5b%40name%3d%27Atenciones%20Urgencia%20-%20Vista%20por%20semanas%20-%20Servicios%27%5d&ui.name=Atenciones%20Urgencia%20-%20Vista%20por%20semanas%20-%20Servicios&run.outputFormat=&run.prompt=true'
const SERVICIOS_SALUD = [
  'Chile',
  'Arica',
  'Iquique',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso San Antonio',
  'Viña Del Mar Quillota',
  'Aconcagua',
  'Metropolitano Norte',
  'Metropolitano Occidente',
  'Metropolitano Central',
  'Metropolitano Oriente',
  'Metropolitano Sur',
  'Metropolitano Suroriente',
  'Libertador B. O\'Higgins',
  'Del Maule',
  'Ñuble',
  'Concepción',
  'Talcahuano',
  'Bíobío',
  'Araucanía Sur',
  'Valdivia',
  'Osorno',
  'Del Reloncaví',
  'Aisén',
  'Magallanes',
  'Arauco',
  'Araucanía Norte',
  'Chiloé',
]

module.exports = {
  URL_DEIS,
  SERVICIOS_SALUD
}