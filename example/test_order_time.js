var tinkoff_v2 = require ('../tinkoff_v2.js');

var api = new tinkoff_v2({
	'isDebug' : false,
	'token': process.argv[2]
});

var call = api.OrdersStreamService.TradesStream();
var rules = {'price':'Quotation', 'created_at': 'google.protobuf.Timestamp', 'date_time': 'google.protobuf.Timestamp', 'time': 'google.protobuf.Timestamp'}

var startTime = 0;
var recieveOrderNumber = 0;

call.on('data', function(msg) {
	console.log(msg);
	let recieve = (new Date()).getTime();
	let decoded = api.decodeResponse(msg.order_trades, rules);
  let create  = decoded.created_at?.getTime();
  let execute = decoded.trades[0]?.date_time?.getTime();

  console.log(decoded);
  console.log(`lag_created = ${(create  - startTime)} \n lag_execute = ${(execute - startTime)} \n lag_recieveOrderNumber = ${(recieveOrderNumber - startTime)}\n lag_recieveExecutionReport = ${(recieve - startTime)}`);
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



setTimeout(async function(){
	console.log('send order');
	let now = (new Date()).getTime();
	let req = {
		"account_id":"2088918905",
		"quantity":"1",
		"price":9,
		"direction":"ORDER_DIRECTION_BUY",
		"order_type":"ORDER_TYPE_LIMIT",
		"order_id":"ord_"+now,
		"figi":"BBG00HTN2CQ3"
	};

	console.log(req);

	startTime = (new Date()).getTime();
	let res = await api.Orders.PostOrder(req);
  recieveOrderNumber = (new Date()).getTime();
	console.log(res);

	//call.cancel();
}, 5000);
