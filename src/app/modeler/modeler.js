var modeler = angular.module( 'openspending.modeler', [
  'ui.router'
]);

modeler.config(function config( $stateProvider ) {
  $stateProvider.state('sourceform', {
    url: '/:datasetname/source',
    views: {
      "main": {
        //controller: 'CubeOptionsCtrl',
        templateUrl: 'templates/modeler.tpl.html'
      }
    }
  })
  //edit an existing indicator form
  .state('sourceform_edit', {
    url: '/:datasetname/source/:sourcename',
    views: {
      "main": {
        //controller: 'CubeOptionsCtrl',
        templateUrl: 'templates/modeler.tpl.html'
      }
    }
  });
});

modeler.controller( 'ModelerCtrl', function ModelerCtrl( $scope, $stateParams, $location, $http, $compile, validation) {

  //placeholder for options should be done in the Flask template
  $scope.reference = {"prefuncoptions" :[]};

  //get the preprocessors from the references
  $http.get('/api/3/preprocessors')
    .then(function(res){
      $scope.reference.prefuncoptions = res.data; 
    });



  /*get the source information from the API*/

  $http.get('/api/3/datasets/' + $stateParams.datasetname + '/model')
    .then(function(res){
      if (res.data){
        if (res.data === false){
          $scope.sourceexists = false;
        }
        else{
          $scope.meta = res.data;
          //populate the rest of the data if it exists
          $scope.sourceexists = true;
          $scope.metavalid = true;
          $scope.dataloaded = true;
          $(".model-columns").html(
            $compile(
              "<div class='modeler-choices' modeler-data></div>"
            )($scope)
          );
        }

      }
      else{
        console.log("there was an error in getting the source");
      }
    });
    //we are editing an existing one go get everything

  



  $scope.save_meta = function() {


    var handleresponse = function(res) {
        //$location.path('/' + res.data.name + '/manage/meta');
        if (res.data){
          $scope.meta = res.data;
          //populate the rest of the data if it exists
          $scope.sourceexists = true;
          $scope.metavalid = true;
          $scope.dataloaded = true;
          $location.path("/" + $scope.meta.dataset + "/source/" + $scope.meta.id);
          $(".model-columns").html(
            $compile(
              "<div class='modeler-choices' modeler-data></div>"
            )($scope)
          );
        }
        else{
          //error message
          console.log(res);
        }
      };

    // form validation
    //check that there are actually values
    //name must be unique

    if ($('#sourcefile')[0].files.length == 1){

      //doesn't work in IE9 or less
       var form_data = new FormData();
       //only one file
       form_data.append("sourcefile", $('#sourcefile')[0].files[0]);
       form_data.append("name", $scope.meta.name);


        $.ajax({
            type: 'POST',
            url: '/api/3/datasets/' + $stateParams.datasetname + '/model',
            data: form_data,
            contentType: false,
            cache: false,
            processData: false,
            async: false,
            success: handleresponse
        });
    }
    else if ($scope.meta.url !== ""){
        $.ajax({
            type: 'POST',
            url: '/api/3/datasets/' + $stateParams.datasetname + '/model',
            data: {'name': $scope.meta.name, 'url': $scope.meta.url},
            contentType: false,
            cache: false,
            processData: false,
            async: false,
            success: handleresponse
        });

    }
    else{
      console.log("You must provide a URL or file");
    }


      //create a new one

    };



  $scope.apply_meta_default = function(){
      var dfd = $http.get('/api/3/datasets/' + $stateParams.datasetname + '/applymodel/' + $scope.meta.name );
      dfd.then(function(res){
        if(res.data){
          $scope.meta = res.data;
          //populate the rest of the data if it exists
          $scope.sourceexists = true;
          $scope.metavalid = true;
          $scope.dataloaded = true;
          $location.path("/" + $scope.meta.dataset + "/source/" + $scope.meta.name);
          $(".model-columns").html(
            $compile(
              "<div class='modeler-choices' modeler-data></div>"
            )($scope)
          );
        }
        else{
          console.log(res);
        }
      });

    //need to return meta and the other
  };

  $scope.loadsuccess = false;



});

// not really necessary
// could do an src include instead
modeler.directive('openRefine', function () {
        return {
          restrict: 'A',
          templateUrl: 'templates/openrefine.tpl.html'
          //transclude: true,
          // link: function postLink(scope, element, attrs) {

          // }
        };
      });

modeler.directive('openRefineFetch', function ($http) {
        return {
          restrict: 'A',
          template: '<button>Fetch OR Instructions</button>',
          //transclude: true,
          link: function postLink(scope, element, attrs) {
         
            // //taking the same scope as parent
            element.on("click", function () {
              if (scope.meta.ORid){
                $http.get('/api/3/datasets/' + scope.meta.dataset + '/model/' + scope.meta.name + '/ORoperations')
                  .then(function(res){
                    if (res.data){
                      scope.meta.ORoperations = angular.toJson(res.data);
                      scope.updateModel();
                    }
                    else{
                      console.log("error in getting the openrefine");
                    }

                  });
              }
            });

          }
        };
      });



var globalness = null;


modeler.directive('modelerData', function ($http) {
        return {
          restrict: 'A',
          templateUrl: 'templates/dataModeler.tpl.html',
          //transclude: true,
          link: function postLink(scope, element, attrs) {
            if (!scope.meta){
              console.log("there was an error");
              return;
            }

            globalness = scope;

            scope.updateModel = function(){
                $http.get('/api/3/datasets/' + scope.meta.dataset + '/model/' + scope.meta.name + '/fields')
                .then(function(res){
                  if (res.data){
                    var tempcolumns = [];
                    jQuery.each(res.data.columns, function(i,columnval){
                      tempcolumns.push({"label":columnval, "code":columnval});
                    });
                    scope.reference.datacolumns = tempcolumns;

                    scope.modeler = res.data.modeler;
                  }
                  else{
                    console.log("error in getting the openrefine");
                  }

                });
            };
            scope.updateModel();
          }
        };
      });



var fielchecker = null;

modeler.directive('modelFieldChecker', function($http){
        return {
          restrict: 'A',
          template: '<button>Check me</button><div style="color:red">{{message}}</div>',
          scope: false,
          link: function postLink(scope, element, attrs) {
            scope.message = "";
            // wires are here for long polling
              fielchecker = scope;
              scope.columnkey = attrs['columname'];

              //scope.polling = false;
              // if (attrs['columnkey'] == "country_level0" || attrs['columnkey'] == "time"){

              //   //enter the checker
              // }
              // else{
              //   console.log("check is not used for these fields.. should hide them");
              // }
              element.on("click", function () {
                // var poller = function() {
                //   $http.get('/api/3/datasets/' + scope.$parent.meta.dataset + '/model/' + scope.$parent.meta.name + '/fieldcheck/' + scope.columnkey).then(function(res) {
                //     console.log(res);
                //     if (! scope.polling ){
                //       $timeout(poller, 2000);
                //     }
                //     //if something
                //   });      
                // };
                $http.post('/api/3/datasets/' + scope.$parent.meta.dataset + '/model/' + scope.$parent.meta.name + '/fieldcheck/' + scope.columnkey, 
                      {"columnval": scope.columnvalue.column})
                      .then(function(res) {
                        if (res.data.Success){
                          scope.loadsuccess = true;
                          scope.message = "Data is now loaded";
                        }
                        else{
                          scope.message = res.data.message + res.data.errors;
                        }
                          //scope.polling = false;
                          //when this comes back turn off

                        });  
                //poller();

              });

          }
        };
});



modeler.directive('modelSubmit', function ($http) {
        return {
          restrict: 'A',
          template: '<div style="red">{{ submitmessage }}</div><button>Submit Model</button>',
          //transclude: true,
          link: function postLink(scope, element, attrs) {
            scope.submitmessage = "";
         
            // //taking the same scope as parent
            element.on("click", function () {
              //validate that everything is there any ready to go with the column names
                $http.post('/api/3/datasets/' + scope.meta.dataset + '/model/' + scope.meta.name, 
                      {"meta": scope.meta, "modeler": scope.modeler})
                      .then(function(res) {
                        if (res.data.Success){
                          scope.submitmessage = "everything is ok";
                          scope.loadsuccess = true;
                        }
                        else{
                          scope.submitmessage = res.data.message + res.data.errors;
                        }
                          //scope.polling = false;
                          //when this comes back turn off

                        });  

            });

          }
        };
      });


modeler.directive('modelOrgSubmit', function ($http) {
        return {
          restrict: 'A',
          template: '<div style="red">{{ orgmessage }}</div><button>Save as Default for Org</button>',
          //transclude: true,
          link: function postLink(scope, element, attrs) {
            scope.orgmessage = "";
         
            // //taking the same scope as parent
            element.on("click", function () {
              //validate that everything is there any ready to go with the column names
                $http.post('/api/3/datasets/' + scope.meta.dataset + '/applymodel/' + scope.meta.name, 
                      {"meta": scope.meta, "modeler": scope.modeler})
                      .then(function(res) {
                        if (res.data.Success){
                          scope.orgmessage = "everything is ok";
                        }
                        else{
                          scope.orgmessage = res.data.message + res.data.errors;
                        }
                          //scope.polling = false;
                          //when this comes back turn off

                        });  

            });

          }
        };
      });
