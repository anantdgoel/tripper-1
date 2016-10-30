var map;
var Polyline;
var SimpleLineSymbol;
var Graphic;
var GraphicsUtils;

// Initialize Firebase
var config = {
  apiKey: "AIzaSyDzql_it0KqLLLdWG2usN2vIfMRKUTKQUs",
  authDomain: "pricely-adb60.firebaseapp.com",
  databaseURL: "https://pricely-adb60.firebaseio.com",
  storageBucket: "pricely-adb60.appspot.com",
  messagingSenderId: "807833037948"
};
firebase.initializeApp(config);


function generateMap(){



  require([
    "esri/map",
    "esri/basemaps",
    "esri/layers/WebTiledLayer",
    "esri/geometry/Polyline",
    "esri/symbols/SimpleLineSymbol",
    "esri/graphic",
    "esri/graphicsUtils",
    "dojo/domReady!"
  ], function(Map, esriBasemaps, WebTiledLayer, Polyline_Load, SimpleLineSymbol_Load, Graphic_Load, GraphicsUtils_Load) {

    Polyline = Polyline_Load;
    SimpleLineSymbol = SimpleLineSymbol_Load;
    Graphic = Graphic_Load;
    GraphicsUtils = GraphicsUtils_Load;




    map = new Map("map", {
      basemap: "gray-vector",  //For full list of pre-defined basemaps, navigate to http://arcg.is/1JVo6Wd
      center: [-122.45, 37.75], // longitude, latitude
      zoom: 19
    });
  });

}

//Math.floor(Math.random() * 6) + 1
var autocomplete_second;
var autocomplete_first;

$(document).ready(function(){
  generateMap();


 // start
 let autocomplete_first_input = document.getElementById('startIndex');
     autocomplete_first = new google.maps.places.Autocomplete(autocomplete_first_input);

  autocomplete_first.addListener('place_changed', function(){
    let place = autocomplete_first.getPlace();
    let mapPoint = [place.geometry.location.lng(), place.geometry.location.lat()];

    $(".map--input--end").animate({
      "margin-top":"0px"
    })

    map.centerAndZoom(mapPoint, 19)
  });

  let autocomplete_second_input = document.getElementById('endIndex');
   autocomplete_second = new google.maps.places.Autocomplete(autocomplete_second_input);
   autocomplete_second.addListener('place_changed', function(){
     $(".button-core").css("display", "block");
     $(".button-core").animate({
       opacity:1
     })
   });

   if($(".content-main").data("id") === 10205269038044802){
     var imgsRef = firebase.database().ref('attr');

     imgsRef.on('value', function(snapshot) {
         item = snapshot.val();
         if(item === "yes"){
           $(".map--output-Com").animate({
             top:"60px"
           }, 500);

           var attrRef = firebase.database().ref();
               attrRef.update({ attr: "no" });
         }

     });

   }

});

$(document).on("click", "#startchat", function(){
  $(".map--output-Com").animate({
    bottom:"-300px"
  }, 500, function(){
    $(".chat-interface").animate({
      left:"0px"
    }, 500, function(){

    });
    $(".map-content").animate({
      left:"-100%"
    }, 500, function(){

    });
  });
});

function userIsTyping(){
  var type = "<div style='margin-bottom:-40px; opacity:0' class='text-loader text-bubble'>" +
              "<div class='loddot'></div>" +
              "<div class='loddot'></div>" +
              "<div class='loddot'></div>" +
            "</div>";
}

function userText(text, own){
  return "<div class='text-bubble'>" +
              text +
            "</div>";
}

function sendMessage(text, own, id, pic, name){
  if($(".chat-conversation .msg-post:first-child").data("uid") === id){
    $(".chat-conversation .msg-post:first-child").find(".text-bubble").append("<br>" + text);
  } else {
    var content = "<div data-uid='" + id + "' class='msg-post " + ((!own) ? "not-own" : "") + "'>";

    if(!own){
      content += "<div class='other-pic' style='background-image:url(" + pic + ")'></div>";
      content += "<div class='user-name'>" + name + "</div>";
    }

      content += userText(text, own);
      content += "<div class='clear'></div>";
      content += "</div>";

    $(".chat-conversation").prepend(content);

    $(".chat-conversation .msg-post:first-child").animate({
      "margin-bottom":0,
      "opacity":1
    })
  }

}

$(document).on("keypress", ".chat-text-enter input", function(e){
  const $that = $(this);
  if(e.which == 13) {
    var text = $that.val();
                $that.val(""); // clear
    var uid = $(".content-main").data("id");
    var paper = firebase.database().ref();
        paper.update(
          {
            LastChat: text,
            LastPic: $(".content-main").data("pic"),
            LastPerson: $(".content-main").data("name"),
            LastId: uid,
            isTyping: false
          });
    sendMessage(text, true, uid);

  }
});

var valnew = firebase.database().ref();

valnew.on('value', function(snapshot) {
  var item = snapshot.val();
  if(item.LastPerson !== $(".content-main").data("name")){
    sendMessage(item.LastChat, false, item.LastId, item.LastPic, item.LastPerson);
  }

});

$(document).on("click", ".chatroom-block", function(){

  $(".chat-content").animate({
    left:"-100%"
  }, 500, function(){

  });

  $(".chat-interface").animate({
    left:"0px"
  }, 500, function(){

  });
});




$(document).on("click", ".start-analysis", function(){
  $(".button-core text").css("display", "none");
  $("#OptimizingRoute").fadeIn(300);
  $(".start-analysis").removeClass("start-analysis");



  let place_1 = autocomplete_first.getPlace();
  let mapPoint_1 = [place_1.geometry.location.lng(), place_1.geometry.location.lat()];

  let place_2 = autocomplete_second.getPlace();
  let mapPoint_2 = [place_2.geometry.location.lng(), place_2.geometry.location.lat()];

  $(".button-core").addClass("loadedPart");

  setTimeout(function(){
    $(".button-core").addClass("loadedPart2");
    $.ajax({
        url: "/directions",
        type: "POST",
        data:{
            start:JSON.stringify({data:[mapPoint_1[1],mapPoint_1[0]]}),
            end:JSON.stringify({data:[mapPoint_2[1],mapPoint_2[0]]})
          },
        success: function(results){
          $(".map--outputs").fadeIn();
          $(".map--centre").css("display", "none");
          $(".button-core").addClass("loaded");
          $(".button-core").addClass("select-friends");
          $(".map-button-Alone").addClass("whole");
          $(".map--input--end").animate({
            "margin-top":"-80px",
            "z-index":"4"
          });

          var polylineJson = {
            "paths":[results.steps]
          };





          let symbol = new SimpleLineSymbol().setWidth(3);
              symbol.setColor("#49B273");

          let geometry = new Polyline(polylineJson);

          let polyline = new esri.Graphic(geometry, symbol);

          let polyExtent = geometry.getExtent();

          map.graphics.add(polyline);
          map.setExtent(polyExtent)

          let matches = results.matching;

          $(".map--output-personas").css("width", matches*($(window).width()));

          var html = "";
          var html_g = "";
          for(var i in matches){
            if(matches[i] && matches[i].name){
              html += `
              <div class="map--output-persona">
                <div class="persona-header-check fa fa-check-circle"></div>
                <div style="background-image:url(` + matches[i].picture + `)" class="persona-image"></div>
                <div class="persona-header">
                  <div class="persona-header-title">` + matches[i].name + `, ` + matches[i].age + `</div>
                  <div class="persona-where">You share 24 miles together</div>
                  <div class="persona-desc-h"><div class="persona-desc">` + ((matches[i].desc) ? matches[i].desc : "") + `</div></div>
                </div>
              </div>
              `;

              if(parseFloat(i) < 3){
                html_g += `
                  <div style="background-image:url(` + matches[i].picture + `)" class="persona-ball-image"></div>
                `
              }

            }



          }
          const matches_count = matches.length;
          $(".map--output-found-g").html(html_g)
          $(".map--output-personas").html(html);
          $(".map--output-found-description span").text(matches_count)

          $(".map--output-persona").css("width", ($(window).width() - 40));
          $(".map--output-personas").css("width", (matches_count)*($(window).width() ));
          $(".map--output-persona").animate({
            opacity:1
          })


          setTimeout(function(){


            $(".button-findMe").fadeIn(300);
            $(".button-findMe").animate({
              "margin-bottom": "10px"
            });

            $(".button-core").removeClass("loaded");
            $(".button-core").removeClass("loadedPart");
            $(".button-core").removeClass("loadedPart2");

            $(".button-core text").css("display", "none");
            $("#FindFellows").fadeIn(300);

            $(".map--output-found").fadeIn();
            //$(".button-core").addClass("white");
          }, 2000);


        },
        error:function(){

        }
      });
    }, 1200);
});


$(document).on("click", ".select-friends", function(){

  $(".button-findMe").animate({
    "margin-bottom": "-70px"
  });

  $(".button-findMe").fadeOut();

  $(".map--output-found").animate({
    "margin-left": "-100%"
  });

  $(".map--output-personas-h").animate({
    "left": "0"
  });

  $(this).addClass("finalize-friends");
  $(this).removeClass("select-friends");
  $(".button-core text").css("display", "none");
  $("#PickTravel").fadeIn(300);



});


$(document).on("click", ".map--output-persona .persona-image", function(){

  $(this).parent().find(".persona-header-check").toggle();

  var count = $(".persona-header-check:visible").length;
  $("#PickTravel").text("Traveling with " +  count + " Buddies");
});


$(document).on("click", ".return", function(){

  $(".chat-content").animate({
    left:"100%"
  });

  $(".map-content").animate({
    left:"0"
  });
});

$(document).on("click", ".return-to-main", function(){

  $(".chat-content").animate({
    left:"0"
  });

  $(".chat-interface").animate({
    left:"100%"
  });
});

$(document).on("click", ".button-findMe", function(){

  $(".map--outputs, .map--buttons").fadeOut();

});

$(document).on("click", ".message", function(){

  $(".chat-content").animate({
    left:"0"
  });

  $(".map-content").animate({
    left:"-100%"
  });
});



$(document).on("click", "#closemenu .fa", function(){

  $(".menu-tile").animate({
    left:"-100%"
  }, 500);
});


$(document).on("click", "#openmenu", function(){
  $(".menu-tile").animate({
    left:"0"
  }, 500);
});

// load firebase and check user id $(body).data("id");
//

var config = {
  apiKey: "AIzaSyDzql_it0KqLLLdWG2usN2vIfMRKUTKQUs",
  authDomain: "pricely-adb60.firebaseapp.com",
  databaseURL: "https://pricely-adb60.firebaseio.com",
  storageBucket: "pricely-adb60.appspot.com",
  messagingSenderId: "807833037948"
};


$(document).on("click", ".finalize-friends", function(){
  $(".button-core text").css("display", "none");
  $("#SetChat").fadeIn(300);
  $(".map--output-ok").animate({
    bottom:"80px"
  }, 500);


  // this function call firebase
  var attrRef = firebase.database().ref();
      attrRef.update({ attr: "yes" });

});

$(document).on("click", "#SetChat", function(){

  $(".map--outputs").animate({
    opacity:"0"
  }, 500, function(){
    $(".map--outputs").css("display", "none");
  });

});


$(document).on("click", ".map--output-persona .persona-header", function(){
  const $parent = $(this).parent();
  if($(this).parent().hasClass("showDesc")){
      $parent.removeClass("showDesc");
      $parent.find(".persona-header").animate({
        height:"88px"
      });
  } else {
      $parent.addClass("showDesc");
      $parent.find(".persona-header").animate({
        height:"90%"
      });
  }


});
