var app = angular.module('starter.controllers', ['ionic']);

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
  $scope.remove = function(chat) {
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


app.controller('CameraCtrl', function ($scope, $cordovaCamera, $http, $ionicPopup) {

  $scope.pictureUrl = 'http://placehold.it/300x300';

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

    var url = "http://193.5.58.95/api/v1/tests";

    var data = "Hier stehen die Daten drin";
    var comment = "Hier steht der Kommentar drin";
    var b64 = image;

    var output = {
      data: data,
      comment: comment,
      base64: b64
    }

    var confirmPopup = $ionicPopup.confirm({
      title: 'Nice Picture',
      template: 'Do you want to upload this Picture?'
    });


    confirmPopup.then(function (res) {
      if (res) {
        $http.post(url, output, {headers: {'Content-Type': 'application/json'}})
          .then(function (response) {
          });
      } else {
        //der user hat das Bild verworfen.
        $scope.pictureUrl = 'http://placehold.it/300x300';
      }
    });


  };


});
