//Отключенные автоматическое преобразование типа
  var resp = await api.Sandbox.SandboxPayIn({
    'account_id': options.sandboxAccountId, 
    'amount': {
      "currency": "RUB",
      "units": 10000,
      "nano": 0
    },
    'isEncodeRequest' : false
  }); 

//Включенное автоматическое преобразование типа
  var resp = await api.Sandbox.SandboxPayIn({
    'account_id': options.sandboxAccountId, 
    'amount': '10000 RUB',
  });