//Copyright © 2022 Vitaliy Slyusarenko.
//Licensed under the Apache License, Version 2.0

var grpc        = require('@grpc/grpc-js');
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

  this.isDebug  = false;
  this.url      = 'invest-public-api.tinkoff.ru:443';
  this.protoDir = __dirname + '/protos/';

  
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

  var metadata          = new grpc.Metadata();
  metadata.add('Authorization', 'Bearer ' + this.token);
  metadata.add('x-app-name', 'lazy-nodejs');
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
              let strategyName = filename.split('.');
              strategyName = strategyName[0];
                files_.push(strategyName);
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
         longs: String,
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
    for(let pn of this.protoNames){
      this.contracts[pn] = this.protoDescriptor[pn].tinkoff.public.invest.api.contract.v1;

      this.log('try to loadContracts['+pn+']');
      this.log(this.contracts[pn]);

      for (let serviceName of Object.keys(this.contracts[pn])){
        if (serviceName.indexOf('Service') > 0){

          this[serviceName]    = new this.contracts[pn][serviceName](this.url, this.ssl_creds);
          var obj = this;

          this[serviceName + 'Promise'] = {};
          for (let service of Object.keys(this.contracts[pn][serviceName].service)){
            this[serviceName + 'Promise'][service] = function (opt) {
              return new Promise(function (resolve, reject) {
                obj[serviceName][service](opt, function (err, response) {
                  if (err !== null){
                    reject(err);
                  }

                  if (response !== undefined) {
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
