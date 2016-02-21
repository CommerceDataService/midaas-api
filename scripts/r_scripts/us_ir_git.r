##Code for generating % of population by salary ranges
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

#Creating Age Categories
scw$agec<-0
scw$agec[scw$AGEP>=16 & scw$AGEP <25]<-1
scw$agec[scw$AGEP>=25 & scw$AGEP <35]<-2
scw$agec[scw$AGEP>=35 & scw$AGEP <45]<-3
scw$agec[scw$AGEP>=45 & scw$AGEP <55]<-4
scw$agec[scw$AGEP>=55 & scw$AGEP <65]<-5
scw$agec[scw$AGEP>=65]<-6

#Creating unified Race/Ethnicity
scw$race<-0  #Other
scw$race[scw$RAC1P==1 & scw$FHISP==0]<-1 #White
scw$race[scw$RAC1P==2 & scw$FHISP==0]<-2 #Black
scw$race[scw$FHISP==1]<-3 #Hispanic
scw$race[scw$RAC1P==6 & scw$FHISP==0]<-4 #Asian

#Create income ranges
scw$ir<-0
scw$ir[scw$PERNP>=1 & scw$PERNP <10000]<-1
scw$ir[scw$PERNP>=10000 & scw$PERNP <20000]<-2
scw$ir[scw$PERNP>=20000 & scw$PERNP <30000]<-3
scw$ir[scw$PERNP>=30000 & scw$PERNP <40000]<-4
scw$ir[scw$PERNP>=40000 & scw$PERNP <50000]<-5
scw$ir[scw$PERNP>=50000 & scw$PERNP <60000]<-6
scw$ir[scw$PERNP>=60000 & scw$PERNP <70000]<-7
scw$ir[scw$PERNP>=70000 & scw$PERNP <80000]<-8
scw$ir[scw$PERNP>=80000 & scw$PERNP <90000]<-9
scw$ir[scw$PERNP>=90000 & scw$PERNP <100000]<-10
scw$ir[scw$PERNP>=100000 & scw$PERNP <125000]<-11
scw$ir[scw$PERNP>=125000 & scw$PERNP <150000]<-12
scw$ir[scw$PERNP>=150000 & scw$PERNP <175000]<-13
scw$ir[scw$PERNP>=175000 & scw$PERNP <200000]<-14
scw$ir[scw$PERNP>=200000 & scw$PERNP <250000]<-15
scw$ir[scw$PERNP>=250000 & scw$PERNP <300000]<-16
scw$ir[scw$PERNP>=300000]<-17

#an all variable to avoid re-writing the below function
scw$allisl<-1

#create a function to find percent of each subset in a income buckets created above
pbg <- function(name,value,var){
a<-aggregate(scw$PWGTP[var == value],by=list(IR=scw$ir[var == value]),FUN=sum)
a$x<-round((a[,2]*100)/sum(scw$PWGTP[var == value]),digits=4)
colnames(a)[2]<-paste(name)
a
}

#name each of the subsets dataframes
inall<-pbg("inall",1,scw$allisl)
male<-pbg("male",1,scw$SEX)
female<-pbg("female",2,scw$SEX)
white<-pbg("white",1,scw$race)
black<-pbg("black",2,scw$race)
hispanic<-pbg("hispanic",3,scw$race)
asian<-pbg("asian",4,scw$race)
a<-pbg("a",1,scw$agec)
b<-pbg("b",2,scw$agec)
c<-pbg("c",3,scw$agec)
d<-pbg("d",4,scw$agec)
e<-pbg("e",5,scw$agec)
f<-pbg("f",6,scw$agec)


#merge all function commonly seen online using reduce
merge.all <- function(by, ...) {
  frames <- list(...)
  return (Reduce(function(x, y) {merge(x, y, by = by, all = TRUE)}, frames))
}  # end merge.all

#merge all the data sets and right to csv
aib<-merge.all(by = "IR", inall,male,female,white,black,hispanic,asian,a,b,c,d,e,f)

write.csv(aib,"US_IR.csv")


#loop to process the data for every state (seems PR is not included in US dataset)
scwa<-scw
state<-unique(sc$ST)
alls<-NULL
z<-length(state)
for (i in 1:z){
scw<-scwa[scwa$ST==state[i],]


inall<-pbg("inall",1,scw$allisl)
male<-pbg("male",1,scw$SEX)
female<-pbg("female",2,scw$SEX)
white<-pbg("white",1,scw$race)
black<-pbg("black",2,scw$race)
hispanic<-pbg("hispanic",3,scw$race)
asian<-pbg("asian",4,scw$race)
a<-pbg("a",1,scw$agec)
b<-pbg("b",2,scw$agec)
c<-pbg("c",3,scw$agec)
d<-pbg("d",4,scw$agec)
e<-pbg("e",5,scw$agec)
f<-pbg("f",6,scw$agec)

aib<-merge.all(by = "IR", inall,male,female,white,black,hispanic,asian,a,b,c,d,e,f)
aib$state<-state[i]
alls<-rbind(alls,aib)
}

##Creates a CSV of percentiles for every state
write.csv(alls,"State_IR.csv")
scw<-scwa
