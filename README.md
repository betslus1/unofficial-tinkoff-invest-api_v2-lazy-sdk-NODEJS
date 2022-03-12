# Неофициальный SDK для Tinkoff Invest APIv2 для nodejs

Tinkoff Invest API — это интерфейс для взаимодействия с торговой платформой [Тинькофф Инвестиции](https://www.tinkoff.ru/invest/).

# Функциональные возможности
* автоматическая генерация SDK на основе proto-файлов
* поддержка Unary-request
* поддержка Bidirectional streaming RPC
* поддержка callback
* поддержка promise (для unary-request)
* автоматическое преобразование типов quotation/moneyValue/timestamp

# Об API и протоколе
API реализован на быстром, удобном и функциональном протоколе [gRPC](https://grpc.io/docs/).

[Документация для разработчиков](https://tinkoff.github.io/investAPI/)


# Как работать с этим репозитарием

* В [Issues](https://github.com/Tinkoff/investAPI/issues) вы можете задать вопрос или найти ответ касаемый сервиса Тинькоф - инвестиций.
* В данном репозитории рекомендуется задвать вопросы по конкретно данному SDK

* Если вы встретили неточность или хотели бы что-то дополнить или исправить, то буду рад принять от вас pull request.


# Примеры работы

```
var tinkoff_v2 = require ('../tinkoff_v2.js');
var api = new tinkoff_v2({'token'   : "your token"});

(async function main(){	
	let from = new Date();
	let to   = new Date();
	to.setHours(to.getHours() - 24);
	
	let operations = await api.Operations.GetOperations({
		'account_id' : "your account id",
		'state' : "OPERATION_STATE_EXECUTED",
		'from'  : from,
		'to'    : to,
	});
	console.log(operations);
)();

/*
response

{
  operations: [
    {
      trades: [],
      id: '2462795973',
      parent_operation_id: '386692157970',
      currency: 'usd',
      payment: '-0.01 usd',
      price: '0 usd',
      state: 'OPERATION_STATE_EXECUTED',
      quantity: 0,
      quantity_rest: 0,
      figi: 'BBG00HTN2CQ3',
      instrument_type: 'share',
      date: 2022-03-11T15:28:37.174Z,
      type: 'Удержание комиссии за операцию',
      operation_type: 'OPERATION_TYPE_BROKER_FEE'
    },
}

```


* Остальные примеры находятся в папке example
* node example/unaryPromise.js token

# Особенности использования 

Поддерживаемые объекты promise с автозаменой quotation/moneyValue/timestamp
 * 'Instruments',
 * 'MarketData',
 * 'Operations',
 * 'Orders',
 * 'Sandbox',
 * 'Users',
 * 'StopOrders'

Поддерживаемые объекты promise 
 * 'InstrumentsServicePromise',
 * 'MarketDataServicePromise',
 * 'OperationsServicePromise',
 * 'OrdersServicePromise',
 * 'SandboxServicePromise',
 * 'UsersServicePromise',
 * 'StopOrdersServicePromise',

Поддерживаемые объекты callback 
 * 'InstrumentsService
 *  'MarketDataService',  
 *  'MarketDataStreamService',
 *  'OperationsService',
 *  'OrdersStreamService',
 *  'OrdersService',
 *  'SandboxService',
 *  'UsersService',
 *  'StopOrdersService',
  
Так же пристуствуют функции:
* api.quotation2decimal(val)
* api.decimal2quotation(val)
* api.timestamp2date(val)
* api.date2timestamp(val)
* api.decodeResponse(resp, rules) //rules = {'price':'Quotation', 'date': 'google.protobuf.Timestamp', ... }
* api.encodeRequest(resp, rules) //rules = {'price':'Quotation', 'date': 'google.protobuf.Timestamp', ... }


Список объектов и методов удобно смотреть через:
* kreya https://tinkoff.github.io/investAPI/grpc/, 
* swagger https://tinkoff.github.io/investAPI/swagger-ui/#/

# Установка

* Копируете репозиторий в папку с проектом
* В папке репозитория npm install
* Актуальные proto-контракты https://github.com/Tinkoff/investAPI/tree/main/src/docs/contracts загружаете в папку protos


# Почему lazy?

В SDK заранее не используется предгенерации классов из proto-файлов и описания статичных объектов и методов. 

Генерация объектов поисходит каждый раз в момент подключения класса.

Минус в производительности, при подключении класса требуются доли миллисекунд для иницализации и предгенерации классов и обьектов. Поэтому не рекомендуется многократно создавать экземпляр объекта (например делать "var api = new tinkoff_v2();" в цикле) в своем коде. Если такая необходимость все таки возникнет, то рекомендую создавать дубликаты обьекта библиотекой fast-copy. Если вы инициализируется библиотеку только один раз, на весь проект, проблемы не будет.

Плюсом является простота обновления SDK и легкая адаптация под любой другой сервис.

Для обновления SDK под новую версию достаточно загрузить новые proto-файлы в папку proto

# Сообщество

[Telegram-чат](https://t.me/joinchat/VaW05CDzcSdsPULM)
