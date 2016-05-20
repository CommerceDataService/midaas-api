# midaas-api

## overview
MIDAAS — Making Income Data Accessible as a Service — is an API that makes it possible for developers, data scientists and other citizens to explore income data extracted from the [American Community Survey](https://www.census.gov/programs-surveys/acs/data/pums.html) and query income quantiles, distribution and median by geography, sex, race and age groups.

## technology
This project uses an Express.js application and an AWS Redshift database.  

## API documentation

### API key
To use the MIDAAS API, request a unique API key from [api.data.gov](https://api.data.gov/signup/)

### [GET] /quantiles
**query params**:  state, race, sex, agegroup _(see below for options)_<br>
**response format**:  `{'<quantile>':  <income>}`<br>
**example**:
```
curl https://api.commerce.gov/midaas/quantiles?state=AL&api_key={your_api_key}
{
  5%: 2100,
  10%: 4000,
  20%: 16000,
  30%: 22000,
  40%: 29600,
  50%: 35000,
  60%: 30000,
  70%: 41100,
  80%: 70000,
  90%: 85700,
  95%: 125000,
  99%: 311000
}
```

### [GET] /distribution
**query params**:  state, race, sex, agegroup _(see below for options)_<br>
**response format**:  `{'<income bin>':  <percentage>}`<br>
**example**:
```
curl https://api.commerce.gov/midaas/distribution?state=CA&race=white&agegroup=25-34&sex=male&api_key={your_api_key}
{
  $20.00k-$30.00k: 0.1261146303655346,
  $120.00k-$130.00k: 0.018000879457209275,
  $450.00k-$460.00k: 0.005737466859976182,
  $160.00k-$170.00k: 0.004153510772184425,
  $180.00k-$190.00k: 0.002701356626896694,
  $110.00k-$120.00k: 0.013195357305735017,
  $220.00k-$230.00k: 0.0006076886021645845,
  $130.00k-$140.00k: 0.011160008724588761,
  $370.00k-$380.00k: 0.0001702927752706897,
  $240.00k-$250.00k: 0.0004910497149928792,
  $380.00k-$390.00k: 0.00006298499907272085,
  $300.00k-$310.00k: 0.00014229944234948042,
  $500.00k-$510.00k: 0.0003919066608969297,
  $540.00k-$550.00k: 0.00009564388748079833,
  $30.00k-$40.00k: 0.12264112430556122,
  $10.00k-$20.00k: 0.11912912741282118,
  $0.00-$10.00k: 0.1194382204638262,
  $60.00k-$70.00k: 0.07218664088169667,
  $80.00k-$90.00k: 0.041483786611488695,
  $70.00k-$80.00k: 0.05156255285199575,
  $50.00k-$60.00k: 0.0887400317491051,
  $90.00k-$100.00k: 0.03705034251009218,
  $320.00k-$330.00k: 0.0015373005329230756,
  $100.00k-$110.00k: 0.032045367861554305,
  $150.00k-$160.00k: 0.011347797332935205,
  $40.00k-$50.00k: 0.10100577712408161,
  $170.00k-$180.00k: 0.0026453699610542755,
  $200.00k-$210.00k: 0.0046107352098975094,
  $140.00k-$150.00k: 0.005612663250702457,
  $190.00k-$200.00k: 0.0012457033149938124,
  $210.00k-$220.00k: 0.0007324922114383091,
  $230.00k-$240.00k: 0.0007453224890271966,
  ($10.00k)-$0.00: 0.00029626277341613137,
  $250.00k-$260.00k: 0.002918304957036066
}
```

### query param options

#### state

The two letter postal abbreviation...

```
"AL", "AK", "AR", "AR", "CA", "CO", "CT", "DE",
"DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
"KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN",
"MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM",
"NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
"SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA",
"WV", "WI", "WY"
```

#### race

```
"white",
"african american",
"hispanic",
"asian"
```

#### sex

```
"male",
"female"
```

#### agegroup

```
18-24",
"25-34",
"35-44",
"45-54",
"55-64",
"65+"
```
