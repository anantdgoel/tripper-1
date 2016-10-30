const $ = require("../tools/tools.js");
const nifty = require('../../api/tools/tools.js');
const async = require("async");
const mongojs = require("mongojs");


module.exports = function(app, keys) {
  app.get("/", function(req, res) {
    res.render("index", {user:req.session.user});
  });



  const fb = {
    redirect_uri: keys.uri + "/checkfb",
    app_id : "1853016281596915",
    secret:"b1e51fce92bdc7cd5301f173c0fde292"
  }

  app.get("/login", function(req, res) {
    const fb_login_uri = "https://www.facebook.com/v2.8/dialog/oauth" +
                             "?client_id=" + fb.app_id +
                             "&redirect_uri=" + fb.redirect_uri;

    res.redirect(fb_login_uri);
  });

  app.get("/checkfb", function(req, res) {

    const fb_ret_uri = "https://graph.facebook.com/v2.8/oauth/access_token" +
                            "?client_id=" + fb.app_id +
                            "&redirect_uri=" + fb.redirect_uri +
                            "&client_secret=" + fb.secret +
                            "&code=" + req.query.code;

    $.request("http", fb_ret_uri, "GET", {}, function(account_data){


      const fb_data_uri = "https://graph.facebook.com/v2.5/me?fields=id,name,picture,gender&access_token=" + account_data.access_token;


      $.request("http", fb_data_uri, "GET", {}, function(fb_data){
        if(fb_data.id){

          accounts.findOne({id:fb_data.id}, function(e, o){
            if(o){
              o.access_token = account_data.access_token;

              o.name = fb_data.name;
              o.age = 18;
              //o.gender = fb_data.gender;

              req.session.user = o;

              accounts.save(o, function(e){
                res.redirect("/");
              });
            }  else {
              var account = {};

              account.access_token = account_data.access_token;

              account.id = fb_data.id;
              accounts.age = 18;
              account.gender = fb_data.gender;
              account.name = fb_data.name;

              req.session.user = account;

              accounts.insert(account, function(e){
                res.redirect("/");
              });
            }
          })
        } else {
          res.redirect("/");
        }


      });


    });


  });


  const google_api_key = "AIzaSyAOrZpvBz9qTSkT3JM6n6NYY3Bb436sp7o";
  const db_url = "mongodb://test:test@ds053216.mlab.com:53216/tripper";
  const db = mongojs(db_url, [], {authMechanism: 'SCRAM-SHA-1'});
  const accounts = db.collection('accounts');

app.get("/crimeData", function(req, res) {

});



  app.post("/directions", function(req, res) {
    console.log(req.body.start);
    const start = JSON.parse(req.body.start).data; // {data:[lat, long]}
    const end = JSON.parse(req.body.end).data; // [lat, long]
    const arcToken = "JdGv3vBkyTHVLZaqoCXPpdGAVpv7JNOF5CA9auBTyLiaK-YhmbgMilzUS1BvLMovMjNWMlrBaktGbBc2WCTATcpqowD1_6stmiccaBUuxsYZ0_OlByeMu48FtR4BSbGPu7inH2D66RVpuuIHDiCzYA..";
    // url to use instead: http://logistics.arcgis.com/arcgis/rest/services/World/Route/GPServer/FindRoutes/submitJob?parameters
    // parameters info: http://resources.arcgis.com/en/help/arcgis-rest-api/#/Route_service_with_asynchronous_execution/02r300000275000000/
    // optional parameter to use: point barriers <- use the /crimeData url to get the JSON for this
    //const uri_goog = "https://maps.googleapis.com/maps/api/directions/json?origin="+start[0]+","+start[1]+"&destination="+end[0]+","+end[1]+"&key="+google_api_key;
    const uri_map = "http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve?" +
                    "stops=" + start[1] + "," + start[0] + ";" + end[1] + "," + end[0] + ";" +
                    "&token=" + arcToken +
                    "&f=json";

    console.log("Current Key: " + uri_map);
    //$.request("http", "https://data.detroitmi.gov/resource/up3m-9ahm.json", "GET", {}, function(results){


      //todo: return a JSON of lat and long with other attributes
      $.request("http", uri_map, "GET", {}        , function(route){

        // should compile a array of destination endpoints



        var send = {
          steps:[],
          matching:[]
        }
        var query = {};

        if(req.session.user){
          query = {id: { $ne: req.session.user.id } };
        }

        accounts.find(query).toArray( function(e, accounts){
          if(e){
            console.log("E: " + e );
          }

          if(route && route.routes && route.routes.features && route.routes.features[0] && route.routes.features[0].geometry && route.routes.features[0].geometry.paths && route.routes.features[0].geometry.paths[0]){
            var steps = route.routes.features[0].geometry.paths[0];

            for(var i in steps){
              send.steps.push([steps[i][0], steps[i][1]])
            }

            send.matching = accounts;


            res.send(send);
          } else {
            if(route.routes){
              console.log(route)
            }

            if(route.routes){
              console.log(route.routes.features)
            }

            res.send(400);

          }

        });


      }, function(){
        // failed
      });
    // }, function(e, o){
    //   console.log(e);
    //   console.log(o);
    // })
  });




};
