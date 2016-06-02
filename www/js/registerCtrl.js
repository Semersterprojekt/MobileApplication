/**
 * Created by getspeed on 02.06.16.
 */


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
