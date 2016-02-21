##any income range with 5th,10th,20th,...,90th,95th,&99th Percentile
range<-c(800,4000,10000,17000,24000,30000,40000,50000,64500,91500,125000,327000)
##creating 100th Percentil which is equal to 99th
rangel<-c(range,range[length(range)])
##creating Percentile values
perc<-c(.05,.1,.2,.3,.4,.5,.6,.7,.8,.9,.95,.99,1)
##finding the length of the string
z=length(perc)
##loop to find the difference in percentile values between the prior precentile value
x=0
diff=NULL
for (i in 1:z){
dif=perc[i]-x
x=perc[i]
diff<-c(diff,dif)
}
##loop to find the average income weighted by percentiles
##This allows our Gini Simulator to not increase total wages in an area
x=0
mean=NULL
for (i in 1:z){
trap=((rangel[i]+x)/2)*diff[i]
x=rangel[i]
mean<-c(mean,trap)
}
##mean salary
equal<-sum(mean)

##changing r changes the simulator (slider value must be between [0,1])
r<-.2

##creates new income range based on slider, 1 makes it completely equal, 0 is what it currently is
newrange<-(rangel*(1-r)+r*(equal))


##loop to create area under each curve for each percentile bucket
##x=r*equal sets the 0th percentile, assumed 0 at the start, changes y coefficient for simulator
x=r*equal
meann=NULL
for (i in 1:z){
trap=((newrange[i]+x)/2)*diff[i]
x= newrange[i]
meann<-c(meann,trap)
}
##creates a list of the percent of the total income owned by each percentile bucket
bucs<-meann/sum(meann)

##loop to create cumulative distribution for each percentile
x=0
cumdis=NULL
for (i in 1:z){
cumdis=c(cumdis,sum(head(bucs,i)))
}

##loop to calculate area under the curve
x=0
auc=NULL
for (i in 1:z){
trap=((cumdis[i]+x)/2)*diff[i]
x=cumdis[i]
auc<-c(auc,trap)
}
#total area under the curve
tauc<-sum(auc)
#calculate the gini coefficient
gini<-(.5-tauc)/.5
gini
