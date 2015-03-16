describe('bc.namespace', function() {
  afterEach(function() {
    delete bc.test;
  });
  it('should append a namespace to the app and return it', function() {
    var ret = bc.namespace('test');
    expect(ret).to.deep.equal(bc.test);
  });
  it('should support a deeply nested namespace', function() {
    var ret = bc.namespace('test.deeply.nested.namespace');
    expect(ret).to.deep.equal(bc.test.deeply.nested.namespace);
  });
  it('should support adding some properties to the namespace while grabbing it', function() {
    bc.namespace('test.util', {
      property: true,
      func: function() {
      }
    });
    expect(bc.test.util.property).to.be.true;
    expect(bc.test.util.func).to.be.a('function');
  });
  it('should support using a function as the root of a namespace', function() {
    var f = function() {};
    bc.namespace('test', f);
    expect(bc.test).to.be.a('function');
  });
  it('should support changing an existing namespace to use a function as the root', function() {
    bc.namespace('test');
    expect(bc.test).to.be.an('object');
    bc.namespace('test', {
      property: true
    });
    expect(bc.test.property).to.be.true;
    bc.namespace('test', function() {});
    expect(bc.test).to.be.a('function');
    expect(bc.test.property).to.be.true;
  });
});
