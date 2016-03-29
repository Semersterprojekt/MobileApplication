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

//optionen für den Location Service.
  var watchOptions = {
    timeout: 1000,
    enableHighAccuracy: false // may cause errors if true
  };

  //Diese Funktion wird bei jedem aufruf der View aufgeführt.
  $scope.$on('$ionicView.enter', function () {

    $scope.pictureUrl = 'http://placehold.it/300x300';
  })


  //userposition wird immer wieder aufgerufen.
  var watch = $cordovaGeolocation.watchPosition(watchOptions);
  watch.then(
    null,
    function (err) {
      // error
    },
    function (position) {
      console.log("watchposition : " + position);
      lat = position.coords.latitude;
      long = position.coords.longitude;
    });


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
      sendPhoto(imageData);
    }, function (err) {
      // error
    });

  }

  function sendPhoto(image) {

    var url = "http://193.5.58.95/api/v1/tests?token=" + localStorage.getItem("token");

    var geoX;
    var geoY;
    var comment = "Hier steht der Kommentar drin";
    var user_id = localStorage.getItem("userid");
    var b64 = image;

    var output = {
      data: "text hier sollte daten sein",
      comment: comment,
      base64: b64,
      geoX: lat,
      geoY: long,
      user_id: user_id
    }

    var confirmPopup = $ionicPopup.confirm({
      title: 'Nice Picture',
      template: 'Do you want to upload this Picture?'
    });


    confirmPopup.then(function (res) {
      if (res) {
        $http.post(url, output, {headers: {'Content-Type': 'application/json'}})
          .then(function (response) {
            watch.clearWatch();
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


  $scope.init = function () {
    $scope.bilderDownload();
  }


  function gibDatenaus(daten) {
    var daten = daten;
    //console.log(daten);
    var urlListen = [];

    for (item in daten) {
      for (subItem in daten[item]) {
        $scope.urllisten.push(daten[item][subItem]);
        //console.log($scope.urllisten);
      }
    }
  }

  $scope.bilderDownload = function () {
    getUrl = "http://193.5.58.95/api/v1/tests?token=" + localStorage.getItem("token");
    $scope.urllisten = [];


    $http.get(getUrl).success(function (data) {
      gibDatenaus(data);

      //   console.log(data.data.img_path);
    });
  }

//Diese Funktion wird bei jedem aufruf der View aufgeführt.
  $scope.$on('$ionicView.enter', function () {
    $scope.bilderDownload();
    $scope.user = localStorage.getItem("user");

  })

});

app.controller('LoginCtrl', function ($scope, $http, $state, $cordovaToast) {
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
      showMessage("Login hat nicht funktioniert");
    });

  }


  function showMessage(text) {
    var message = text;
    $cordovaToast.showShortBottom(message).then(function (success) {
      // success
    }, function (error) {
      // error
    });
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


app.controller('SettingCtrl', function ($scope) {
  console.log()
});
