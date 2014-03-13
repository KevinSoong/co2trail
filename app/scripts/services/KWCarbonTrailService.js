'use strict';

angular.module('a2App')
  .service('KWCarbonTrailService', function () {
  this.state_data =
  {
    AK: { name: 'Alaska'   , average: 15.65227014, ranking: 35 },
    AL: { name: 'Alabama'  , average: 34.63312419, ranking: 19 },
    AR: { name: 'Arkansas' , average: 20.96569983, ranking: 30 },
    AZ: { name: 'Arizona'  , average: 34.40358322, ranking: 20 },
    CA: { name: 'California'   , average: 224.9807134, ranking: 1  },
    CO: { name: 'Colorado' , average: 28.22752076, ranking: 27 },
    CT: { name: 'Connecticut'  , average: 17.43797401, ranking: 33 },
    DC: { name: 'District of Columbia' , average: 1.607517584, ranking: 51 },
    DE: { name: 'Delaware' , average: 5.086506951, ranking: 48 },
    FL: { name: 'Florida'  , average: 105.5471576, ranking: 3  },
    GA: { name: 'Georgia'  , average: 65.63167608, ranking: 9  },
    HI: { name: 'Hawaii'   , average: 10.5958076 , ranking: 40 },
    IA: { name: 'Iowa' , average: 20.72783811, ranking: 31 },
    ID: { name: 'Idaho', average: 9.035525822, ranking: 41 },
    IL: { name: 'Illinois' , average: 68.53668966, ranking: 7  },
    IN: { name: 'Indiana'  , average: 46.12729378, ranking: 14 },
    KS: { name: 'Kansas'   , average: 19.51034596, ranking: 32 },
    KY: { name: 'Kentucky' , average: 33.06597993, ranking: 21 },
    LA: { name: 'Louisiana', average: 54.6350019 , ranking: 11 },
    MA: { name: 'Massachusetts', average: 32.97345567, ranking: 22 },
    MD: { name: 'Maryland' , average: 30.41207254, ranking: 25 },
    ME: { name: 'Maine', average: 8.768777109, ranking: 42 },
    MI: { name: 'Michigan' , average: 57.43456236, ranking: 10 },
    MN: { name: 'Minnesota', average: 35.08564391, ranking: 18 },
    MO: { name: 'Missouri' , average: 42.80473351, ranking: 17 },
    MS: { name: 'Mississippi'  , average: 26.10664302, ranking: 28 },
    MT: { name: 'Montana'  , average: 7.872191111, ranking: 44 },
    NC: { name: 'North Carolina'   , average: 51.93398922, ranking: 12 },
    ND: { name: 'North Dakota' , average: 6.143962895, ranking: 47 },
    NE: { name: 'Nebraska' , average: 12.87536346, ranking: 38 },
    NH: { name: 'New Hampshire', average: 7.414865772, ranking: 45 },
    NJ: { name: 'New Jersey'   , average: 66.34039064, ranking: 8  },
    NM: { name: 'New Mexico'   , average: 15.48398015, ranking: 36 },
    NV: { name: 'Nevada'   , average: 15.34314648, ranking: 37 },
    NY: { name: 'New York' , average: 73.20149315, ranking: 4  },
    OH: { name: 'Ohio' , average: 70.18691675, ranking: 6  },
    OK: { name: 'Oklahoma' , average: 30.78184755, ranking: 24 },
    OR: { name: 'Oregon'   , average: 23.51745881, ranking: 29 },
    PA: { name: 'Pennsylvania' , average: 71.29168029, ranking: 5  },
    RI: { name: 'Rhode Island' , average: 4.62921442 , ranking: 49 },
    SC: { name: 'South Carolina'   , average: 29.50374605, ranking: 26 },
    SD: { name: 'South Dakota' , average: 6.159112742, ranking: 46 },
    TN: { name: 'Tennessee', average: 43.78492339, ranking: 16 },
    TX: { name: 'Texas', average: 192.9793922, ranking: 2  },
    UT: { name: 'Utah' , average: 16.37846847, ranking: 34 },
    VA: { name: 'Virginia' , average: 51.72370847, ranking: 13 },
    VT: { name: 'Vermont'  , average: 3.884205832, ranking: 50 },
    WA: { name: 'Washington'   , average: 45.23309938, ranking: 15 },
    WI: { name: 'Wisconsin', average: 31.10640391, ranking: 23 },
    WV: { name: 'West Virginia', average: 12.59547573, ranking: 39 },
    WY: { name: 'Wyoming'  , average: 8.144043387, ranking: 43 }
};

    this.highlightedState = null;
    this.stateID = null;
    this.sidePanelLineData = [];
    this.sidePanelShadowData = [];
    this.generateMapDataByAverage = function() {
        var i;
        var renderData = {};
        angular.forEach(this.state_data, function(value, key) {
            renderData[key] = value.average;
        })
        return renderData;
    };
    this.filterDataByYear = function(data, year) {
        var i;
        var renderData = {};
        for (i=1; i<data.length; i++) {
            if (data[i][1] == year) {
                renderData[data[i][0]] = data[i][2];
            }
        }
        return renderData;
    };
    this.filterDataByState = function(data, state) {
        var i;
        var renderData = {};
        for (i=1; i<data.length; i++) {
            if (data[i][0] == state) {
                renderData[data[i][1]] = data[i][2];
            }
        }
        return renderData;
    };
    this.onMapDataLoaded = function(data) {
        // get header
        var headerRow = ['year'];
        var firstState = data[1][0];
        var i;
        for (i=1; i<data.length; i++) {
          if (data[i][0] !== firstState)
            break;
          headerRow.push(data[i][1]);
        };

        var prevRowState = "";
        var contentRow = null;
        var output = [headerRow];
        for (i=1; i<data.length; i++) {
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
        angular.forEach(output, function(val){
          self.sidePanelShadowData.push(val);
        });
        notifyObservers('sidePanelShadowData');
    }
    this.onStateChanged = function(data, state) {
        var obj = this.filterDataByState(data, state);
        this.stateID = state;
        this.sidePanelLineData.length = 0;
        var i;
        var headerRow = [];
        headerRow.push('year');
        angular.forEach(obj, function(value, key){
          headerRow.push(key);
        });
        this.sidePanelLineData.push(headerRow);
        var contentRow = [];
        contentRow.push(state);
        angular.forEach(obj, function(value, key){
          contentRow.push(value);
        });
        this.sidePanelLineData.push(contentRow);
        
        notifyObservers('sidePanelLineData');
    }

    var ObserverCallbacks = {};

    this.registerObserverCallback = function(name, callback){
      if (!ObserverCallbacks[name])
        ObserverCallbacks[name] = [];
      ObserverCallbacks[name].push(callback);
    };

    var notifyObservers = function(name){
      angular.forEach(ObserverCallbacks[name], function(callback){
        callback();
      });
    };

    this.getPowerPlantNumber = function() {
        // Based on Bowen power plant, GA. Annual CO2 emissions: 22,011,155 MTCD
        // Source: Wu, Brandon. Lethal Legacy: A comprehensive look at america's dirtiest power plants. US PIRG Education Fund, 2003. pp.20.
        // Available at: http://www.csu.edu/cerc/documents/LethalLegacy_001.pdf
        return new Array(parseInt((this.state_data[this.stateID].average)/22.011155));
    }
  });
