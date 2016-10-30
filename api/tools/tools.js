var moment = require('moment');
var async = require('async');
var crypto = require('crypto');
var request = require('request');
var OAuth = require('oauth');


var _ = {
  tryParseJSON: function (jsonString) {
        try {
            var o = JSON.parse(jsonString);

            // Handle non-exception-throwing cases:
            // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
            // but... JSON.parse(null) returns 'null', and typeof null === "object",
            // so we must check for that, too.
            if (o && typeof o === "object" && o !== null) {
                return o;
            }
        } catch (e) {
            return {
                error: 'error'
            }
        }
    }
}


function cryptobox(x, y, z){
  return crypto.randomBytes(x).toString('hex') + '_' + crypto.randomBytes(y).toString('hex') + '_' + crypto.randomBytes(z).toString('hex');
};

module.exports = {
    encrypt:function encrypt_data(text){
      var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq')
      var crypted = cipher.update(text,'utf8','hex')
      crypted += cipher.final('hex');
      return crypted;
    },
    decrypt: function decrypt_data(text){
      var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq')
      var dec = decipher.update(text,'hex','utf8')
      dec += decipher.final('utf8');
      return dec;
    },
    request:function(type, url, method, send, cb, res, xml){


      function isValidURL(s) {
        var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return regexp.test(s);
       }

      if(isValidURL(url)){
        if(type === 'http' || type === "xml" || type === 'oauthv2' || type === 'refresh_token' || type === 'basicauth'){

            if(!send){
                send = {};
            }




            var options = {
                url: url,
                method: (method) ? method.toUpperCase() : "GET",
                headers: send.headers || {},
                timeout:20000
            };

            if(send.body){
                options.body = send.body;
                options.json = true;
            }
            if(send.form){
                options.form = send.form;
            }
            if(send.formData){
                options.formData = send.formData;
                options.json = true;
            }

            if(type === "basicauth"){
              var hash = new Buffer(send.auth.username + ":" + send.auth.password).toString("base64")
              options.headers["Authorization"] = "Basic " + hash;
            }

            function tryRequest(options, callback){
              try{
                request(options, callback);
              } catch(err){
                if(res){
                  res('There was an error in parsing, please reformat your data', 400);
                }
              }
            }

            function callback(error, response, body) {
                //var response_size = (response && response.client && response.client.bytesRead) ? response.client.bytesRead : 0 ;


                if(type === "xml"){
                  var parseString = require('xml2js').parseString;
                  var xml = body;
                  parseString(xml, function (err, result) {
                      cb(result, 200);
                  });
                } else {
                  if(response){
                    if (!error && response.statusCode == 200) {

                      var info = (typeof body === "object") ? body : _.tryParseJSON(body) ;



                      cb(info, response.statusCode);
                    } else {

                        if(res){

                            res({error:error, body:body}, response.statusCode);

                         } else {


                         }
                    }
                  } else {
                    res({error:"We received no response", body:"External Server Error"}, 404);
                  }
                }



            }


            tryRequest(options, callback);

        } else if(type === 'oauthv1'){
            if(send.auth){
              var oauth = new OAuth.OAuth(
              send.auth.requesttokenurl,
              send.auth.accesstokenurl,
              send.auth.consumerkey,
              send.auth.consumersecret,
              '1.0A',
              null,
              send.auth.encoding || 'HMAC-SHA1'  //'HMAC-SHA1'
              );

              var method = method.toLowerCase();
              if(method === 'get' || method === 'post'){
                try{
                   oauth[method](
                    url,
                    send.auth.token, //test user token
                    send.auth.tokensecret, //test user secret
                    function (error, body, response){


                        if (!error && response.statusCode == 200) {
                          var info = (typeof body === "object") ? body : _.tryParseJSON(body) ;

                          cb(info);
                        } else {


                            res(e, body, res);

                        };

                  });
                } catch(err){


                    if(res){
                        res('There was an error in parsing, please reformat your data', 400, {error:"There was an error in parsing, please reformat your data."});
                    }

                }
              } else {
                if(res){
                  res("", 400, {error:"Sorry, we don't support that request method yet."});
                }
              }


          }  else {
              if(res){
                res("", 400, {error:"You are missing a few authentication details."});
              }
          }
        } else {
            if(res){
              res("nope", 400, {});
            }
        }
      } else {
          if(res){
            res("nope", 400, {error:"Your URL is not valid"});
          }
      }
    },
    cryptobox:function(x, y, z){
        return cryptobox(x, y, z);
    }
}
