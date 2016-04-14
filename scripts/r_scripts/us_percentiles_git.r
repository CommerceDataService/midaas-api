##Code for generating precentile breakdowns for % of population and salary
##Set working directory
setwd("/Users/joshuapatterson/Desktop/csv_pus/")
##load Hmisc package for weighted statistics
##why Hmisc and not Reldist: https://gist.github.com/briatte/7053664
library(Hmisc)
library(data.table)
##reading in SC PUMS CSV File
sc1<-read.csv(file="/Users/joshuapatterson/Desktop/csv_pus/ss14pusa.csv",head=TRUE,sep=",")
sc2<-read.csv(file="/Users/joshuapatterson/Desktop/csv_pus/ss14pusb.csv",head=TRUE,sep=",")
sc <- rbind(sc1, sc2)
##remove all ESR except 1:3 cilvian employed, employed not at work, unemployed
scw<-sc[sc$ESR %in% c(1,2,3),]
##only people above 18
scw<-scw[scw$AGEP>=18]

#Creating Age Categories

scw$agec[scw$AGEP>=18 & scw$AGEP <25]<-1
scw$agec[scw$AGEP>=25 & scw$AGEP <35]<-2
scw$agec[scw$AGEP>=35 & scw$AGEP <45]<-3
scw$agec[scw$AGEP>=45 & scw$AGEP <55]<-4
scw$agec[scw$AGEP>=55 & scw$AGEP <65]<-5
scw$agec[scw$AGEP>=65]<-6

#Creating unified Race/Ethnicity
scw$race<-0  #Other
scw$race[scw$RAC1P==1 & scw$HISP==1]<-1 #White
scw$race[scw$RAC1P==2 & scw$HISP==1]<-2 #Black
scw$race[scw$HISP!=1]<-3 #Hispanic
scw$race[scw$RAC1P==6 & scw$HISP==1]<-4 #Asian

##overall USA distribution for people in workforce
all<-wtd.quantile(scw$PERNP, weights=scw$PWGTP, probs=c(.05, 1:9/10, .95, .99), 
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)
             

##overall USA distribution for people in workforce by race only using race/ethnicity var
white<-wtd.quantile(scw$PERNP[scw$race ==1], weights=scw$PWGTP[scw$race ==1], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)
black<-wtd.quantile(scw$PERNP[scw$race ==2], weights=scw$PWGTP[scw$race ==2], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)
hispanic<-wtd.quantile(scw$PERNP[scw$race ==3], weights=scw$PWGTP[scw$race ==3], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)
asian<-wtd.quantile(scw$PERNP[scw$race ==4], weights=scw$PWGTP[scw$race ==4], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)

##overall USA distribution for people in workforce by agegroup using agec var
a<-wtd.quantile(scw$PERNP[scw$agec ==1], weights=scw$PWGTP[scw$agec ==1], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)
b<-wtd.quantile(scw$PERNP[scw$agec ==2], weights=scw$PWGTP[scw$agec ==2], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)
c<-wtd.quantile(scw$PERNP[scw$agec ==3], weights=scw$PWGTP[scw$agec ==3], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)
d<-wtd.quantile(scw$PERNP[scw$agec ==4], weights=scw$PWGTP[scw$agec ==4], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)
e<-wtd.quantile(scw$PERNP[scw$agec ==5], weights=scw$PWGTP[scw$agec ==5], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)
f<-wtd.quantile(scw$PERNP[scw$agec ==6], weights=scw$PWGTP[scw$agec ==6], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)


##overall USA distribution for people in workforce by gender 
male<-wtd.quantile(scw$PERNP[scw$SEX ==1], weights=scw$PWGTP[scw$SEX ==1], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)
female<-wtd.quantile(scw$PERNP[scw$SEX ==2], weights=scw$PWGTP[scw$SEX ==2], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)

all<-data.frame(all,male,female,white,black,hispanic,asian,a,b,c,d,e,f)
write.csv(all,"USA_all.csv")

##creating a new dataset to reuse above code and getting the unique list of states
scwa<-scw
state<-unique(sc$ST)


#loop to process the data for every state (seems PR is not included)
scwa<-scw
state<-unique(sc$ST)
alls<-NULL
z<-length(state)
for (i in 1:z){
scw<-scwa[scwa$ST==state[i],]

all<-wtd.quantile(scw$PERNP, weights=scw$PWGTP, probs=c(.05, 1:9/10, .95, .99), 
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)


white<-wtd.quantile(scw$PERNP[scw$race ==1], weights=scw$PWGTP[scw$race ==1], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)
black<-wtd.quantile(scw$PERNP[scw$race ==2], weights=scw$PWGTP[scw$race ==2], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)
hispanic<-wtd.quantile(scw$PERNP[scw$race ==3], weights=scw$PWGTP[scw$race ==3], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)
asian<-wtd.quantile(scw$PERNP[scw$race ==4], weights=scw$PWGTP[scw$race ==4], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)


a<-wtd.quantile(scw$PERNP[scw$agec ==1], weights=scw$PWGTP[scw$agec ==1], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)
b<-wtd.quantile(scw$PERNP[scw$agec ==2], weights=scw$PWGTP[scw$agec ==2], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)
c<-wtd.quantile(scw$PERNP[scw$agec ==3], weights=scw$PWGTP[scw$agec ==3], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)
d<-wtd.quantile(scw$PERNP[scw$agec ==4], weights=scw$PWGTP[scw$agec ==4], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)
e<-wtd.quantile(scw$PERNP[scw$agec ==5], weights=scw$PWGTP[scw$agec ==5], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)
f<-wtd.quantile(scw$PERNP[scw$agec ==6], weights=scw$PWGTP[scw$agec ==6], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)



male<-wtd.quantile(scw$PERNP[scw$SEX ==1], weights=scw$PWGTP[scw$SEX ==1], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)
female<-wtd.quantile(scw$PERNP[scw$SEX ==2], weights=scw$PWGTP[scw$SEX ==2], probs=c(.05, 1:9/10, .95, .99),
             type=c('quantile'), 
             normwt=FALSE, na.rm=TRUE)

outs<-data.frame(all,male,female,white,black,hispanic,asian,a,b,c,d,e,f)
outs$state<-state[i]
outs$percentile<-c(.05, 1:9/10, .95, .99)
alls<-rbind(alls,outs)
}

##Creates a CSV of percentiles for every state
write.csv(alls,"US_State_Percentiles.csv")

