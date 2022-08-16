var tinkoff_v2 = require ('../tinkoff_v2.js');
const streamCount = 4; //change this

var api = new tinkoff_v2({
	'isDebug' : false,
	'token': process.argv[2]
});

var calls = [];


for (let i=0; i<streamCount; i++){
	console.log('try to first connect socket '+i);
	calls[i] = api.MarketDataStreamService.MarketDataStream();

	calls[i].on('data', function(msg) {
	  //console.log('msgCount: ', ' | msg: ', msg);
	});
	calls[i].on('error', function(e) {
	  console.log('error: ', e);
	});
	calls[i].on('status', function(status) {
	 // console.log('status: ', status);
	});
	calls[i].on('end', function() {
	 // console.log('socket end');
	}); 

	setTimeout(function(){
		console.log('close first');
		calls[i].cancel();
	}, 1000);
}



setTimeout(function(){
	for (let i=0; i<streamCount; i++){
		console.log('try to second connect socket '+i);
		calls[i] = api.MarketDataStreamService.MarketDataStream();

		calls[i].on('data', function(msg) {
		  console.log('msgCount: ', ' | msg: ', msg);
		});
		calls[i].on('error', function(e) {
		  console.log('error: ', e);
		});
		calls[i].on('status', function(status) {
		  //console.log('status: ', status);
		});
		calls[i].on('end', function() {
		 // console.log('socket end');
		}); 


		setTimeout(function(){
			console.log('close second');
			calls[i].cancel();
		}, 1000);
	}

}, 4000);


setTimeout(function(){
	console.log('finish');
}, 5000);