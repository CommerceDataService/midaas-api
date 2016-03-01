# midaas-api

## overview

This project uses [serverless](http://www.serverless.com) (a framework based upon [AWS Lambda](https://aws.amazon.com/lambda/) and [API Gateway](https://aws.amazon.com/api-gateway/)). Please consult [the serverless docs](http://docs.serverless.com) for more information on running locally and deploying.

## api documentation

### [GET] /income/quantile
**query params**:  state, race, sex, agegroup _(see below for options)_<br>
**response format**:  `{'<quantile>':  <income>}`<br>
**example**:
```
curl https://brbimhg0w9.execute-api.us-west-2.amazonaws.com/dev/income/quantiles?state=AL
{
  "1": 0,
  "5": 480,
  "10": 3000,
  "20": 10000,
  "30": 15000,
  "40": 20200,
  "50": 27000,
  "60": 35000,
  "70": 43500,
  "80": 55000,
  "90": 79000,
  "95": 102000,
  "99": 311000,
  "100": 551000
}
```

### [GET] /income/distribution
**query params**:  state, race, sex, agegroup _(see below for options)_<br>
**response format**:  `{'<income bin>':  <percentage>}`<br>
**example**:
```
curl https://brbimhg0w9.execute-api.us-west-2.amazonaws.com/dev/income/distribution?state=CA&race=white&agegroup=26-35&sex=male
{
  "($10.00k)-$0.00": 0.0002444390124663896,
  "$0.00-$10.00k": 0.11814552269208832,
  "$10.00k-$20.00k": 0.14870039925038703,
  "$20.00k-$30.00k": 0.14992259431271898,
  "$30.00k-$40.00k": 0.12645644911594559,
  "$40.00k-$50.00k": 0.09907927971970994,
  "$50.00k-$60.00k": 0.08058339444308645,
  "$60.00k-$70.00k": 0.0621689888372851,
  "$70.00k-$80.00k": 0.04587305467285912,
  "$80.00k-$90.00k": 0.035932534832559274,
  "$90.00k-$100.00k": 0.031695591949808526,
  "$100.00k-$110.00k": 0.02729568972541351,
  "$110.00k-$120.00k": 0.009370162144544936,
  "$120.00k-$130.00k": 0.015807056139493198,
  "$130.00k-$140.00k": 0.008881284119612157,
  "$140.00k-$150.00k": 0.005622097286726962,
  "$150.00k-$160.00k": 0.008636845107145767,
  "$160.00k-$170.00k": 0.0034221461745294547,
  "$170.00k-$180.00k": 0.002199951112197507,
  "$180.00k-$190.00k": 0.0022814307830196366,
  "$190.00k-$200.00k": 0.0013036747331540781,
  "$200.00k-$210.00k": 0.0034221461745294547,
  "$210.00k-$220.00k": 0.0009777560498655585,
  "$220.00k-$230.00k": 0.0007333170373991689,
  "$230.00k-$240.00k": 0.0006518373665770391,
  "$240.00k-$250.00k": 0.0007333170373991689,
  "$250.00k-$260.00k": 0.0023629104538417664,
  "$260.00k-$270.00k": 0.00008147967082212988,
  "$300.00k-$310.00k": 0.00016295934164425977,
  "$330.00k-$340.00k": 0.0012221950623319481,
  "$380.00k-$390.00k": 0.00008147967082212988,
  "$390.00k-$400.00k": 0.00008147967082212988,
  "$420.00k-$430.00k": 0.00008147967082212988,
  "$450.00k-$460.00k": 0.005622097286726962,
  "$500.00k-$510.00k": 0.00008147967082212988,
  "$540.00k-$550.00k": 0.00008147967082212988
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
"0-15",
"16-25",
"26-35",
"36-45",
"46-55",
"55-65",
"65+"
```
