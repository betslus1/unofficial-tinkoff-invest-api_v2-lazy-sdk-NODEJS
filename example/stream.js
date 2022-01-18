var tinkoff_v2 = require ('../tinkoff-invest-api_v2-lazy-sdk.js');

var api = new tinkoff_v2({
	'isDebug' : false,
	'token'   : process.argv[2]
});

var call = api.MarketDataStreamService.MarketDataStream();

call.write({  
	"subscribe_candles_request": {    
		"subscription_action": "SUBSCRIPTION_ACTION_SUBSCRIBE",   
		 "instruments": [
			{"figi": "BBG005P7Q881","interval" : "SUBSCRIPTION_INTERVAL_ONE_MINUTE"},
			{"figi": "BBG00WCNDCZ6","interval" : "SUBSCRIPTION_INTERVAL_ONE_MINUTE"},
			{"figi": "BBG000B9XRY4","interval" : "SUBSCRIPTION_INTERVAL_ONE_MINUTE"},
			{"figi": "BBG000BXQ7R1","interval" : "SUBSCRIPTION_INTERVAL_ONE_MINUTE"},
			{"figi": "BBG000BT3HG5","interval" : "SUBSCRIPTION_INTERVAL_ONE_MINUTE"},
        ]                         
    }                     
});

var msgCount = 0;
call.on('data', function(msg) {
  console.log('msgCount: ', msgCount++, ' | msg: ', msg);
});
call.on('error', function(e) {
  console.log('error: ', e);
});
call.on('status', function(status) {
  console.log('status: ', status);
});
call.on('end', function() {
  console.log('socket end');
});
