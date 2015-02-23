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

modeler.controller( 'ModelerCtrl', function ModelerCtrl( $scope, $stateParams, $location, $http, $compile, validation ) {

  //placeholder for options should be done in the Flask template
  $scope.reference = {"prefuncoptions" : [{
      "code": "json_to_csv", "label": "JSON to CSV"
    },
    {
      "code": "parse_xml_to_csv", "label": "XML to CSV"
    }]
  };


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
          $scope.dataloaded = true;
          $(".model-columns").html(
            $compile(
              "<div class='modeler-choices' modeler-data></div>"
            )($scope)
          );
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
          $scope.dataloaded = true;
          $(".model-columns").append("<div modeler-data></div>");

        }
        else{
          //error message
          console.log(res);
        }
      });
    };



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
            console.log("did this");
            if (!scope.meta){
              console.log("there was an error");
              return;
            }

            globalness = scope;

            $http.get('/api/3/datasets/' + scope.meta.dataset + '/model/' + scope.meta.name + '/fields')
              .then(function(res){
                if (res.data){
                  var tempcolumns = [];
                  jQuery.each(res.data, function(i,columnval){
                    console.log(columnval);
                    tempcolumns.push({"label":columnval, "code":columnval});
                  });

                  scope.reference.datacolumns = tempcolumns;

                              /*modeler stuff here*/
                  scope.modeler = {"country_level0": {"column":null, "label":null, "description":null},
                                    "time": {"column":null, "label":null, "description":null},
                                    "indicatorvalue": {"column":null, "label":null, "description":null}
                                    };
                }
                else{
                  console.log("error in getting the openrefine");
                }

              });
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
            scope.message = "No Message";
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
                          scope.message = "everything is ok";
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

