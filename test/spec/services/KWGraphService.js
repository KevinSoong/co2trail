'use strict';

describe('Service: KWGraphService', function () {

  // load the service's module
  beforeEach(module('a2App'));

  // instantiate service
  var KWGraphService;
  beforeEach(inject(function (_KWGraphService_) {
    KWGraphService = _KWGraphService_;
  }));

  it('should do something', function () {
    expect(!!KWGraphService).toBe(true);
  });

});
