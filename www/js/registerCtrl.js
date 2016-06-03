/**
 * Created by getspeed on 02.06.16.
 */


app.controller('RegisterCtrl', function ($scope, $http, $state, $cordovaToast,$ionicHistory) {

  $scope.pictureUrl = "img/icon_without_radius.jpg";
  var registerUrl = 'http://193.5.58.95/api/v1/authenticate/register'
  console.log("bin im register Controller");


  $scope.register = function () {
    var username = document.getElementById("reg_username").value;
    var password = document.getElementById("reg_password").value;
    var mail = document.getElementById("reg_mail").value;

    console.log("Eingaben :" + username + password + mail);
    var headers = {headers: {'Content-Type': 'application/json'}};
    var data = {
      username: username,
      email: mail,
      password: password
    }

    $http.post(registerUrl, data, headers).then(function (resp) {
      if (resp.statusText === "OK") {

        localStorage.setItem("reg_mail", mail);
        localStorage.setItem("reg_password", password);

        showMessage("Registrierung erfolgreich. Melden Sie sich an.");
        $ionicHistory.goBack();
      }
    }, function (fail) {
      console.log(fail);
    })
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
