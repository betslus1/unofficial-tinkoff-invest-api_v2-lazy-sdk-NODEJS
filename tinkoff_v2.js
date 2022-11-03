//Copyright © 2022 Vitaliy S.
//Licensed under the Apache License, Version 2.0

var grpc        = require('@grpc/grpc-js');
var copy        = require('fast-copy');
var protoLoader = require('@grpc/proto-loader');
var fs          = require('fs');
var path        = require('path');

module.exports = function (opt){
  if (opt === undefined){
    throw 'Не переданы настройки';
  }
  this.token = opt.token;
  if (this.token === undefined){
    throw 'Не указан токен';
  }
  if(opt.isDebug !== undefined){
    this.isDebug = opt.isDebug;
  }

  if (opt.connOpt !== undefined){
    this.connOpt = opt.connOpt;
  }

  this.appName = opt.appName;
  if (this.appName === undefined){
    this.appName = 'lazy-nodejs'
  }

  this.isDebug  = false;
  this.url      = 'invest-public-api.tinkoff.ru:443';
  this.protoDir = __dirname + '/investAPI/src/docs/contracts/';

  
  this.metadataCreds     = false;
  this.ssl_creds         = false;
  this.ssl               = grpc.credentials.createSsl();
  this.protoFiles        = []; 
  this.protoNames        = [];
  this.proto             = {};
  this.packageDefinition = {};
  this.protoDescriptor   = {};
  this.contracts         = {};
  this.client            = {};
  this.types             = {};


  var metadata          = new grpc.Metadata();
  metadata.add('Authorization', 'Bearer ' + this.token);
  metadata.add('x-app-name', this.appName);
  this.metadataCreds = grpc.credentials.createFromMetadataGenerator(function(args, callback) {
   callback(null, metadata);
  });

  this.ssl_creds = grpc.credentials.combineChannelCredentials(
    this.ssl,
    this.metadataCreds
  );

  this.getProtoFiles = function(){
    var getFiles = function (dir, files_){
      files_ = files_ || [];
        var files = fs.readdirSync(dir);
        for (var i in files){
            var name = dir + '/' + files[i];
            if (fs.statSync(name).isDirectory()){
                getFiles(name, files_);
            } else {
              let pathDir = name.split('/');
              let filename = pathDir[pathDir.length - 1];
              let name = filename.split('.');
              name = name[0];
              if(name.length > 0){
                files_.push(name);                
              }
            }
        }
        return files_;
    };

    this.protoFiles     = getFiles(this.protoDir);

    for (let pf of this.protoFiles){
      this.protoNames.push(pf.split('.')[0])
    }
  }

  this.loadProto = function(){
    for(let pn of this.protoNames){
      this.packageDefinition[pn] = protoLoader.loadSync(
        this.protoDir + pn + '.proto',
        {
         keepCase: true,
         longs: Number,
         enums: String,
         defaults: true,
         oneofs: true,
      });
    }
  }

  this.loadPackageDefinition = function(){
    for(let pn of this.protoNames){
      this.protoDescriptor[pn] = grpc.loadPackageDefinition(this.packageDefinition[pn]);
    }
  }

  this.loadContracts = function(){
    for(pn of this.protoNames){
      this.contracts[pn] = this.protoDescriptor[pn].tinkoff.public.invest.api.contract.v1;

      this.log('try to loadContracts['+pn+']');
      this.log(this.contracts[pn]);

      for (let serviceName of Object.keys(this.contracts[pn])){
        if (serviceName.indexOf('Service') > 0){

          this[serviceName]    = new this.contracts[pn][serviceName](this.url, this.ssl_creds, this.connOpt ?? {});
          var obj = this;
          var pn_local = copy(pn);


          var serviceNameShort = serviceName.replace('Service', '');
          this[serviceName + 'Promise'] = {};
          this[serviceNameShort] = {};


          for (let service of Object.keys(this.contracts[pn][serviceName].service)){
            this[serviceName + 'Promise'][service] = function (opt) {
              return new Promise(function (resolve, reject) {
                obj[serviceName][service](opt, function (err, response) {
                  if (err !== null){
                    if (err!==undefined && err.metadata != undefined && err.metadata.internalRepr !=undefined){
                      var internal = err.metadata.internalRepr;
                      console.log({internal});
                      reject(err + 
                        ' \n tracking-id: ' + internal.get('x-tracking-id') + 
                        ' \n message: "'+ internal.get('message') + '"' +
                        ' \n date: "'+ internal.get('date') + '"' +
                        ' \n x-ratelimit-limit: "'+ internal.get('x-ratelimit-limit') + '"' +
                        ' \n x-ratelimit-remaining: "'+ internal.get('x-ratelimit-remaining') + '"' +
                        ' \n x-ratelimit-reset: "'+ internal.get('x-ratelimit-reset') + '"' 
                      );
                    }else{
                      reject(err);
                    }
                  }

                  if (response !== undefined) {
                    resolve(response);
                  } else {
                    resolve(0);
                  }
                });
              });
            }

            this.types[ obj.contracts[pn][serviceName]['service'][service]['path'] ] = {
              'requestType'  : this.getTypes( obj.contracts[pn][serviceName]['service'][service]['requestType']['type']['field'] ),
              'responseType' : this.getTypes( obj.contracts[pn][serviceName]['service'][service]['responseType']['type']['field'] )
            };

            for (let f of Object.keys(this.types[ obj.contracts[pn][serviceName]['service'][service]['path'] ]['responseType'])){
              let typeName = this.types[ obj.contracts[pn][serviceName]['service'][service]['path'] ]['responseType'][f];
              if (obj.contracts[pn][typeName] !== undefined && obj.contracts[pn][typeName]['type']['field'] !== undefined){
                let fields = this.getTypes( obj.contracts[pn][typeName]['type']['field'] );
                for (let f of Object.keys(fields)){
                  this.types[ obj.contracts[pn][serviceName]['service'][service]['path'] ]['responseType'][f] = fields[f];
                }
              }
            }

            this[serviceNameShort][service] = function (opt) {
              return new Promise(function (resolve, reject) {


                if (opt.rules != undefined){
                  obj.types[obj[serviceName][service]['path']]['requestType'] = opt.rules;
                  delete opt.rules;
                }

                if (opt.isEncodeRequest != false){
                  obj.encodeRequest(opt, obj.types[obj[serviceName][service]['path']]['requestType']);
                  delete opt.isEncodeRequest;
                }



                obj[serviceName][service](opt, function (err, response) {
                 if (err !== null){
                    if (err!==undefined && err.metadata != undefined && err.metadata.internalRepr !=undefined){
                      var internal = err.metadata.internalRepr;
                      if (this.isDebug == true){
                        console.log({internal});
                      }
                      reject(err + 
                        ' \n tracking-id: ' + internal.get('x-tracking-id') + 
                        ' \n message: "'+ internal.get('message') + '"' +
                        ' \n date: "'+ internal.get('date') + '"' +
                        ' \n x-ratelimit-limit: "'+ internal.get('x-ratelimit-limit') + '"' +
                        ' \n x-ratelimit-remaining: "'+ internal.get('x-ratelimit-remaining') + '"' +
                        ' \n x-ratelimit-reset: "'+ internal.get('x-ratelimit-reset') + '"' 
                      );
                    }else{
                      reject(err);
                    }
                  }
                  
                  if (response !== undefined) {
                    response = obj.decodeResponse(response, obj.types[this.methodDefinition.path]['responseType']);            
                    resolve(response);
                  } else {
                    resolve(0);
                  }
                });
              });
            }

          }

        }
      }
    }
  }


  this.getTypes = function (arr){
    let out = {};
    for (let a of arr){
      out[a.name] = a.typeName;
    }
    return out;
  }

  this.decodeResponse = function(resp, rules){
    if (resp == null || resp == undefined){
      return null;
    }
    
    for (let fieldName of Object.keys(resp) ){

      if (rules[fieldName] == 'Quotation'){
        if (Array.isArray(resp[fieldName])){
          for (let i in resp[fieldName]){
            resp[fieldName][i] = this.quotation2decimal(resp[fieldName][i]);
          }
        }else{
          resp[fieldName] = this.quotation2decimal(resp[fieldName]);
        }
        continue;
      }

      if (rules[fieldName] == 'MoneyValue'){
        if (Array.isArray(resp[fieldName])){
          for (let i in resp[fieldName]){
            resp[fieldName][i] = this.money2decimal(resp[fieldName][i]);
          }
        }else{
          resp[fieldName] = this.money2decimal(resp[fieldName]);
        }
        continue;
      }

      if (rules[fieldName] == 'google.protobuf.Timestamp' || fieldName == 'date_time'){
        resp[fieldName] = this.timestamp2Date(resp[fieldName]);
        continue;
      }

      

      if(typeof resp[fieldName] == 'object' && resp[fieldName] != null){
        resp[fieldName] = this.decodeResponse(resp[fieldName], rules);
      }
    }

    return resp;
  }

  this.encodeRequest = function(resp, rules){
    for (let fieldName of Object.keys(resp) ){

      if (rules[fieldName] == 'Quotation'){
        resp[fieldName] = this.decimal2quotation(resp[fieldName]);
        continue;
      }

      if (rules[fieldName] == 'MoneyValue'){
        resp[fieldName] = this.decimal2money(resp[fieldName]);
        continue;
      }

      if (rules[fieldName] == 'google.protobuf.Timestamp'){
        resp[fieldName] = this.date2timestamp(resp[fieldName]);
        continue;
      }

      if(typeof resp[fieldName] == 'object' && resp[fieldName] != null){
        // console.log(resp[fieldName], rules[fieldName], rules ); //uncomment it for debug encodeRequest
        resp[fieldName] = this.encodeRequest(resp[fieldName], rules);
      }
    }

    return resp;
  }

  this.quotation2decimal = function (obj){
    if (obj == null){
      return null;
    }
    return obj.units + obj.nano/1000000000;
  }

  this.decimal2quotation = function (dec){
    if (dec == null){
      return null;
    }
    return {
      'units' : Math.floor(dec),
      'nano': (dec - Math.floor(dec)) * 1000000000,
    };
  }

  this.money2decimal = function (obj){
    if (obj == null){
      return null;
    }
    return obj.units + obj.nano/1000000000 + ' ' + obj.currency;
  }

  this.decimal2money = function (money){
    if (money == null){
      return null;
    }
    var [dec,currency] = money.split(' ');

    return {
      'units' : Math.floor(dec),
      'nano' : (dec - Math.floor(dec)) * 1000000000,
      'currency' : currency
    };
  }


  this.timestamp2Date = function (obj){
    if (obj == null){
      return null;
    }
    return new Date(obj.seconds*1000 + Math.round( obj.nanos/1000000 ) );
  }

  this.date2timestamp = function (date){
    if (date == null){
      return null;
    }
    return {
      'seconds' : Math.round(date.getTime()/1000),
      'nanos': 0,
    };
  }

  this.log = function log (msg){
    if (this.isDebug === true){
      console.log(msg);
    }
  }


  this.getProtoFiles();
  this.loadProto();
  this.loadPackageDefinition(); 
  this.loadContracts();

  return this;
}
