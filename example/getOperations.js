var tinkoff_v2 = require ('../tinkoff_v2.js');
var api = new tinkoff_v2({'token'   : process.argv[2]});

(async function main(){	
	let from = new Date();
	let to   = new Date();
	from.setHours(from.getHours() - 24);
	
	let operations = await api.Operations.GetOperations({
		'account_id' : "12345",
		'state' : "OPERATION_STATE_EXECUTED",
		'from'  : from,
		'to'    : to,
	});
	console.log(operations);
})();

	
