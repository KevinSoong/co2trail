'use strict';

describe('Service: CsvReaderService', function () {

  // load the service's module
  beforeEach(module('a2App'));

  // instantiate service
  var CsvReaderService;
  beforeEach(inject(function (_CsvReaderService_) {
    CsvReaderService = _CsvReaderService_;
  }));

  it('should do something', function () {
    expect(!!CsvReaderService).toBe(true);
  });

});
