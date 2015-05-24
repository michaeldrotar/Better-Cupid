describe('bc.util', function() {
  var util = bc.util;
  describe('.camelize', function() {
    it('should camelize a string', function() {
      expect(util.camelize(' test-me here_now 2')).to.equal('testMeHereNow2');
    });
  });
  describe('.capitalize', function() {
    it('should capitalize the first letter of a string', function() {
      expect(util.capitalize('test me')).to.equal('Test me');
    });
  });
  describe('.clone', function() {
    it('should create a duplicate of the array itself', function() {
      var a = [1,2,3],
          b = util.clone(a);
      expect(a).to.deep.equal(b);
      expect(a).to.not.equal(b);
    });
    it('should create a duplicate of an array-like object', function() {
      function checkArgs() {
        return util.clone(arguments);
      }
      var args = checkArgs(1,2,3);
      expect(args).to.deep.equal([1,2,3]);
    });
    it('should create a duplicate of the object itself', function() {
      var a = {a:1,b:2,c:3},
          b = util.clone(a);
      expect(a).to.deep.equal(b);
      expect(a).to.not.equal(b);
    });
  });
  describe('.concat', function() {
    it('should join multiple array-likes and values together', function() {
      var a = {0:6,1:7,length:2};
      expect(util.concat([1,2],3,[[4],5],a)).to.deep.equal([1,2,3,[4],5,6,7]);
    });
  });
  describe('.each', function() {
    it('should iterate each item in an array', function() {
      var a = [1,2,3],
          count = 0;
      util.each(a, function() { count++; });
      expect(count).to.equal(3);
    });
    it('should iterate each key in an object', function() {
      var a = {a:1,b:2,c:3},
          count = 0;
      util.each(a, function() { count++; });
      expect(count).to.equal(3);
    });
    it('should abort if a value is returned while iterating an array and provide the value', function() {
      var a = [1,2,3],
          count = 0,
          v;
      v = util.each(a, function() {
        count++;
        if ( count > 1 ) {
          return 'test';
        }
      });
      expect(count).to.equal(2);
      expect(v).to.equal('test');
    });
    it('should abort if a value is returned while iterating an object and provide the value', function() {
      var a = {a:1,b:2,c:3},
          count = 0,
          v;
      v = util.each(a, function() {
        count++;
        if ( count > 1 ) {
          return 'test';
        }
      });
      expect(count).to.equal(2);
      expect(v).to.equal('test');
    });
  });
  describe('.empty', function() {
    it('should indicate when an array or object has no data', function() {
      expect(util.empty([])).to.be.ok;
      expect(util.empty([1])).to.not.be.ok;
      expect(util.empty({})).to.be.ok;
      expect(util.empty({a:1})).to.not.be.ok;
    });
  });
  describe('.extend', function() {
    it('should shallow extend an object with other objects', function() {
      var a = {a:1,b:2},
          b = {c:3,a:a},
          e = util.extend({}, a, b);
      expect(e).to.deep.equal({a:{a:1,b:2},b:2,c:3});
      expect(e.a).to.equal(a);
    });
    it('should deep extend an object with other objects', function() {
      var a = {a:1,b:2},
          b = {c:3,a:a},
          e = util.extend(true, {}, a, b);
      expect(e).to.deep.equal({a:{a:1,b:2},b:2,c:3});
      expect(e.a).to.not.equal(a);
    });
  });
  /*
  describe('.filter', function() {
    it('should filter an array down to only those items which match a condition', function() {
      var arr3 = util.filter(arr, function(value) {
        return typeof value === 'number';
      });
      expect(arr3.length).to.be.below(arr.length);
      expect(arr3.length).to.be.above(0);
      expect(arr3).to.not.equal(arr);
    });
    it('should filter an object down to only those items which match a condition', function() {
      var obj3 = util.filter(obj, function(value) {
        return typeof value === 'number';
      });
      expect(Object.keys(obj3).length).to.be.below(Object.keys(obj).length);
      expect(Object.keys(obj3).length).to.be.above(0);
      expect(obj3).to.not.equal(obj);
    });
  });
  */
  describe('.flatten', function() {
    it('should join multiple array-likes and values together into a flat array', function() {
      var a = {0:6,1:7,length:2};
      expect(util.flatten([1,2],3,[[4],5],a)).to.deep.equal([1,2,3,4,5,6,7]);
    });
  });
  describe('.format', function() {
    it('should replace numerical wildcards with the arguments', function() {
      var a = util.format('Welcome to {1}, {0}!', 'Mickey', 'Disney');
      expect(a).to.equal('Welcome to Disney, Mickey!');
    });
    it('should replace named wildcards with the object keys', function() {
      var a = { name: 'Mickey', place: 'Disney' },
          b = util.format('Welcome to {place}, {name}!', a);
      expect(b).to.equal('Welcome to Disney, Mickey!');
    });
    it('should allow passing the string as \'this\'', function() {
      var a = util.format.apply('Welcome to {1}, {0}!', ['Mickey', 'Disney']);
      expect(a).to.equal('Welcome to Disney, Mickey!');
    });
  });
  describe('.isArray', function() {
    it('should only identify arrays', function() {
      expect(util.isArray([])).to.be.ok;
      expect(util.isArray({})).to.not.be.ok;
      expect(util.isArray()).to.not.be.ok;
      expect(util.isArray(null)).to.not.be.ok;
      expect(util.isArray(undefined)).to.not.be.ok;
      expect(util.isArray('array')).to.not.be.ok;
      expect(util.isArray(true)).to.not.be.ok;
      expect(util.isArray(1)).to.not.be.ok;
      expect(util.isArray(arguments)).to.not.be.ok;
      expect(util.isArray({length:0})).to.not.be.ok;
    });
  });
  describe('.isArrayLike', function() {
    it('should only identify arrays and array-like objects', function() {
      expect(util.isArrayLike([])).to.be.ok;
      expect(util.isArrayLike({})).to.not.be.ok;
      expect(util.isArrayLike()).to.not.be.ok;
      expect(util.isArrayLike(null)).to.not.be.ok;
      expect(util.isArrayLike(undefined)).to.not.be.ok;
      expect(util.isArrayLike('array')).to.not.be.ok;
      expect(util.isArrayLike(true)).to.not.be.ok;
      expect(util.isArrayLike(1)).to.not.be.ok;
      expect(util.isArrayLike(arguments)).to.be.ok;
      expect(util.isArrayLike({length:0})).to.be.ok;
    });
  });
  describe('.isObject', function() {
    it('should only identify objects', function() {
      expect(util.isObject(null)).to.not.be.ok;
      expect(util.isObject({})).to.be.ok;
      expect(util.isObject([])).to.be.ok;
      expect(util.isObject(this)).to.be.ok;
      expect(util.isObject(arguments)).to.be.ok;
    });
  });
  describe('.keys', function() {
    it('should provide the indices for an array', function() {
      expect(util.keys(['a','b','c'])).to.deep.equal([0,1,2]);
    });
    it('should provide the keys for an object', function() {
      expect(util.keys({a:1,b:2,c:3})).to.deep.equal(['a','b','c']);
    });
  });
  describe('.map', function() {
    it('should map an array\'s values onto a new array', function() {
      var a = [1,2,3],
          b = util.map(a, function(v) { return v++; });
      expect(a).to.not.equal(b);
      expect(b).to.deep.equal([2,3,4]);
    });
    it('should map an object\'s values onto a new object', function() {
      var a = {a:1,b:2},
          b = util.map(a, function(v) { return v++; });
      expect(a).to.not.equal(b);
      expect(b).to.deep.equal({a:2,b:3});
    });
  });
  describe('.reduce', function() {
    it('should use the first argument if none given', function() {
      var value;
      value = util.reduce([1,2,3], function(n,v) { return n+v; });
      expect(value).to.equal(6);
      value = util.reduce({a:1,b:2,c:3}, function(n,v) { return n+v; });
      expect(value).to.equal(6);
    });
    it('should reduce to a single value', function() {
      var r = function(sum, item) {
            return sum + item;
          },
          a = [1,2,3],
          b = {a:1,b:2,c:3};
      expect(util.reduce(a,r)).to.equal(6);
      expect(util.reduce(b,r)).to.equal(6);
    });
    it('should act to combine map and filter', function() {
      var r = function(value, item) {
            if ( typeof item === 'number' ) {
              value.push(item+1);
            }
            return value;
          },
          a = [1,2,'a','b',3],
          b = {a:1,b:2,c:'a',d:'b',e:3};
      expect(util.reduce(a,r,[])).to.deep.equal([1,2,3]);
      expect(util.reduce(b,r,{})).to.deep.equal({a:1,b:2,e:3});
    });
  });
  /*
  describe('.reverse', function() {
    it('should reverse the order of an array', function() {
      expect(util.reverse([1,2,3])).to.deep.equal([3,2,1]);
    });
  });
  */
  describe('.runFunctions', function() {
    it('should accept arguments and ignore failures', function() {
      var count = 0,
          a = function(v) { count += v; },
          b = function(v) { d++; count += v; },
          c = a;
      util.runFunctions([a,b,c], [2]);
      expect(count).to.equal(4);
    });
  });
  describe('.sortBy', function() {
    it('should sort an array of objects by the given properties', function() {
      var a = [
            { first: 'bob', last: 'smith', age: 32, likes: { games: true } },
            { first: 'Bob', last: 'smith', age: 10, likes: { games: true } },
            { first: 'bob', last: 'johnson', age: 29, likes: { games: true } },
            { first: 'ann', last: 'johnson', age: 32, likes: { games: false } }
          ];
      util.sortBy(a, 'first', true);
      console.log(a);
      expect(a[0].first).to.equal('ann');
      expect(a[3].first).to.equal('Bob');
      util.sortBy(a, 'first');
      console.log(a);
      expect(a[0].first).to.equal('ann');
      expect(['bob','Bob']).to.contain(a[1].first);
      util.sortBy(a, ['last', 'first']);
      console.log(a);
      expect(a[0].last).to.equal('johnson');
      expect(a[0].first).to.equal('ann');
      util.sortBy(a, ['last', '-first']);
      console.log(a);
      expect(a[0].last).to.equal('johnson');
      expect(a[0].first).to.equal('bob');
      util.sortBy(a, ['age']);
      console.log(a);
      expect(a[0].age).to.equal(10);
      util.sortBy(a, ['likes.games']);
      console.log(a);
      expect(a[0].likes.games).to.not.be.ok;
      expect(a[3].likes.games).to.be.ok;
    });
  });
  describe('.words', function() {
    it('should provide the words in a string', function() {
      expect(util.words('area 52')).to.deep.equal(['area', '52']);
      expect(util.words('_ one, & two')).to.deep.equal(['one', 'two']);
    });
  });
});
