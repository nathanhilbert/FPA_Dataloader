var modeler = angular.module( 'openspending.modeler', [
  'ui.router'
]);

modeler.config(function config( $stateProvider ) {
  $stateProvider.state('sourceform', {
    url: '/:dataset/source',
    views: {
      "main": {
        //controller: 'CubeOptionsCtrl',
        templateUrl: 'templates/modeler.tpl.html'
      }
    }
  })
  //edit an existing indicator form
  .state('sourceform_edit', {
    url: '/:dataset/source/:sourcename',
    views: {
      "main": {
        //controller: 'CubeOptionsCtrl',
        templateUrl: 'templates/modeler.tpl.html'
      }
    }
  });
});

modeler.controller( 'ModelerCtrl', function ModelerCtrl( $scope, $stateParams, $location, $http, validation ) {



  if ($stateParams.sourcename){
    $http.get('/api/3/datasets/' + $stateParams.datasetname + '/model/' + $stateParams.sourcename)
      .then(function(res){
        console.log(res);
        if (res.data){
          $scope.meta = res.data;
          //populate the rest of the data if it exists
          console.log(res.data);
          $scope.sourceexists = true;
          $scope.metavalid = true;
        }
        else{
          console.log("there was an error try again");
        }
      });
    //we are editing an existing one go get everything

  }
  else{
    $scope.sourceexists = false;
    // we creating a new one

      //let's populate everything with the defaults of the dataset model if they exist


      //$http.get('/api/3/datasets/' + $stateParams.datasetname + "/model");

  }


  $scope.save_meta = function() {

    // form validation
    //check that there are actually values
    //name must be unique

      //create a new one
      var dfd = $http.post('/api/3/datasets/' + $stateParams.datasetname + '/model' , $scope.meta);
      dfd.then(function(res) {
        //$location.path('/' + res.data.name + '/manage/meta');
        if (res.data.Success === true){
          //flash message
          $scope.sourceexists = true;
          $scope.metavalid = true;

        }
        else{
          //error message
          console.log(res);
        }
      });
    };




});
