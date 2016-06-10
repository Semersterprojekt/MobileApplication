/**
 * Created by getspeed on 02.06.16.
 */


app.controller('RegisterCtrl', function ($scope, $http, $state, $cordovaToast,$ionicHistory) {

  //Der Pfad, wo das Profilbild ist.
  $scope.pictureUrl = "img/icon_without_radius.jpg";
  //Url um einen neuen User zu registrieren.
  var registerUrl = 'http://193.5.58.95/api/v1/authenticate/register'

  $scope.register = function () {
    //Werte werden aus den Inputfelder ausgelesen.
    var username = document.getElementById("reg_username").value;
    var password = document.getElementById("reg_password").value;
    var mail = document.getElementById("reg_mail").value;

    //Für Debuggingzwecken, um zu überprüfen, ob die Eingaben korrekt weitergeleitet werden.
    console.log("Eingaben :" + username + password + mail);
    //Header für die HTTP übertragung - mittlerweile sinnlos.
    var headers = {headers: {'Content-Type': 'application/json'}};
    //Die Daten, die über die Anfrage übermittelt werden.
    var data = {
      username: username,
      email: mail,
      password: password
    }

    //übermittlungsprozess.
    $http.post(registerUrl, data, headers).then(function (resp) {
      //Im Falle einer erfolgreichen Registration, werden die Daten gespeichert un eine ein Popup erscheint.
      if (resp.statusText === "OK") {
        localStorage.setItem("reg_mail", mail);
        localStorage.setItem("reg_password", password);
        showMessage("Registrierung erfolgreich. Melden Sie sich an.");

        //Es wird wieder zurück zur Loginview navigiert.
        $ionicHistory.goBack();
      }
    }, function (fail) {
      //Im Fehlerfall, wird in der Konsole der Fehler angezeit. 
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
