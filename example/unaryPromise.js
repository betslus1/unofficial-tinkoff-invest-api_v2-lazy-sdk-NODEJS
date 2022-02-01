var tinkoff_v2 = require ('../tinkoff_v2.js');

if (process.argv[2] == null){
	console.log('example start: node example/unary.js <token>');
	return;
}
var api = new tinkoff_v2({
	'isDebug' : false,
	'token'   : process.argv[2]
});

async function main(){
	try {
		console.log(
			await api.UsersServicePromise.GetAccounts({})
		);
	}catch(err){
		console.log(err);
	}
	
}
main();
