describe('bc.error', function() {
  afterEach(function() {
    delete bc.ParentError;
    delete bc.TestError;
  });
  function create(name, parent, properties, message) {
    return bc.error.create({
      name: name,
      parent: parent,
      properties: properties,
      message: message
    });
  }
  function wrap() {
    var args = arguments;
    return function() {
      return create.apply(this, args);
    }
  }
  it('should only accept names that meet the standards', function() {
    expect(wrap('foobar')).to.throw(Error);
    expect(wrap('myError')).to.throw(Error);
    expect(wrap('Foobar')).to.throw(Error);
    expect(wrap('TestError')).not.to.throw(Error);
  });
  it('should not allow duplicates', function() {
    expect(wrap('TestError')).not.to.throw(Error);
    expect(wrap('TestError')).to.throw(Error);
  });
  it('should only inherit from other error objects', function() {
    expect(wrap('TestError', {})).to.throw(Error);
    expect(wrap('TestError', window)).to.throw(Error);
    expect(wrap('TestError', Error)).not.to.throw(Error);
  });
  it('should allow properties to be defined', function() {
    var err = create('TestError', undefined, ['all','my','properties']),
        inst = new err('one','two','three');
    expect(inst.all).to.equal('one');
    expect(inst.my).to.equal('two');
    expect(inst.properties).to.equal('three');
  });
  it('should allow properties to be given', function() {
    var err = create('TestError', undefined, {all:'one',my:'two',properties:'three'}),
        inst = new err('four', 'five', 'six');
    expect(inst.all).to.equal('one');
    expect(inst.my).to.equal('two');
    expect(inst.properties).to.equal('three');
    expect(inst.message).to.equal('four');
  });
  it('should allow properties to be defaulted', function() {
    var err = create('TestError', undefined, ['all','my','properties',{all:'one',my:'two',properties:'three'}]),
        inst = new err('four');
    expect(inst.all).to.equal('four');
    expect(inst.my).to.equal('two');
    expect(inst.properties).to.equal('three');
  });
  it('should inherit properties from its parent', function() {
    var par = create('ParentError', undefined, ['all']),
        err = create('TestError', par),
        inst = new err('one');
    expect(inst.all).to.equal('one');
  });
  it('should allow overriding parent constructor arguments', function() {
    var par = create('ParentError', undefined, ['all']),
        err = create('TestError', par, ['my',{all:'one'}]),
        inst = new err('two');
    expect(inst.all).to.equal('one');
    expect(inst.my).to.equal('two');
  });
  it('should allow a default message to be set', function() {
    var err = create('TestError', undefined, undefined, 'my message'),
        inst = new err();
    expect(inst.message).to.equal('my message');
  });
  it('should allow the message to be overriden', function() {
    var err = create('TestError', undefined, undefined, 'my message'),
        inst = new err('custom message');
    expect(inst.message).to.equal('custom message');
  });
  it('should allow the message to have wildcards', function() {
    var err = create('TestError', undefined, ['all'], 'my {all} message'),
        inst = new err('one');
    expect(inst.message).to.equal('my one message');
  });
  it('should inherit the message from its parent', function() {
    var par = create('ParentError', undefined, undefined, 'parent message'),
        err = create('TestError', par),
        inst = new err();
    expect(inst.message).to.equal('parent message');
  });
});
