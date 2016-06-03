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

  localStorage.setItem("reg_mail", "");
  localStorage.setItem("reg_password", "");

  //Der RegisterCtrl schreibt die mail und password daten in den Localstorage.
  $scope.$on('$ionicView.enter', function () {
    document.getElementById("username").value = localStorage.getItem("reg_mail");
    document.getElementById("password").value = localStorage.getItem("reg_password");
  });

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

        localStorage.setItem("reg_mail", "");
        localStorage.setItem("reg_password", "");

        $state.go("tab.gallery");
      }).error(function (err) {
           showMessage("Login Fehler. Überprüfen sie die Anmeldedaten!");
        console.log("Fehler");
        console.log(err);
        }
      )
    }, function (err) {
      showMessage(err.statusText);
    });


    function showMessage(text) {
      var message = text;
      $cordovaToast.showShortBottom(message).then(function (success) {
        // success
      }, function (error) {
        // error
      });
    }
  }

  $scope.goToRegister = function(){
    $state.go('register');
  }
});
