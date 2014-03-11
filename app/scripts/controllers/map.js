'use strict';
var i, j;
angular.module('a2App')
  .controller('MapCtrl', function ($scope, CsvReaderService, KWCarbonTrailService) {
    var service = KWCarbonTrailService;
    $scope.year = "1995";
    $scope.slider_options = {from:1995, to:2010, step:1};

    $scope.hoverUsState = false;
    $scope.updateMapByYear = function() {
        if ($scope.data!=null) {
            $scope.renderData = service.filterDataByYear($scope.data, $scope.year);
        }
        $scope.renderMap();
    }
    $scope.$watch('year', $scope.updateMapByYear, true);
    $scope.data = null;
    CsvReaderService.read(
        'http://localhost:9000/images/map_src.csv',
        function(d) {
            $scope.data = d;
            $scope.updateMapByYear();
        }
    );

    $scope.highlightedState = null;
    function applyCssToState(obj, property, value) {
        var state_text = obj[0].id;
        if (state_text === 'MI') {
            obj.children().each(function() {
                jQuery(this).css(property, value);
            })
        }
        else {
            obj.css(property, value);
        }
    }
    function assignTextToState(text_selector, state) {
        var text_element = jQuery($scope.svg).children(text_selector);
        text_element.attr('visibility', 'visible');
        var box = state.getBoundingClientRect();
        text_element.attr('x', box.left+box.width);
        text_element.attr('y', box.top+box.height/2);
        text_element.html(state.id);
    }

    function sendStateChanged() {
        if ($scope.highlightedState && $scope.data) {
            service.onStateChanged($scope.data, $scope.highlightedState.id.toString());
        }
    }

    $scope.renderMap = function() {
        jQuery($scope.svg).children('.state').each(function(){
            console.log(parseInt($scope.renderData[this.id]));
            var value = 240-(parseInt($scope.renderData[this.id]*240/300));
            jQuery(this).attr('fill', 'rgb('+value+','+value+','+value+')');
            jQuery(this).attr('stroke', 'white');
            jQuery(this).css('z-index', '100');
            jQuery(this).click(
                function(event) {
                    var prev_state = jQuery($scope.highlightedState);
                    if (prev_state.length > 0) {
                        prev_state.attr('filter', '');
                        applyCssToState(prev_state, 'stroke-width', '0.75');
                    }
                    var obj = jQuery(event.currentTarget);
                    obj.attr('filter', 'url(#drop-shadow)');
                    applyCssToState(obj, 'stroke-width', '3');

                    assignTextToState('#highlighted-state-name', event.currentTarget);
                    $scope.highlightedState = event.currentTarget;
                    $scope.svg.appendChild($scope.highlightedState);
                    sendStateChanged();
            });
            jQuery(this).hover(
                function(event) {
                    var text_element = jQuery($scope.svg).children('#state-name');
                    text_element.bind('hover', this);
                    $scope.svg.appendChild(event.currentTarget);
                    $scope.svg.appendChild($scope.highlightedState);
                    
                    $scope.svg.appendChild(jQuery($scope.svg).children('#highlighted-state-name')[0]);
                    $scope.svg.appendChild(text_element[0]);
                    
                    // #2FBCFF #4287D1 22DCFF 38CFFF
                    var obj = jQuery(event.currentTarget);
                    applyCssToState(obj, 'stroke', '#13F6FF');
                    applyCssToState(obj, 'stroke-width', '2');

                    assignTextToState('#state-name', event.currentTarget);

                    $scope.hoverUsState = true;
                },
                function(event) {
                    var obj = jQuery(event.currentTarget);
                    applyCssToState(obj, 'stroke', 'white');
                    applyCssToState(obj, 'stroke-width', '1');

                    var text_element = jQuery($scope.svg).children('#state-name');
                    text_element.attr('visibility', 'hidden');

                    $scope.hoverUsState = false;
                }
            );
        });
    }
    
    
  });
function onMapLoaded() {
    var svg = document.getElementById("map").contentWindow.document.getElementById("svg");
    // Storing svg elements back to scope.
    var scope = angular.element($("#map-container")).scope();
    scope.$apply(function(){
        scope.svg = svg;
    })
}