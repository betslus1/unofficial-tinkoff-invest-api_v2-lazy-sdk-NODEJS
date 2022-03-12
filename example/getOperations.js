let from = new Date();
let to   = new Date();
to.setHours(to.getHours() - 24);

let operations = await api.Operations.GetOperations({
	'account_id' : opt.account,
	'state' : "OPERATION_STATE_EXECUTED",
	'from'  : from,
	'to'    : to,
	'figi'  : opt.figi,
});
