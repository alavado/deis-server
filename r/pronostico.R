library(dplyr)
library(ggplot2)
library(reshape)
library(forecast)
library(glue)

servicio <- 'Metropolitano Norte'
horizonte <- 12

data2017 = read.csv('../scrapes/datos_2017.csv', header = TRUE)
data2018 = read.csv('../scrapes/datos_2018.csv', header = TRUE)
data2019 = read.csv('../scrapes/datos_2019.csv', header = TRUE)

datos2019 <- data2019[data2019$Servicio == servicio,] %>%
  as.numeric() %>%
  tail(n = -2)

datos2018 <- data2018[data2018$Servicio == servicio,] %>%
  as.numeric() %>%
  tail(n = -2)

datos2017 <- data2017[data2017$Servicio == servicio,] %>%
  as.numeric() %>%
  tail(n = -2)

datos <- c(datos2017, datos2018, datos2019) %>%
  melt()

atenciones <- ts(datos, frequency = 52, start = 2017)
colnames(atenciones) <- c('atenciones')

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

arima_at <- auto.arima(atenciones)
autoplot(arima_at)
pred_at <- forecast(arima_at, h=horizonte)
autoplot(pred_at)
