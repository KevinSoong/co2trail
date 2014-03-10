'use strict';

angular.module('a2App')
  .service('KWCarbonTrailService', function () {
    this.highlightedState = null;
    this.sidePanelLineData = [];
    this.filterDataByYear = function(data, year) {
        var renderData = {};
        for (i=1; i<data.length; i++) {
            if (data[i][1] == year) {
                renderData[data[i][0]] = data[i][2];
            }
        }
        return renderData;
    };
    this.filterDataByState = function(data, state) {
        var renderData = {};
        for (i=1; i<data.length; i++) {
            if (data[i][0] == state) {
                renderData[data[i][1]] = data[i][2];
            }
        }
        return renderData;
    };
    this.onStateChanged = function(data, state) {
        var obj = this.filterDataByState(data, state);
        //
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
        console.log(state);
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
  });
