

app.controller('AccountCtrl', function ($scope) {
  $scope.settings = {
    enableFriends: true
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
