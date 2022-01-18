var tinkoff_v2 = require ('../tinkoff-invest-api_v2-lazy-sdk.js');

if (process.argv[2] == null){
	console.log('example start: node example/unary.js <token>');
	return;
}
var api = new tinkoff_v2({
	'isDebug' : false,
	'token'   : process.argv[2]
});

api.InstrumentsService.Etfs({}, function(err, response) {
	if (err !== null){
		console.log({err});
		return;
	}
	
    console.log(response.instruments);
});
