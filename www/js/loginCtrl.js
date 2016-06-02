/**
 * Created by getspeed on 02.06.16.
 */

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
