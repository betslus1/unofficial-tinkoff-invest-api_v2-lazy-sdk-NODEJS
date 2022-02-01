var tinkoff_v2 = require ('../tinkoff_v2.js');

if (process.argv[2] == null){
	console.log('example start: node example/unary.js <token>');
	return;
}
var api = new tinkoff_v2({
	'token'   : process.argv[2]
});

async function main(){
	try {
		
		console.log(
			await api.Instruments.Bonds({})
		);
		
	}catch(err){
		console.log(err);
	}
	
}
main();
