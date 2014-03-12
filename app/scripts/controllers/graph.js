'use strict';



angular.module('a2App')
  .controller('GraphCtrl', function ($scope, CsvReaderService, KWGraphService, KWCarbonTrailService) {
    $scope.width = 500;
    $scope.height = 500;
    $scope.color = ['#07EFC3', '#13F6FF', '#FFAD0D', '#0077F6', '#EA2E49','#a66','#6a6', '#66a','#2d2', '#23d','#a56','#5a6', '#56a'];
    $scope.showGuide = true;
    $scope.pathValues = [];
    $scope.pathDisplayState = [];
    $scope.service = KWCarbonTrailService;
    $scope.init = function(options) {
        if (options.width !== undefined) {
            $scope.width = options.width;
            $scope.height = options.height;
        }
        if (options.type === 'service') {
            if(options.name === undefined)
                options.type = undefined;
            else {
                var service = KWCarbonTrailService;
                $scope.rawData = service[options.name];
                $scope.data = KWGraphService.generateLineGraph($scope.rawData, {width:$scope.width, height:$scope.height, accumulate:false});
                if (options.shadow_name) {
                    service.registerObserverCallback(options.shadow_name, function() {
                        $scope.shadowRawData = service[options.shadow_name];
                        $scope.shadowData = KWGraphService.generateLineGraph(
                            $scope.shadowRawData,
                            {
                                width: $scope.width,
                                height: $scope.height,
                                accumulate:false,
                                viewport_y_max: options.viewport_y_max,
                                viewport_y_scale: options.viewport_y_scale
                            }
                        );
                        $scope.$apply();
                    });
                }
                service.registerObserverCallback(options.name, function() {
                    $scope.data = KWGraphService.generateLineGraph(
                        $scope.rawData,
                        {
                            width: $scope.width,
                            height: $scope.height,
                            accumulate:false,
                            viewport_y_max: options.viewport_y_max,
                            viewport_y_scale: options.viewport_y_scale
                        }
                    );
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
                options.url = 'images/src.csv';
            }
            getDataFromCSV(options.url);
        }
    };

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
                $scope.rawData = d;
                $scope.data = KWGraphService.generateLineGraph(d, {width:$scope.width, height:$scope.height, accumulate:false});//getRenderData(d, $scope.width, $scope.height);
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
    $scope.mousemove = function(event) {
        var i;
        var closet_column_index = -1;
        var x_distance = 999999;
        var x_columns = $scope.data.label_x_coord;
        for (i=0; i<x_columns.length; i++) {
            var d = Math.abs((event.offsetX-30) - x_columns[i]);
            if (d < x_distance) {
                x_distance =  d;
                closet_column_index =  i;
            }
        }
        var graphID = jQuery(event.currentTarget).parents('.graph')[0].id;
        // var guide = angular.element('#hover-guide');
        // guide.attr('x1', x_columns[closet_column_index]-25);
        // guide.attr('x2', x_columns[closet_column_index]-25);

        var data = $scope.data.renderData;
        
        var tooltip = angular.element('#'+graphID+' .tooltip');
        tooltip.css('top',event.screenY-80);
        tooltip.css('left',x_columns[closet_column_index]+140);
        tooltip.html($scope.data.x_label[closet_column_index]);
        tooltip.css('visibility', 'visible');
        for (i=0;i<data.length; i++) {
            var dot = angular.element('#'+graphID+' #hover-dot-'+i);
            var x = data[i][closet_column_index][0]+30;
            if (closet_column_index === data[i].length - 1)
                x-=4;
            dot.attr('cx',x);
            dot.attr('cy',data[i][closet_column_index][1]);
            dot.css('visibility', 'visible');
        }
        $scope.pathValues.length = 0;
        for (i=1; i<$scope.rawData.length; i++)
            $scope.pathValues.push($scope.rawData[i][closet_column_index+1]);
    }
    $scope.mouseenter = function(event) {
        // FIXME: this never fired
        $scope.showGuide = true;
        console.log('enter');
    };
    $scope.mouseleave = function(event) {
        // FIXME: this never fired
        $scope.showGuide = false;
        console.log('leave');
    };
});
