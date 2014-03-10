'use strict';



angular.module('a2App')
  .controller('GraphCtrl', function ($scope, CsvReaderService, KWGraphService, KWCarbonTrailService) {
    $scope.width = 500;
    $scope.height = 500;
    $scope.color = ['#3d3', '#33d','#a66','#6a6', '#66a','#2d2', '#23d','#a56','#5a6', '#56a'];
    $scope.pathDisplayState = [];
    // $scope.initialized = false;
    $scope.init = function(options) {
        // if ($scope.initialized)
        //     return;
        if (options.width !== undefined) {
            $scope.width = options.width;
            $scope.height = options.height;
        }
        if (options.type === 'service') {
            if(options.name === undefined)
                options.type = undefined;
            else {
                var service = KWCarbonTrailService;
                console.log('now service');
                console.log(service[options.name]);
                $scope.rawData = service[options.name];
                $scope.data = KWGraphService.generateLineGraph($scope.rawData, {width:$scope.width, height:$scope.height, accumulate:true});
                service.registerObserverCallback(options.name, function() {
                    console.log('refresh');
                    
                    $scope.data = KWGraphService.generateLineGraph(
                        $scope.rawData,
                        {
                            width: $scope.width,
                            height: $scope.height,
                            accumulate: true,
                            viewport_y_max: options.viewport_y_max,
                            viewport_y_scale: options.viewport_y_scale
                        }
                    );
                    console.log($scope.data);
                    showAllLines();
                    $scope.$apply();
                    
                });
                // $scope.x_label = $scope.data[0];
                if ($scope.data)
                    showAllLines();
            }
        }
        if ((options.type === 'csv') || (options.type === undefined)) {
            if(options.url === undefined) {
                options.url = 'http://localhost:9000/images/src.csv';
            }
            getDataFromCSV(options.url);
        }
        // $scope.initialized = true;
    };
    // $scope.init({});
    function showAllLines() {
        var i;
        for (i=0; i<$scope.data.paths.length; i++) {
            $scope.pathDisplayState[i] = true;
        }
    }
    function getDataFromCSV(url) {
        CsvReaderService.read(
            url,
            function(d) {
                $scope.data = KWGraphService.generateLineGraph(d, {width:$scope.width, height:$scope.height, accumulate:true});//getRenderData(d, $scope.width, $scope.height);
                $scope.x_label = d[0];
                if ($scope.data)
                    showAllLines();
            }
        );
    }
    $scope.togglePath = function (index) {
        return $scope.pathDisplayState[index] = ($scope.pathDisplayState[index] === true) ? false : true;
    }
    $scope.showPath = function (scope) {
        if ($scope.pathDisplayState[scope.path.label])
            return $scope.pathDisplayState[scope.path.label];
        else
            return 1;
    }
    // function getRenderData(data, width, height) {
    //     var i, j;
        
    //     // Find extreme value for scaling.
    //     var max = -999999;
    //     var min = 999999;

        
    //     for (i=1; i<data.length; i++)
    //     {
    //         for (j=1; j<data[i].length; j++)
    //         {
    //             var d = parseFloat(data[i][j]);
    //             max = (d > max) ? d: max;
    //             min = (d < min) ? d: min;
    //         }
    //     }
    //     var span = max-min;
    //     var ratio = {x: span/(width-100), y:span/(height-100)};

        
    //     // time-based
    //     var renderData = [];
    //     var label_x_coord = [];
    //     var accumulated_prev_y = new Array(data[0].length);
    //         for (j=1; j<data[0].length; j++)
    //         {
    //             accumulated_prev_y[j] = 0;
    //             var item_no = j - 1;
    //             var item_x = item_no * width/(data[0].length - 1);
    //             label_x_coord.push(item_x);
    //         }
    //     for (i=1; i<data.length; i++)
    //     {
    //         var row = [];
    //         for (j=1; j<data[i].length; j++)
    //         {
    //             var item_no = j - 1;
    //             var item_x = item_no * width/(data[i].length - 1);

    //             var scaled_y = height - data[i][j]/ratio.y;
    //             var accumulated_y = height - (accumulated_prev_y[j] + data[i][j]/ratio.y);
    //             accumulated_prev_y[j] += data[i][j]/ratio.y;
    //             row.push([item_x, scaled_y]);
                
    //         }
    //         renderData.push(row);
    //     }

    //     var pathData = [];
    //     for (i=0; i<renderData.length; i++)
    //     {
    //         var row = [];
    //         for (j=0; j<renderData[i].length; j++)
    //         {
    //             row.push(renderData[i][j].join(' '));
    //         }
    //         pathData.push({label: data[i+1][0], d:'M ' + row.join(' L ')});
    //     }


    //     var label_y_coord = [];
    //     var y_label = [];

    //     var y_label_scale = 200;
    //     for (i=0; i < height*ratio.y; i+=y_label_scale) {
    //         var scaled_value = i/ratio.y;
    //         label_y_coord.push(height - scaled_value);
    //         y_label.push(i);
    //     }
        
    //     return {
    //         paths:pathData,
    //         x_label:data[0].slice(1,data[0].length),
    //         y_label:y_label,
    //         label_x_coord: label_x_coord,
    //         label_y_coord: label_y_coord
    //     };
    // }
  });
