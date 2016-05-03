var app = angular.module('starter.controllers', ['ionic', 'ui.router']);

app.controller('DashCtrl', function ($scope) {
});

app.controller('ChatsCtrl', function ($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function (chat) {
    Chats.remove(chat);
  };
});

app.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
});

app.controller('AccountCtrl', function ($scope) {
  $scope.settings = {
    enableFriends: true
  };

});


app.controller('CameraCtrl', function ($scope, $cordovaToast, $cordovaCamera, $ionicPopup, $http, $ionicPopup, $cordovaGeolocation, $state) {

  $scope.pictureUrl = 'http://placehold.it/300x300';
  //Longitude und Latitude Variablen, die immer wieder überschrieben werden.
  var lat;
  var long;

//weitere Lokalen Variablen (können nur innerhalb des Ctrl verwendet werden.
  var carQueryUrl = "http://www.carqueryapi.com/api/0.3/?callback=JSON_CALLBACK&";
  var selectedBrand = "";
  var selectedModel = "";
  var intervalID;
  var checkLocationStatusID;


  //Diese Funktion wird bei jedem aufruf der View aufgeführt.
  $scope.$on('$ionicView.enter', function () {
    //Beim Starten der View, wird immer derselbe Placeholder als img gesetzt.
    $scope.pictureUrl = 'http://placehold.it/300x300';
    //es wird ein Interval gestartet, der periodisch die Koordinaten abholt.
    intervalID = setInterval(getCoordiantes, 3000);
    //Das erste Dropdownmenu (Marken) wird mit Daten befüllt.
    loadBrandSelector();
  })

  //Diese Methode dient dazu, die gewünschte Position, aus dem Select, zu speichern
  $scope.selectedBrand = function (brand) {
    selectedBrand = "";
    selectedBrand = brand;
  }

//Diese Methode dient dazu, die gewünschte Position, aus dem Select, zu speichern
  $scope.selectedModel = function (model) {
    console.log("es wurde " + model);
    selectedModel = "";
    selectedModel = model;
  }

  //Funktion holt über die API von carqueryapi.com alle verfügbaren Marken und speichert sie in einem Array.
  function loadBrandSelector() {
    //array, das vom HTML File gelesen werden kann.
    $scope.brands = [];
    //Befehl für die API abfrage
    var cmd = "cmd=getMakes";
    $http.jsonp(carQueryUrl + cmd).success(function (resp) {
      //Im Json "resp" verstecken sich die Marken.
      //die Methode storebrands() speichert die Marken in scope.arrays welche vom HTML gelesen werden können.
      storebrands(resp);
    }).error(function (err) {
      //fehlerbehandlung wenn http.jsonp() nicht ausgeführt werden kann.
      makeToast("Beim laden der Auto's ist etwas schiefgegangen.");
    })
  }

  //speichert die Marken vom json in ein scope.array
  function storebrands(object) {
    for (var i = 0; i < object.Makes.length; i++) {
      $scope.brands.push({title: object.Makes[i].make_display, id: object.Makes[i].make_id});
    }
  }

  //in abhängigkeit der vorgewählten Marke, werden die entsprechenden Modelle geladen.
  $scope.loadModelSelector = function (make) {
    //console.log("im Loadmodelselector mit der marke " + make);
    $scope.models = [];
    var cmd = "cmd=getModels&make=" + make;
    $http.jsonp(carQueryUrl + cmd).success(function (resp) {
      storemodels(resp);
    }).error(function (err) {
      makeToast("Beim laden der Auto's ist etwas schiefgegangen.");
    })

  }

  //speichert die Modelle vom json in ein scope.array
  function storemodels(object) {
    for (var i = 0; i < object.Models.length; i++) {
      $scope.models.push({title: object.Models[i].model_name, id: object.Models[i].model_make_id});
    }
  }

  //diese Funktion startet die Kamera.
  $scope.takePicture = function () {


    //Optionen Für die Kamera
    var options = {
      quality: 100,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 1000,
      targetHeight: 1000,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    $cordovaCamera.getPicture(options).then(function (imageData) {
      //speichert Bilddaten in eine scope.variable, damit sie in der View angezeigt werden kann.
      $scope.pictureUrl = "data:image/jpeg;base64," + imageData;
      //gleichzeitig werden die Bilddaten auch im lokalen Speicher abgelegt.
      localStorage.setItem("imgData", imageData);
    }, function (err) {
      // error
    });
  }

  //Buttons und ähnliche HTML elemente können nur scope Funktionen aufrufen. -> Diese möchte das Foto speichern
  $scope.sendPhoto = function () {
    sendData();
  }

  //Darin werden alle Variablen zu einem JSON zusammengefasst und abgeschickt.
  function sendData() {
    //An diese URL werden die Daten geschickt. ACHTUNG durch den Einsatz von Satellizer ist eine Tokenübergabe überflüssig. Dies geschieht im Hintergrund
    var url = "http://193.5.58.95/api/v1/tests";
    //Speicherung der Userid in eine lokale Variable
    var user_id = localStorage.getItem("userid");
    //Speicherung der img Daten in einer lokalen Variable
    var b64 = localStorage.getItem("imgData");

    console.log(lat);
    console.log(long);
    if((lat || long) == null){
      makeTextString("Geolocation ist noch nicht bereit. Haben Sie einen Moment Geduld");
      $state.go("tap.gallery");
    }

    //JSON wird mit allen nötigen Variablen aufgebaut.
    var output = {
      base64: b64,
      brand: selectedBrand,
      model: selectedModel,
      geoX: lat,
      geoY: long,
      user_id: user_id
    }

    //Bevor Daten abgeschickt werden, muss der User aktiv bestätigen dass er das will.
    var confirmPopup = $ionicPopup.confirm({
      title: 'Nice Picture',
      template: 'Do you want to upload this Picture?'
    });

    //Auswertung der Popup Entscheidung.
    confirmPopup.then(function (res) {
      if (res) {
        //Dies geschieht wenn der User zustimmt.
        $http.post(url, output).then(function (response) {
        });
      } else {
        //Dies geschieht wenn der User ablehnt.
        $scope.pictureUrl = 'http://placehold.it/300x300';
      }
      //Unabhängig der Entscheidung wird man zur Gallery weitergeleitet.
      $state.go("tab.gallery");

    });
  }

  //Dies Funktion aktualisiert die Location Daten.
  function getCoordiantes() {
    //optionen für den Location Service.
    var watchOptions = {
      timeout: 1000,
      enableHighAccuracy: false // may cause errors if true
    };

    $cordovaGeolocation
      .getCurrentPosition(watchOptions)
      .then(function (position) {
        lat = position.coords.latitude;
        long = position.coords.longitude;
      }, function (err) {
        // error
      });

    console.log(lat + " : " + long);
    //Abgefragt ob die Location Enabled ist. -> sonst erscheint das Popup und intervall wird angehalten.
    cordova.plugins.diagnostic.isLocationEnabled(function (enabled) {
      if (!enabled) {
        //interval wird abgebrochen
        clearInterval(intervalID);
        //Popup, dass nur mit eingeschaltenem Locationservice weitergearbeitet werden kann.
        showPopup();
        localStorage.setItem("lastRunFalse", true);
      }
    }, function (error) {
      console.error("The following error occurred: " + error);
    });
  }

  function showPopup() {
    //soll ein Popup anzeigen.
    var confirmPopup = $ionicPopup.confirm({
      title: 'Location Fehler',
      template: 'Die Positionierung muss eingeschalten werden'
    });

    confirmPopup.then(function (res) {
      if (res) {
        //der User möchte gerne den Locationservice einschalten. Der Default-OS Dialog erscheint.
        cordova.plugins.diagnostic.switchToLocationSettings();
        //nebensächlicher Interval startet. Dieser überprüft, ob der user die Location schon eingeschaltet hat.
        checkLocationStatusID = setInterval(nebenIntervall, 1000);
      } else {
        //Falls der User nicht die Location einschalten will, wird er zur Gallery weitergeleitet.
        $state.go("tab.gallery");
      }
    });
  }

  //Diese Funktion wird im nebensächlichen Interval aufgerufen.
  function nebenIntervall() {
    //Ist Location schon eingeschaltet?
    cordova.plugins.diagnostic.isLocationEnabled(function (enabled) {
      if (enabled) {
        //Falls dies stimmt, wird der nebensächliche Interval gestoppt und der Hautpsächliche nimmt seine arbeit wieder auf.
        clearInterval(checkLocationStatusID);
        intervalID = setInterval(getCoordiantes, 3000);
      }
    }, function (error) {
      console.error("The following error occurred: " + error);
    });
  }

//Diese Funktion erstellt schnell und unkompliziert die Toasts (Kleine infoboxes die kurz erscheinen und wieder verschwinden. )
  function makeText(long, lat) {
    $cordovaToast.showShortTop(long + " : " + lat)
      .then(function (success) {
        // success
      }, function (error) {
        // error
      });
  }

  //Diese Funktion erstellt schnell und unkompliziert die Toasts (Kleine infoboxes die kurz erscheinen und wieder verschwinden. )
  function makeTextString(msg) {
    $cordovaToast.showShortTop(msg)
      .then(function (success) {
        // success
      }, function (error) {
        // error
      });
  }

});

app.controller('GpsCtrl', function ($scope) {
  // console.log("im GPS controller");
})

app.controller('GalleryCtrl', function ($scope, $http) {

  $scope.urllisten = [];

  cordova.plugins.diagnostic.isLocationEnabled(function (enabled) {
    if (!enabled) {
      cordova.plugins.diagnostic.switchToLocationSettings();
    }
  }, function (error) {
    console.error("The following error occurred: " + error);
  });


//Diese Funktion wird bei jedem aufruf der View aufgeführt.
  $scope.$on('$ionicView.enter', function () {
    $scope.user = localStorage.getItem("username");
    bilderDownload();
  })

  function gibDatenaus(daten) {
    $scope.urllisten = [];
    var daten = daten;
    //console.log(daten);

    for (item in daten) {
      for (subItem in daten[item]) {
        $scope.urllisten.push(daten[item][subItem]);
       // console.log($scope.urllisten);
      }
    }
  }

  function bilderDownload() {
   // console.log("bilderdownload wird ausgeführt");
    var getUrl = "http://193.5.58.95/api/v1/tests";
    $scope.urllisten = [];


    $http.get(getUrl).success(function (data) {
      gibDatenaus(data);

      console.log(JSON.stringify(data));
    });
  }

  $scope.doRefresh = function () {
    var getUrl = "http://193.5.58.95/api/v1/tests";
    $http.get(getUrl)
      .success(function (newItems) {
        gibDatenaus(newItems);
      })
      .finally(function () {
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
      });
  };


});

app.controller('LoginCtrl', function ($scope, $http, $state, $cordovaToast, $auth) {
  var token;
  //proenginelogo
  $scope.pictureUrl = "img/icon_without_radius.jpg";
  var username;
  var password;
  var headers;

  $scope.logIn = function () {

    username = document.getElementById("username").value;
    password = document.getElementById("password").value;
    headers = {headers: {'Content-Type': 'application/json'}};
    var data = {
      username: username,
      email: username,
      password: password
    }

    $auth.login(data).then(function () {
      $http.get('http://193.5.58.95/api/v1/authenticate/user').success(function (resp) {
        console.log(resp);
        localStorage.setItem("username", resp.user.username);
        localStorage.setItem("userid", resp.user.id);
        $state.go("tab.gallery");
      }).error(function (err) {
        // showMessage("Login Fehler. Überprüfen sie die Anmeldedaten!");
        }
      )
    })


    function showMessage(text) {
      var message = text;
      $cordovaToast.showShortBottom(message).then(function (success) {
        // success
      }, function (error) {
        // error
      });
    }
  }
});


app.controller('RegisterCtrl', function ($scope, $http, $state) {

  $scope.pictureUrl = "img/icon_without_radius.jpg";
  var registerUrl = 'http://193.5.58.95/api/v1/authenticate/register'
  console.log("bin im register Controller");


  $scope.register = function () {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var mail = document.getElementById("mail").value;

    console.log("Eingaben :" + username + password + mail);
    var headers = {headers: {'Content-Type': 'application/json'}};
    var data = {
      username: username,
      email: mail,
      password: password
    }

    $http.post(registerUrl, data, headers).then(function (resp) {
      console.log(resp);
      //    console.log(resp.statusText + "status");
      //    console.log("Sry bro. falsche anmeldedaten");

      console.log(resp);
      if (resp.statusText === "OK") {
        $state.go("tab.upload");
      }
    }, function (fail) {
      console.log(fail);
    })

  }

});


app.controller('SettingCtrl', function ($scope, $cordovaGeolocation) {
/*

  var myVar = setInterval(getLocationUpdate, 1000);


  function showLocation(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    console.log("Latitude : " + latitude + " Longitude: " + longitude);
  }

  function errorHandler(err) {
    if (err.code == 1) {
      console.log("Error: Access is denied!");
    }

    else if (err.code == 2) {
      console.log("Error: Position is unavailable!");
    }
  }

  function getLocationUpdate() {
    console.log("geoLocationUpdate wird aufgerufen");
    console.log(navigator.geolocation);
    if (navigator.geolocation) {
      // timeout at 60000 milliseconds (60 seconds)
      var options = {timeout: 2000};
      geoLoc = navigator.geolocation;
      watchID = geoLoc.watchPosition(showLocation, errorHandler, options);
    }

    else {
      console.log("Sorry, browser does not support geolocation!");
    }
  }
*/

});
