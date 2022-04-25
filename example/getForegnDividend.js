var tinkoff_v2 = require ('../tinkoff_v2.js');
var api = new tinkoff_v2({'token'   : process.argv[2]});

!(async function run() {
  let from = new Date('2021-01-01');
  let to   = new Date('2022-01-01');

  var operationNow = await api.Operations.GetDividendsForeignIssuer({
    "generate_div_foreign_issuer_report": {
      "account_id": "2000639605",
      "from": from,
      "to": to
    },
    //Автоматически не кодируются вложенные объекты, для них вручную указываем типы данных
    'rules':{
      'from' : 'google.protobuf.Timestamp',
      'to'   : 'google.protobuf.Timestamp'
    }
  });

  //Автоматически могут не распозанваться глубоко вложенные объекты, надо помочь)
  console.log(api.decodeResponse(operationNow?.div_foreign_issuer_report?.dividends_foreign_issuer_report, {
      'record_date' : 'google.protobuf.Timestamp',
      'payment_date'   : 'google.protobuf.Timestamp',
      'dividend'   : 'Quotation',
      'external_commission'   : 'Quotation',
      'dividend_gross'   : 'Quotation',
      'tax'   : 'Quotation',
      'dividend_amount'   : 'Quotation',
  }));
})();
