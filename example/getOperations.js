let from = new Date();
let to   = new Date();
to.setHours(to.getHours() - 24);

var tinkoff_v2 = require ('../tinkoff_v2.js');

var api = new tinkoff_v2({
	'token'   : process.argv[2]
});

(async function main(){	
	let operations = await api.Operations.GetOperations({
		'account_id' : "12345",
		'state' : "OPERATION_STATE_EXECUTED",
		'from'  : from,
		'to'    : to,
	});
	console.log(operations);
)();

	
