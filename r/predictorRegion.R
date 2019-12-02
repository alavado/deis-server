#numeroRegion <- input
codigoRegion <- unlist(input)
Sys.setenv(TZ = "UTC")

library(ggplot2)
library(TTR)
library(forecast)
library(tseries)
library(gtrendsR)
library(reshape2)
library(lubridate)
library(jsonlite)
library(readr)
#needs(googlesheets)

###### Fecha y Carga datos ######
hoy <- ymd("2019-03-31") #Sys.Date() - days(1) #ultima semana estadistica cumplida. consultar domingo para sacar yesterday
hace3 <- hoy - weeks(156)
fechas <- paste(hace3,hoy)

nombres <- read.csv("r/keywords2018.csv", encoding = 'UTF-8')
nombres <- as.vector(nombres$x)

deis <- read.csv('r/deis.csv', encoding = 'UTF-8')
colnames(deis) <- c('Semana','Fecha','CL','CL-AP')
################### Consulta Trends 100 terminos ###################

extract_trends <- function(region,fechas,nombres){
  google <- gtrends('gratis', geo = region,  time = fechas)
  df <- google$interest_over_time
  data <- dcast(df, date ~ keyword + geo, value.var = "hits")
  data[,2] <- as.numeric(data[,2])
  final <- data$date
  for (i in 1:length(nombres)) {
    google <- gtrends(nombres[i], geo = region, time = fechas)
    if (is.null(google$interest_over_time)){
      df <- rep(0, nrow(data))
      data <- cbind.data.frame(data,df)
      colnames(data)[i+2] <- paste(nombres[i],region,sep = '-')
    }
    else{
      df <- google$interest_over_time
      df <- dcast(df, date ~ keyword + geo, value.var = "hits")
      data <- cbind.data.frame(data,as.numeric(df[,2]))
      colnames(data)[i+2] <- paste(nombres[i],region,sep = '-')
    }
  }
  data <- data[-2]
  suma_busquedas <- rowSums(data[,c(2:length(nombres)+1)])
  df <- cbind.data.frame(data$date,suma_busquedas)
  colnames(df) <- c('semanas','suma_busquedas')
  df
}


predice <- function(atenciones,busquedas,fecha,n_futuro){
  index <- c((length(atenciones)-156):length(atenciones))
  atenciones<- tsclean(ts(ma(tsclean(ts(atenciones[index])), order = 7), frequency = 7))
  busquedas <- tsclean(ts(ma(tsclean(ts(busquedas)), order = 7), frequency = 7))
  
  #test_ind <- c(145:157)
  futuro <- n_futuro
  # 
  # test.set_aten <- atenciones[test_ind]
  # test.set_busq <- busquedas[test_ind]
  
  #Arima Atenciones (puro)
  arima_at <- auto.arima(atenciones)
  pred_at  <- forecast(arima_at, h=futuro)
  
  #Arima Busqueda (para arimax) con promedio
  arima_busq <- auto.arima(busquedas)
  pred_busq  <- forecast(arima_busq, h=futuro)
  
  #Arimax de atenciones con busqueda como auxiliar
  if(sum(busquedas) != 0){
    arimax <- auto.arima(atenciones,
                         xreg = busquedas, 
                         stepwise = F, approximation = F)
    #Prediccion atenciones con prediccion de busqueda como auxiliar
    pred <- forecast(arimax, xreg = pred_busq$mean)
  } else{
    pred <- pred_at
  }
  
  #Resultado
  for(i in 1:n_futuro){
    fecha <- append(fecha,fecha[157] + weeks(i))
  }
  
  origen <- append(rep('deis',length(atenciones)),rep('pred',length(pred$mean)))
  valor <- append(atenciones,pred$mean)
  upp80 <- append(rep(0,length(atenciones)), pred$upper[,1])
  upp90 <- append(rep(0,length(atenciones)), pred$upper[,2])
  low80 <- append(rep(0,length(atenciones)), pred$lower[,1])
  low90 <- append(rep(0,length(atenciones)), pred$lower[,2])
  
  resultado <- data.frame(fecha,origen,valor,upp80,upp90,low80,low90)
  
}

data <- extract_trends(codigoRegion,fechas, nombres[1:3])


df_predict <- predice(atenciones = unlist(deis[,codigoRegion]),
                      busquedas = data$suma_busquedas,
                      fecha = data$semanas,
                      n_futuro = 12)

write.csv(df_predict[df_predict$origen == 'pred',], 'r/prediccion.csv')

print(df_predict)