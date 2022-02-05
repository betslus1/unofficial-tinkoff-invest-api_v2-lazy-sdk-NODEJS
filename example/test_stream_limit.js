const tinkoff_v2 = require('../tinkoff_v2.js');
const api = new tinkoff_v2({
    'isDebug': false,
    'token': process.argv[2]
});
const instruments = ["BBG005P7Q881", "BBG00WCNDCZ6", "BBG000B9XRY4", "BBG000BXQ7R1" /*, "BBG000BT3HG5"*/ ];
const streams = instruments.length;
const calls = [];
let counter = 0;
let timerId;
for (let i = 0; i < streams; i++) {
	
	setTimeout(() => {
		console.log('try connect to socket', i);
		let call = api.MarketDataStreamService.MarketDataStream();
	}, 1000 * i);

    
}