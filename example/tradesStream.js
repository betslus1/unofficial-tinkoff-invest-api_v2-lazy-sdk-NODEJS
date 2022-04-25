var tinkoff_v2 = require ('../tinkoff_v2.js');

var api = new tinkoff_v2({
	'isDebug' : false,
	'token': process.argv[2]
});

var call = api.OrdersStreamService.TradesStream();

call.on('data', function(msg) {
  console.log('msgCount: ', ' | msg: ', msg);
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



setTimeout(function(){
	console.log('close first');
	call.cancel();
}, 1000);
