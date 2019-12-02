library(dplyr)

servicio <- 'Arica'

data2019 = read.csv('../scrapes/datos_2019.csv', header = TRUE)
data2018 = read.csv('../scrapes/datos_2019.csv', header = TRUE)
data2017 = read.csv('../scrapes/datos_2019.csv', header = TRUE)

datos <- data2019[data2019$Servicio == servicio,] %>% as.numeric
