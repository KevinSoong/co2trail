'use strict';

describe('Service: KWCarbonTrailService', function () {

  // load the service's module
  beforeEach(module('a2App'));

  // instantiate service
  var KWCarbonTrailService;
  beforeEach(inject(function (_KWCarbonTrailService_) {
    KWCarbonTrailService = _KWCarbonTrailService_;
  }));

  it('should do something', function () {
    expect(!!KWCarbonTrailService).toBe(true);
  });

});
