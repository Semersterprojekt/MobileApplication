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


app.controller('CameraCtrl', function ($scope, $cordovaCamera, $http, $ionicPopup, $cordovaGeolocation, $state) {

  $scope.pictureUrl = 'http://placehold.it/300x300';
  //Longitude und Latitude Variablen, die immer wieder überschrieben werden.
  var lat;
  var long;
  var watch;

  var carQueryUrl = "http://www.carqueryapi.com/api/0.3/?callback=JSON_CALLBACK&";
  var selectedBrand = "";
  var selectedModel = "";

//optionen für den Location Service.
  var watchOptions = {
    timeout: 1000,
    enableHighAccuracy: false // may cause errors if true
  };

  //Diese Funktion wird bei jedem aufruf der View aufgeführt.
  $scope.$on('$ionicView.enter', function () {
    //userposition wird immer wieder aufgerufen.
    $scope.pictureUrl = 'http://placehold.it/300x300';
    loadBrandSelector();
  })


  //userposition wird immer wieder aufgerufen.
  watch = $cordovaGeolocation.watchPosition(watchOptions);
  watch.then(
    null,
    function (err) {
      // error
    },
    function (position) {
      console.log(position.coords.latitude);
      lat = position.coords.latitude;
      console.log(position.coords.longitude);
      long = position.coords.longitude;
    });


  $scope.selectedBrand = function (brand) {
    console.log("es wurde " + brand);
    selectedBrand = "";
    selectedBrand = brand;
  }


  $scope.selectedModel = function (model) {
    console.log("es wurde " + model);
    selectedModel = "";
    selectedModel = model;
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
      targetWidth: 200,
      targetHeight: 200,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    $cordovaCamera.getPicture(options).then(function (imageData) {

      $scope.pictureUrl = "data:image/jpeg;base64," + imageData;
      localStorage.setItem("imgData", imageData);
    }, function (err) {
      // error
    });
  }

  function loadBrandSelector(){
    $scope.brands = [];
    var cmd = "cmd=getMakes";
    $http.jsonp(carQueryUrl + cmd).success(function (resp) {
      storebrands(resp);
    }).error(function (err) {
      makeToast("Beim laden der Auto's ist etwas schiefgegangen.");
    })
  }

  function storebrands(object) {
    for (var i = 0; i < object.Makes.length; i++) {
      $scope.brands.push({title: object.Makes[i].make_display, id : object.Makes[i].make_id});
    }
  }

  $scope.loadModelSelector = function(make){
    console.log("im Loadmodelselector mit der marke " + make);
    $scope.models = [];
    var cmd = "cmd=getModels&make=" + make;
    $http.jsonp(carQueryUrl + cmd).success(function (resp) {
      storemodels(resp);
    }).error(function (err) {
      makeToast("Beim laden der Auto's ist etwas schiefgegangen.");
    })

  }

  function storemodels(object) {
    for (var i = 0; i < object.Models.length; i++) {
      $scope.models.push({title: object.Models[i].model_name, id: object.Models[i].model_make_id});
    }
  }

  $scope.sendPhoto = function () {
    sendData();
  }

  function sendData() {
    console.log("sende Foto wurde aufgerufen");

    var url = "http://193.5.58.95/api/v1/tests";


    var user_id = localStorage.getItem("userid");
    var b64 = localStorage.getItem("imgData");


    var output = {
      base64: b64,
      brand: selectedBrand,
      model: selectedModel,
      geoX: lat,
      geoY: long,
      user_id: user_id
    }

    console.log(JSON.stringify(output));

    var confirmPopup = $ionicPopup.confirm({
      title: 'Nice Picture',
      template: 'Do you want to upload this Picture?'
    });


    confirmPopup.then(function (res) {
      if (res) {

        $http.post(url, output).then(function (response) {
            watch.clearWatch();
          console.log(JSON.stringify(response));
          });
      } else {
        //der user hat das Bild verworfen.
        $scope.pictureUrl = 'http://placehold.it/300x300';
      }
      $state.go("tab.gallery");

    });
  }


});

app.controller('GpsCtrl', function ($scope) {
  // console.log("im GPS controller");
})

app.controller('GalleryCtrl', function ($scope, $http) {

  $scope.urllisten = [];


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
        console.log($scope.urllisten);
      }
    }
  }

  function bilderDownload() {
    console.log("bilderdownload wird ausgeführt");
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
  var loginUrl = 'http://193.5.58.95/api/v1/authenticate';
  var getUserInfoUrl = 'http://193.5.58.95/api/v1/authenticate/user?token=';
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
    /*
     $http.post(loginUrl, data, headers).then(function (resp) {
     console.log(resp);

     if (resp.status == 200) {
     //speicherung des Tokens in einer Session
     $scope.token = resp.data.token;
     localStorage.setItem("token", $scope.token);
     $http.get(getUserInfoUrl + localStorage.getItem("token"), headers).then(function (resp) {
     localStorage.setItem("userid", resp.data.user.id);
     localStorage.setItem("user", resp.data.user.username);
     })
     $state.go("tab.upload");
     }


     }, function (fail) {
     console.log(fail);
     //showMessage("Login hat nicht funktioniert");
     });
     */
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

  $scope.test = function () {
    var watchId = navigator.geolocation.watchPosition(geolocationSuccess,
      [geolocationError],
      [geolocationOptions]);

  }
});
