'use strict';

angular.module('a2App')
  .service('CsvReaderService', function ($http) {
    this.read = function (path, callback) {
      $http.get(path).then(function(result)
        {
          var d = CSVToArray(result.data);
          callback(d);
        });
    }
  });
