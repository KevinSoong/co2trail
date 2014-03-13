'use strict';
angular.module('a2App', [
  'ngRoute',
  'ngSlider',
  'ui.bootstrap'
]).config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    }).when('/graph', {
      templateUrl: 'views/graph.html',
      controller: 'GraphCtrl'
    }).when('/map', {
      templateUrl: 'views/map.html',
      controller: 'MapCtrl'
    }).otherwise({ redirectTo: '/' });
  }
]);
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray(strData, strDelimiter) {
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = strDelimiter || ',';
  // Create a regular expression to parse the CSV values.
  var objPattern = new RegExp('(\\' + strDelimiter + '|\\r?\\n|\\r|^)' + '(?:"([^"]*(?:""[^"]*)*)"|' + '([^"\\' + strDelimiter + '\\r\\n]*))', 'gi');
  // Create an array to hold our data. Give the array
  // a default empty first row.
  var arrData = [[]];
  // Create an array to hold our individual pattern
  // matching groups.
  var arrMatches = null;
  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while (arrMatches = objPattern.exec(strData)) {
    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[1];
    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (strMatchedDelimiter.length && strMatchedDelimiter != strDelimiter) {
      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push([]);
    }
    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[2]) {
      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      var strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
    } else {
      // We found a non-quoted value.
      var strMatchedValue = arrMatches[3];
    }
    // Now that we have our value string, let's add
    // it to the data array.
    arrData[arrData.length - 1].push(strMatchedValue);
  }
  // Return the parsed data.
  return arrData;
}
'use strict';
angular.module('a2App').controller('MainCtrl', [
  '$scope',
  function ($scope) {
  }
]);
'use strict';
angular.module('a2App').controller('GraphCtrl', [
  '$scope',
  'CsvReaderService',
  'KWGraphService',
  'KWCarbonTrailService',
  function ($scope, CsvReaderService, KWGraphService, KWCarbonTrailService) {
    $scope.width = 500;
    $scope.height = 500;
    $scope.color = [
      '#07EFC3',
      '#13F6FF',
      '#FFAD0D',
      '#0077F6',
      '#EA2E49',
      '#a66',
      '#6a6',
      '#66a',
      '#2d2',
      '#23d',
      '#a56',
      '#5a6',
      '#56a'
    ];
    $scope.showGuide = true;
    $scope.pathValues = [];
    $scope.pathDisplayState = [];
    $scope.service = KWCarbonTrailService;
    $scope.init = function (options) {
      if (options.width !== undefined) {
        $scope.width = options.width;
        $scope.height = options.height;
      }
      if (options.type === 'service') {
        if (options.name === undefined)
          options.type = undefined;
        else {
          var service = KWCarbonTrailService;
          $scope.rawData = service[options.name];
          $scope.data = KWGraphService.generateLineGraph($scope.rawData, {
            width: $scope.width,
            height: $scope.height,
            accumulate: false
          });
          if (options.shadow_name) {
            service.registerObserverCallback(options.shadow_name, function () {
              $scope.shadowRawData = service[options.shadow_name];
              $scope.shadowData = KWGraphService.generateLineGraph($scope.shadowRawData, {
                width: $scope.width,
                height: $scope.height,
                accumulate: false,
                viewport_y_max: options.viewport_y_max,
                viewport_y_scale: options.viewport_y_scale
              });
              $scope.$apply();
            });
          }
          service.registerObserverCallback(options.name, function () {
            $scope.data = KWGraphService.generateLineGraph($scope.rawData, {
              width: $scope.width,
              height: $scope.height,
              accumulate: false,
              viewport_y_max: options.viewport_y_max,
              viewport_y_scale: options.viewport_y_scale
            });
            showAllLines();
            $scope.$apply();
          });
          // $scope.x_label = $scope.data[0];
          if ($scope.data)
            showAllLines();
        }
      }
      if (options.type === 'csv' || options.type === undefined) {
        if (options.url === undefined) {
          options.url = 'images/src.csv';
        }
        getDataFromCSV(options.url);
      }
    };
    function showAllLines() {
      var i;
      for (i = 0; i < $scope.data.paths.length; i++) {
        $scope.pathDisplayState[i] = true;
      }
    }
    function getDataFromCSV(url) {
      CsvReaderService.read(url, function (d) {
        $scope.rawData = d;
        $scope.data = KWGraphService.generateLineGraph(d, {
          width: $scope.width,
          height: $scope.height,
          accumulate: false
        });
        //getRenderData(d, $scope.width, $scope.height);
        $scope.x_label = d[0];
        if ($scope.data)
          showAllLines();
      });
    }
    $scope.togglePath = function (index) {
      return $scope.pathDisplayState[index] = $scope.pathDisplayState[index] === true ? false : true;
    };
    $scope.showPath = function (scope) {
      if ($scope.pathDisplayState[scope.path.label])
        return $scope.pathDisplayState[scope.path.label];
      else
        return 1;
    };
    $scope.mousemove = function (event) {
      var i;
      var closet_column_index = -1;
      var x_distance = 999999;
      var x_columns = $scope.data.label_x_coord;
      for (i = 0; i < x_columns.length; i++) {
        var d = Math.abs(event.offsetX - 30 - x_columns[i]);
        if (d < x_distance) {
          x_distance = d;
          closet_column_index = i;
        }
      }
      var graphID = jQuery(event.currentTarget).parents('.graph')[0].id;
      // var guide = angular.element('#hover-guide');
      // guide.attr('x1', x_columns[closet_column_index]-25);
      // guide.attr('x2', x_columns[closet_column_index]-25);
      var data = $scope.data.renderData;
      var tooltip = angular.element('#' + graphID + ' .tooltip');
      tooltip.css('top', event.screenY - 80);
      tooltip.css('left', x_columns[closet_column_index] + 140);
      tooltip.html($scope.data.x_label[closet_column_index]);
      tooltip.css('visibility', 'visible');
      for (i = 0; i < data.length; i++) {
        var dot = angular.element('#' + graphID + ' #hover-dot-' + i);
        var x = data[i][closet_column_index][0] + 30;
        if (closet_column_index === data[i].length - 1)
          x -= 4;
        dot.attr('cx', x);
        dot.attr('cy', data[i][closet_column_index][1]);
        dot.css('visibility', 'visible');
      }
      $scope.pathValues.length = 0;
      for (i = 1; i < $scope.rawData.length; i++)
        $scope.pathValues.push($scope.rawData[i][closet_column_index + 1]);
    };
    $scope.mouseenter = function (event) {
      // FIXME: this never fired
      $scope.showGuide = true;
      console.log('enter');
    };
    $scope.mouseleave = function (event) {
      // FIXME: this never fired
      $scope.showGuide = false;
      console.log('leave');
    };
  }
]);
'use strict';
angular.module('a2App').controller('MapCtrl', [
  '$scope',
  'CsvReaderService',
  'KWCarbonTrailService',
  function ($scope, CsvReaderService, KWCarbonTrailService) {
    var service = KWCarbonTrailService;
    $scope.year = '1995';
    $scope.slider_options = {
      from: 1995,
      to: 2010,
      step: 1
    };
    $scope.hoverUsState = false;
    $scope.updateMapByYear = function () {
      if ($scope.data != null) {
        $scope.renderData = service.filterDataByYear($scope.data, $scope.year);
      }
      $scope.renderMap();
    };
    $scope.$watch('year', $scope.updateMapByYear, true);
    $scope.data = null;
    CsvReaderService.read('images/map_src.csv', function (d) {
      $scope.data = d;
      service.onMapDataLoaded(d);
      $scope.updateMapByYear();
    });
    $scope.highlightedState = null;
    function applyCssToState(obj, property, value) {
      var state_text = obj[0].id;
      if (state_text === 'MI') {
        obj.children().each(function () {
          jQuery(this).css(property, value);
        });
      } else {
        obj.css(property, value);
      }
    }
    function assignTextToState(text_selector, state) {
      var text_element = jQuery($scope.svg).children(text_selector);
      text_element.attr('visibility', 'visible');
      var box = state.getBoundingClientRect();
      text_element.attr('x', box.left + box.width);
      text_element.attr('y', box.top + box.height / 2);
      text_element.html(state.id);
    }
    function sendStateChanged() {
      if ($scope.highlightedState && $scope.data) {
        service.onStateChanged($scope.data, $scope.highlightedState.id.toString());
      }
    }
    $scope.renderMap = function () {
      jQuery($scope.svg).children('.state').each(function () {
        var value = 240 - parseInt($scope.renderData[this.id] * 240 / 300);
        jQuery(this).attr('fill', 'rgb(' + value + ',' + value + ',' + value + ')');
        jQuery(this).attr('stroke', 'white');
        jQuery(this).css('z-index', '100');
        jQuery(this).click(function (event) {
          var prev_state = jQuery($scope.highlightedState);
          if (prev_state.length > 0) {
            prev_state.attr('filter', '');
            applyCssToState(prev_state, 'stroke-width', '0.75');
            applyCssToState(prev_state, 'stroke', 'white');
          }
          var obj = jQuery(event.currentTarget);
          obj.attr('filter', 'url(#drop-shadow)');
          applyCssToState(obj, 'stroke', '#07EFC3');
          applyCssToState(obj, 'stroke-width', '4');
          assignTextToState('#highlighted-state-name', event.currentTarget);
          $scope.highlightedState = event.currentTarget;
          $scope.svg.appendChild($scope.highlightedState);
          sendStateChanged();
        });
        jQuery(this).hover(function (event) {
          var text_element = jQuery($scope.svg).children('#state-name');
          text_element.bind('hover', this);
          $scope.svg.appendChild(event.currentTarget);
          if ($scope.highlightedState)
            $scope.svg.appendChild($scope.highlightedState);
          $scope.svg.appendChild(text_element[0]);
          $scope.svg.appendChild(jQuery($scope.svg).children('#highlighted-state-name')[0]);
          // #2FBCFF #4287D1 22DCFF 38CFFF
          var obj = jQuery(event.currentTarget);
          applyCssToState(obj, 'stroke-width', '4');
          if ($scope.highlightedState)
            if (!(event.currentTarget.id === $scope.highlightedState.id)) {
              applyCssToState(obj, 'stroke', 'white');
            }
          assignTextToState('#state-name', event.currentTarget);
          $scope.hoverUsState = true;
        }, function (event) {
          var obj = jQuery(event.currentTarget);
          applyCssToState(obj, 'stroke-width', '1');
          applyCssToState(obj, 'stroke', 'white');
          if ($scope.highlightedState)
            if (event.currentTarget.id === $scope.highlightedState.id) {
              applyCssToState(obj, 'stroke-width', '3');
              applyCssToState(obj, 'stroke', '#07EFC3');
            }
          var text_element = jQuery($scope.svg).children('#state-name');
          text_element.attr('visibility', 'hidden');
          $scope.hoverUsState = false;
        });
      });
    };
  }
]);
function onMapLoaded() {
  var svg = document.getElementById('map').contentWindow.document.getElementById('svg');
  // Storing svg elements back to scope.
  var scope = angular.element($('#map-container')).scope();
  scope.$apply(function () {
    scope.svg = svg;
  });
}
;
'use strict';
angular.module('a2App').service('CsvReaderService', [
  '$http',
  function ($http) {
    this.read = function (path, callback) {
      $http.get(path).then(function (result) {
        var d = CSVToArray(result.data);
        callback(d);
      });
    };
  }
]);
'use strict';
angular.module('a2App').service('KWGraphService', function () {
  this.generateLineGraph = function (data, options) {
    if (!data)
      return;
    if (data.length === 0)
      return;
    if (!data[0])
      return;
    if (data[0].length === 0)
      return;
    var i, j;
    var width = options.width, height = options.height;
    // Find extreme value for scaling.
    var data_max = -999999;
    var data_accumulated_max = 0;
    var data_min = 999999;
    var accumulated_prev_y = new Array(data[0].length);
    for (j = 1; j < data[0].length; j++)
      accumulated_prev_y[j] = 0;
    for (i = 1; i < data.length; i++) {
      for (j = 1; j < data[i].length; j++) {
        var d = parseFloat(data[i][j]);
        data_max = d > data_max ? d : data_max;
        data_min = d < data_min ? d : data_min;
        accumulated_prev_y[j] += d;
      }
    }
    for (j = 1; j < accumulated_prev_y.length; j++) {
      var d = accumulated_prev_y[j];
      data_accumulated_max = d > data_accumulated_max ? d : data_accumulated_max;
    }
    var data_span = data_max - data_min;
    var viewport_y_min = 0;
    var viewport_y_max = data_max;
    if (options.accumulate)
      viewport_y_max = data_accumulated_max;
    if (options.viewport_y_max)
      viewport_y_max = options.viewport_y_max;
    var viewport_y_span = viewport_y_max - viewport_y_min;
    var ratio = {
        x: viewport_y_span / width,
        y: viewport_y_span / height
      };
    // time-based
    var renderData = [];
    var label_x_coord = [];
    var accumulated_prev_y = new Array(data[0].length);
    for (j = 1; j < data[0].length; j++) {
      accumulated_prev_y[j] = 0;
      var item_no = j - 1;
      var item_x = item_no * width / (data[0].length - 2);
      label_x_coord.push(item_x);
    }
    //push forward for the last label
    // label_x_coord[data[0].length-2] -= 20;
    for (i = 1; i < data.length; i++) {
      var row = [];
      for (j = 1; j < data[i].length; j++) {
        var item_no = j - 1;
        var item_x = item_no * width / (data[i].length - 2);
        var scaled_y_height = data[i][j] / ratio.y;
        var scaled_y = height - (scaled_y_height - viewport_y_min / ratio.y);
        var accumulated_y = height - (accumulated_prev_y[j] + scaled_y_height - viewport_y_min / ratio.y);
        accumulated_prev_y[j] += scaled_y_height;
        if (options.accumulate === true) {
          row.push([
            item_x.toFixed(4),
            accumulated_y.toFixed(4)
          ]);
        } else
          row.push([
            item_x.toFixed(4),
            scaled_y.toFixed(4)
          ]);
      }
      renderData.push(row);
    }
    var pathData = [];
    for (i = 0; i < renderData.length; i++) {
      var row = [];
      for (j = 0; j < renderData[i].length; j++) {
        row.push(renderData[i][j].join(' '));
      }
      pathData.push({
        label: data[i + 1][0],
        d: 'M ' + row.join(' L ')
      });
    }
    var label_y_coord = [];
    var y_label = [];
    var y_label_scale = 200;
    if (options.viewport_y_scale)
      y_label_scale = options.viewport_y_scale;
    for (i = 0; i < height * ratio.y; i += y_label_scale) {
      var scaled_value = i / ratio.y;
      label_y_coord.push(height - scaled_value);
      y_label.push(i);
    }
    var x_label = [];
    if (data)
      x_label = data[0].slice(1, data[0].length);
    return {
      paths: pathData,
      renderData: renderData,
      x_label: x_label,
      y_label: y_label,
      label_x_coord: label_x_coord,
      label_y_coord: label_y_coord
    };
  };
});
'use strict';
angular.module('a2App').service('KWCarbonTrailService', function () {
  this.state_data = {
    AK: {
      name: 'Alaska',
      average: 15.65227014,
      ranking: 35
    },
    AL: {
      name: 'Alabama',
      average: 34.63312419,
      ranking: 19
    },
    AR: {
      name: 'Arkansas',
      average: 20.96569983,
      ranking: 30
    },
    AZ: {
      name: 'Arizona',
      average: 34.40358322,
      ranking: 20
    },
    CA: {
      name: 'California',
      average: 224.9807134,
      ranking: 1
    },
    CO: {
      name: 'Colorado',
      average: 28.22752076,
      ranking: 27
    },
    CT: {
      name: 'Connecticut',
      average: 17.43797401,
      ranking: 33
    },
    DC: {
      name: 'District of Columbia',
      average: 1.607517584,
      ranking: 51
    },
    DE: {
      name: 'Delaware',
      average: 5.086506951,
      ranking: 48
    },
    FL: {
      name: 'Florida',
      average: 105.5471576,
      ranking: 3
    },
    GA: {
      name: 'Georgia',
      average: 65.63167608,
      ranking: 9
    },
    HI: {
      name: 'Hawaii',
      average: 10.5958076,
      ranking: 40
    },
    IA: {
      name: 'Iowa',
      average: 20.72783811,
      ranking: 31
    },
    ID: {
      name: 'Idaho',
      average: 9.035525822,
      ranking: 41
    },
    IL: {
      name: 'Illinois',
      average: 68.53668966,
      ranking: 7
    },
    IN: {
      name: 'Indiana',
      average: 46.12729378,
      ranking: 14
    },
    KS: {
      name: 'Kansas',
      average: 19.51034596,
      ranking: 32
    },
    KY: {
      name: 'Kentucky',
      average: 33.06597993,
      ranking: 21
    },
    LA: {
      name: 'Louisiana',
      average: 54.6350019,
      ranking: 11
    },
    MA: {
      name: 'Massachusetts',
      average: 32.97345567,
      ranking: 22
    },
    MD: {
      name: 'Maryland',
      average: 30.41207254,
      ranking: 25
    },
    ME: {
      name: 'Maine',
      average: 8.768777109,
      ranking: 42
    },
    MI: {
      name: 'Michigan',
      average: 57.43456236,
      ranking: 10
    },
    MN: {
      name: 'Minnesota',
      average: 35.08564391,
      ranking: 18
    },
    MO: {
      name: 'Missouri',
      average: 42.80473351,
      ranking: 17
    },
    MS: {
      name: 'Mississippi',
      average: 26.10664302,
      ranking: 28
    },
    MT: {
      name: 'Montana',
      average: 7.872191111,
      ranking: 44
    },
    NC: {
      name: 'North Carolina',
      average: 51.93398922,
      ranking: 12
    },
    ND: {
      name: 'North Dakota',
      average: 6.143962895,
      ranking: 47
    },
    NE: {
      name: 'Nebraska',
      average: 12.87536346,
      ranking: 38
    },
    NH: {
      name: 'New Hampshire',
      average: 7.414865772,
      ranking: 45
    },
    NJ: {
      name: 'New Jersey',
      average: 66.34039064,
      ranking: 8
    },
    NM: {
      name: 'New Mexico',
      average: 15.48398015,
      ranking: 36
    },
    NV: {
      name: 'Nevada',
      average: 15.34314648,
      ranking: 37
    },
    NY: {
      name: 'New York',
      average: 73.20149315,
      ranking: 4
    },
    OH: {
      name: 'Ohio',
      average: 70.18691675,
      ranking: 6
    },
    OK: {
      name: 'Oklahoma',
      average: 30.78184755,
      ranking: 24
    },
    OR: {
      name: 'Oregon',
      average: 23.51745881,
      ranking: 29
    },
    PA: {
      name: 'Pennsylvania',
      average: 71.29168029,
      ranking: 5
    },
    RI: {
      name: 'Rhode Island',
      average: 4.62921442,
      ranking: 49
    },
    SC: {
      name: 'South Carolina',
      average: 29.50374605,
      ranking: 26
    },
    SD: {
      name: 'South Dakota',
      average: 6.159112742,
      ranking: 46
    },
    TN: {
      name: 'Tennessee',
      average: 43.78492339,
      ranking: 16
    },
    TX: {
      name: 'Texas',
      average: 192.9793922,
      ranking: 2
    },
    UT: {
      name: 'Utah',
      average: 16.37846847,
      ranking: 34
    },
    VA: {
      name: 'Virginia',
      average: 51.72370847,
      ranking: 13
    },
    VT: {
      name: 'Vermont',
      average: 3.884205832,
      ranking: 50
    },
    WA: {
      name: 'Washington',
      average: 45.23309938,
      ranking: 15
    },
    WI: {
      name: 'Wisconsin',
      average: 31.10640391,
      ranking: 23
    },
    WV: {
      name: 'West Virginia',
      average: 12.59547573,
      ranking: 39
    },
    WY: {
      name: 'Wyoming',
      average: 8.144043387,
      ranking: 43
    }
  };
  this.highlightedState = null;
  this.stateID = null;
  this.sidePanelLineData = [];
  this.sidePanelShadowData = [];
  this.filterDataByYear = function (data, year) {
    var i;
    var renderData = {};
    for (i = 1; i < data.length; i++) {
      if (data[i][1] == year) {
        renderData[data[i][0]] = data[i][2];
      }
    }
    return renderData;
  };
  this.filterDataByState = function (data, state) {
    var i;
    var renderData = {};
    for (i = 1; i < data.length; i++) {
      if (data[i][0] == state) {
        renderData[data[i][1]] = data[i][2];
      }
    }
    return renderData;
  };
  this.onMapDataLoaded = function (data) {
    // get header
    var headerRow = ['year'];
    var firstState = data[1][0];
    var i;
    for (i = 1; i < data.length; i++) {
      if (data[i][0] !== firstState)
        break;
      headerRow.push(data[i][1]);
    }
    ;
    var prevRowState = '';
    var contentRow = null;
    var output = [headerRow];
    for (i = 1; i < data.length; i++) {
      if (prevRowState !== data[i][0]) {
        if (contentRow)
          output.push(contentRow);
        contentRow = new Array(0);
        contentRow.push(data[i][0]);
      }
      contentRow.push(data[i][2]);
      prevRowState = data[i][0];
    }
    var self = this;
    self.sidePanelShadowData.length = 0;
    angular.forEach(output, function (val) {
      self.sidePanelShadowData.push(val);
    });
    notifyObservers('sidePanelShadowData');
  };
  this.onStateChanged = function (data, state) {
    var obj = this.filterDataByState(data, state);
    this.stateID = state;
    this.sidePanelLineData.length = 0;
    var i;
    var headerRow = [];
    headerRow.push('year');
    angular.forEach(obj, function (value, key) {
      headerRow.push(key);
    });
    this.sidePanelLineData.push(headerRow);
    var contentRow = [];
    contentRow.push(state);
    angular.forEach(obj, function (value, key) {
      contentRow.push(value);
    });
    this.sidePanelLineData.push(contentRow);
    notifyObservers('sidePanelLineData');
  };
  var ObserverCallbacks = {};
  this.registerObserverCallback = function (name, callback) {
    if (!ObserverCallbacks[name])
      ObserverCallbacks[name] = [];
    ObserverCallbacks[name].push(callback);
  };
  var notifyObservers = function (name) {
    angular.forEach(ObserverCallbacks[name], function (callback) {
      callback();
    });
  };
  this.getPowerPlantNumber = function () {
    console.log(this.stateID);
    console.log(parseInt(this.state_data[this.stateID].average / 22.011155));
    return new Array(parseInt(this.state_data[this.stateID].average / 22.011155));
  };
});
'use strict';
angular.module('a2App').controller('TakeActionCtrl', [
  '$scope',
  '$modal',
  function ($scope, $modal) {
    $scope.open = function () {
      var modalInstance = $modal.open({
          templateUrl: 'views/take-action.html',
          controller: 'ModalInstanceCtrl',
          resolve: {}
        });
    };
  }
]);
'use strict';
angular.module('a2App').controller('ModalInstanceCtrl', [
  '$scope',
  '$modalInstance',
  function ($scope, $modalInstance) {
    $scope.ok = function () {
      $modalInstance.close();
    };
  }
]);