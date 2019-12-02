.libPaths(c(.libPaths(), 'C:/Users/aleja/OneDrive/Documentos/R/win-library/3.6'))

library(dplyr)
library(ggplot2)
library(reshape)
library(forecast)
library(glue)

args <- commandArgs(trailingOnly=TRUE)
servicio <- if(length(args) == 0) 'Arica' else args[2]
semanasHorizonte <- 12

leerCSV <- function(periodo) {
  datosCSV = '../scrapes/datos_{periodo}.csv'  %>% glue() %>% read.csv(encoding='UTF-8', header=TRUE)
  return (datosCSV[datosCSV$Servicio == servicio,] %>% as.numeric() %>% tail(n=-2))
}

datos <- sapply(2017:2019, leerCSV) %>% unlist() %>% melt()
colnames(datos) <- 'atenciones'
atenciones <- ts(datos, frequency=52, start=2017)

autoplot(atenciones[,'atenciones']) +
  ggtitle('Atenciones de urgencia por enfermedades respiratorias') +
  ylab('Atenciones') +
  xlab('Semanas')

ggseasonplot(atenciones, year.labels=TRUE, year.labels.left=TRUE) +
  ggtitle('Gráfico estacional: atenciones de urgencia en {servicio}' %>% glue()) +
  ylab('Atenciones')

gglagplot(atenciones, set.lags=c(13,26,39,52)) +
  ggtitle('Lag plot: atenciones de urgencia en {servicio}' %>% glue()) +
  ylab('Atenciones')

arimaFit <- atenciones %>% auto.arima(seasonal=TRUE, stepwise=FALSE, test='kpss')
pronostico <- arimaFit %>% forecast(h=semanasHorizonte)
autoplot(pronostico)

archivo <- 'pronosticos/{servicio}.csv' %>% glue()
pronosticoDF <- pronostico %>% as.data.frame()
pronosticoDF %>% write.table(file=archivo, sep=",", dec=".", row.names=FALSE, col.names=TRUE)

