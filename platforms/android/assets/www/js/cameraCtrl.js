/**
 * Created by getspeed on 02.06.16.
 */

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
    if ((lat || long) == null) {
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

  //Diese Funktion wird im nebensächlici hen Interval aufgerufen.
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
