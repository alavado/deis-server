library(dplyr)
library(ggplot2)
library(reshape)
library(forecast)
library(glue)

servicio <- 'Arica'
semanasHorizonte <- 12

leerAño <- function(año) {
  datosCSV = read.csv('../scrapes/datos_{año}.csv' %>% glue(), header = TRUE)
  return (datosCSV[datosCSV$Servicio == servicio,] %>% as.numeric() %>% tail(n=-2))
}

datos <- sapply(2017:2019, leerAño) %>% unlist() %>% melt()
colnames(datos) <- 'atenciones'
atenciones <- ts(datos, frequency=52, start=2017)

autoplot(atenciones[,'atenciones']) +
  ggtitle('Atenciones de urgencia por enfermedades respiratorias') +
  ylab('Atenciones') +
  xlab('Semanas')

ggseasonplot(atenciones, year.labels=TRUE, year.labels.left=TRUE) +
  ylab('Atenciones') +
  ggtitle('Gráfico estacional: atenciones de urgencia en {servicio}' %>% glue())

gglagplot(atenciones, set.lags=c(13,26,39,52)) +
  ylab('Atenciones') +
  ggtitle('Lag plot: atenciones de urgencia en {servicio}' %>% glue())

arimaFit <- atenciones %>% auto.arima(seasonal=TRUE, approximation=FALSE, stepwise=FALSE, test='kpss')
pronostico <- arimaFit %>% forecast(h=semanasHorizonte)
autoplot(pronostico)

pronosticoDF <- as.data.frame(pronostico)
write.table(pronosticoDF, file="pronostico.csv", quote=F, sep=",", dec=".", na="", row.names=T, col.names=T)
#atencionesStat <- atenciones %>% diff(lag=52) %>% diff()
#ggtsdisplay(atencionesStat)
