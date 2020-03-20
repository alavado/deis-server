Viva Puppeteer

Hay que ejecutar los scripts en este orden:

1. scraper.js
2. pronosticar.js
3. generar_json.js

O bien:

```
node scraper.js && node pronosticar.js && node generar_json.js
```

Si es un nuevo año, hay que ir al archivo scraper.js y cambiar la línea

```javascript
const añoActual = new Date().getFullYear()
```

por el año anterior, y ejecutar `scraper.js`.

Luego hay que reemplazar el archivo output.json en el frontend.