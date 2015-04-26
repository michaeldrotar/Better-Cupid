describe('bc.db', function() {
  var db = bc.db,
      testData = {
        arraytest: [1,2,3,4],
        booleantest: true,
        objecttest: {
          key: 'value',
          otherKey: 'stuff'
        },
        numbertest: 4,
        stringtest:'my string'
      },
      testKeys = [];
  bc.util.each(testData, function(value, key) {
    testKeys.push(key);
  });
  beforeEach(function(done) {
    db.set(testData, done);
  });
  afterEach(function(done) {
    db.remove(testKeys, done);
  });
  it('should retrieve all data from storage if there\'s no key', function(done) {
    db.get(function(data) {
      bc.util.each(testKeys, function(key) {
        expect(data[key]).to.exist;
      });
      done();
    });
  });
  it('should retrieve a single key from storage if given', function(done) {
    var key = testKeys[0];
    db.get(key, function(data) {
      expect(data[key]).to.deep.equal(testData[key]);
      done();
    });
  });
  it('should set a single key to a given value', function(done) {
    var key = testKeys[0],
        value = 'my value';
    db.set(key, value, function() {
      db.get(key, function(data) {
        expect(data[key]).to.equal(value);
        done();
      });
    });
  });
  it('should set multiple keys when given a hash', function(done) {
    var obj = {};
    obj[testKeys[0]] = 'some';
    obj[testKeys[1]] = 'stuff';
    obj[testKeys[2]] = 'to';
    obj[testKeys[3]] = 'test';
    db.set(obj, function() {
      db.get(function(data) {
        bc.util.each(obj, function(value, key) {
          expect(data[key]).to.equal(value);
        });
        done();
      });
    });
  });
  it('should remove a given key', function(done) {
    var key = testKeys[0];
    db.remove(key, function() {
      db.get(key, function(data) {
        expect(data[key]).to.not.exist;
        done();
      });
    });
  });
  it('should allow monitoring for changes', function(done) {
    var key = testKeys[0],
        otherKey = testKeys[1],
        generalChanges = 0,
        keyChanges = 0,
        expectedGeneralChanges = 5,
        expectedKeyChanges = 3,
        i;

    function onGeneralChanged(changedKey, value) {
      generalChanges++;
      expect([key,otherKey]).to.contain(changedKey);
    }

    function onKeyChanged(changedKey, value) {
      keyChanges++;
      expect(changedKey).to.equal(key);
    }

    db.onChanged(onGeneralChanged);
    db.onChanged(key, onKeyChanged);

    for ( i = 0; i < expectedKeyChanges; i++ ) {
      db.set(key, i);
    }
    for ( i = 0; i < expectedGeneralChanges - expectedKeyChanges; i++ ) {
      db.set(otherKey, i);
    }

    setTimeout(function() {
      expect(generalChanges).to.equal(expectedGeneralChanges);
      expect(keyChanges).to.equal(expectedKeyChanges);
      db.unChanged(onGeneralChanged);
      db.unChanged(key, onKeyChanged);
      done();
    }, 10); // NOTE: can't really chain these so use a short wait
  });
});
