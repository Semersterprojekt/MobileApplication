/**
 * Created by getspeed on 02.06.16.
 */

app.controller('GalleryCtrl', function ($scope, $http) {

  $scope.urllisten = [];

  cordova.plugins.diagnostic.isLocationEnabled(function (enabled) {
    if (!enabled) {
      cordova.plugins.diagnostic.switchToLocationSettings();
    }
  }, function (error) {
    console.error("The following error occurred: " + error);
  });

  setInterval(function(){
    var getUrl = "http://193.5.58.95/api/v1/tests";
    $http.get(getUrl)
      .success(function (newItems) {
        gibDatenaus(newItems);
      })
      .finally(function () {
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
      });
  }, 5000)

//Diese Funktion wird bei jedem aufruf der View aufgeführt.
  $scope.$on('$ionicView.enter', function () {
    $scope.username = localStorage.getItem("username");
    bilderDownload();
  })



  function gibDatenaus(daten) {
    $scope.urllisten = [];
    var daten = daten;

    for (item in daten) {
      for (subItem in daten[item]) {
        $scope.urllisten.push(daten[item][subItem]);
      }
    }
  }

  function bilderDownload() {
    // console.log("bilderdownload wird ausgeführt");
    var getUrl = "http://193.5.58.95/api/v1/tests";
    $scope.urllisten = [];


    $http.get(getUrl).success(function (data) {
      gibDatenaus(data);
    });
  }



});
