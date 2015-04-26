describe('bc.util', function() {
  var util = bc.util;
  var arr, arr2, obj, obj2, str, str2;
  beforeEach(function() {
    arr = ['Disneyland','Mickey',1,2,true,false,undefined];
    arr2 = [function(){},{one:'fish',two:'fish'},[1,{}]];
    obj = {name:'bob',age:32,married:false};
    obj2 = {name:{first:'beth',last:'smith'},age:45,children:['mary','sue']};
    str = 'Hello {1}, welcome to {0}!';
    str2 = '{name} is {age} years old';
  });

  describe('.array', function() {
    it('should create an array with extended methods', function() {
      var arr3 = util.array();
      arr3.push(1);
      expect(arr3.clone()).to.not.equal(arr3);
      expect(arr3.clone().clone).to.be.a('function');
      expect(arr3.concat(2,[3]).length).to.equal(3);
      expect(arr3.length).to.equal(1);
      expect(util.isArray(arr3)).to.be.ok;
      expect(util.isArrayLike(arr3)).to.be.ok;
      expect(arr3.keys().length).to.equal(arr3.length);
      expect(util.array([1,2,3]).reverse().toArray()).to.deep.equal([3,2,1]);
    });
    it('should allow providing a default array', function() {
      var arr3 = util.array(arr);
      expect(arr3.length).to.equal(arr.length);
      expect(arr3).to.not.equal(arr);
      expect(arr3.toArray()).to.deep.equal(arr);
    });
  });
  describe('.clone', function() {
    it('should create a duplicate of the array itself', function() {
      var arr3 = util.clone(arr);
      expect(arr3).to.not.equal(arr);
      util.each(arr3, function(value, key) {
        expect(value).to.equal(arr[key]);
      });
    });
    it('should create a duplicate of an array-like object', function() {
      var args = util.clone(arguments);
      expect(args.length).to.equal(0);
    });
    it('should create a duplicate of the object itself', function() {
      var obj2 = util.clone(obj);
      expect(obj2).to.not.equal(obj);
      util.each(obj2, function(value, key) {
        expect(value).to.equal(obj[key]);
      });
    });
  });
  describe('.concat', function() {
    it('should join multiple arrays together', function() {
      var arr3 = util.concat(arr, arr2);
      expect(arr3.length).to.equal(arr.length+arr2.length);
    });
    it('should add non-array arguments to the final array', function() {
      var arr3 = util.concat('one', [1,2,3], undefined, false, [['inner','array']]);
      expect(arr3.length).to.equal(7);
    });
  });
  describe('.each', function() {
    it('should iterate each item in an array', function() {
      var count = 0;
      util.each(arr, function(value) {
        count++;
      });
      expect(count).to.equal(arr.length);
    });
    it('should iterate each key in an object', function() {
      var count = 0;
      util.each(obj, function(value) {
        count++;
      });
      expect(count).to.equal(Object.keys(obj).length);
    });
    it('should abort if a value is returned while iterating an array and provide the value', function() {
      var count = 0;
      var ret = util.each(arr, function(value) {
        count++;
        return 'test';
      });
      expect(count).to.equal(1);
      expect(ret).to.equal('test');
    });
    it('should abort if a value is returned while iterating an object and provide the value', function() {
      var count = 0;
      var ret = util.each(obj, function(value) {
        count++;
        return 'test';
      });
      expect(count).to.equal(1);
      expect(ret).to.equal('test');
    });
  });
  describe('.extend', function() {
    it('should shallow extend an object with other objects', function() {
      var obj3 = util.extend({}, obj, obj2);
      util.each(obj3, function(value, key) {
        expect([obj[key], obj2[key]]).to.contain(value);
        if ( obj[key] && obj2[key] ) {
          expect(value).to.equal(obj2[key]);
        }
      });
      expect(obj3).to.not.equal(obj);
      expect(obj3).to.not.equal(obj2);
    });
  });
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
  describe('.format', function() {
    it('should replace numerical wildcards with the arguments', function() {
      var ret = util.format(str, arr[0], arr[1]);
      expect(ret).to.have.string(arr[0]);
      expect(ret).to.have.string(arr[1]);
      expect(ret.length).to.be.above(arr[0].length+arr[1].length);
    });
    it('should replace named wildcards with the object keys', function() {
      var ret = util.format(str2, obj),
          length = 0,
          k;
      for ( k in obj ) {
        if ( typeof obj[k] === 'string' ) {
          expect(ret).to.have.string(obj[k]);
          length += obj[k].length;
        }
      }
      expect(ret.length).to.be.above(length);
    });
    it('should allow passing the string as \'this\'', function() {
      var ret = util.format.apply(str, arr);
      expect(ret).to.have.string(arr[0]);
      expect(ret).to.have.string(arr[1]);
      expect(ret.length).to.be.above(arr[0].length+arr[1].length);
    });
  });
  describe('.hasKeys', function() {
    it('should determine if an array or object has keys', function() {
      expect(util.hasKeys(arr)).to.be.ok;
      expect(util.hasKeys([])).to.not.be.ok;
      expect(util.hasKeys(obj)).to.be.ok;
      expect(util.hasKeys({})).to.not.be.ok;
    });
  });
  describe('.isArray', function() {
    it('should identify arrays', function() {
      expect(util.isArray(arr)).to.be.ok;
    });
    it('should not identify other objects', function() {
      expect(util.isArray({})).to.not.be.ok;
      expect(util.isArray()).to.not.be.ok;
      expect(util.isArray(null)).to.not.be.ok;
      expect(util.isArray(undefined)).to.not.be.ok;
      expect(util.isArray('array')).to.not.be.ok;
      expect(util.isArray(true)).to.not.be.ok;
      expect(util.isArray(1)).to.not.be.ok;
      expect(util.isArray({forEach:function(){}})).to.not.be.ok;
      expect(util.isArray(arguments)).to.not.be.ok;
      expect(util.isArray({length:0})).to.not.be.ok;
    });
  });
  describe('.isArrayLike', function() {
    it('should identify arrays and array-like objects', function() {
      expect(util.isArrayLike(arr)).to.be.ok;
      expect(util.isArrayLike(arguments)).to.be.ok;
      expect(util.isArrayLike({length:0})).to.be.ok;
    });
    it('should not identify other objects', function() {
      expect(util.isArrayLike({})).to.not.be.ok;
      expect(util.isArrayLike()).to.not.be.ok;
      expect(util.isArrayLike(null)).to.not.be.ok;
      expect(util.isArrayLike(undefined)).to.not.be.ok;
      expect(util.isArrayLike('array')).to.not.be.ok;
      expect(util.isArrayLike(true)).to.not.be.ok;
      expect(util.isArrayLike(1)).to.not.be.ok;
      expect(util.isArrayLike({forEach:function(){}})).to.not.be.ok;
    });
  });
  describe('.isObject', function() {
    it('should not identify null', function() {
      expect(util.isObject(null)).to.not.be.ok;
    });
    it('should identify any other type of object', function() {
      expect(util.isObject({})).to.be.ok;
      expect(util.isObject([])).to.be.ok;
      expect(util.isObject(window)).to.be.ok;
      expect(util.isObject(arguments)).to.be.ok;
    });
  });
  describe('.keys', function() {
    it('should provide the indices for an array', function() {
      expect(util.keys(arr).length).to.equal(arr.length);
    });
    it('should provide the keys for an object', function() {
      var keys = util.keys(obj),
          count = 0,
          key;
      for ( key in obj ) {
        if ( obj.hasOwnProperty(key) ) {
          count++;
          expect(keys).to.contain(key);
        }
      }
      expect(keys.length).to.equal(count);
    });
  });
  describe('.map', function() {
    it('should map an array\'s values onto a new array', function() {
      var arr3 = util.map(arr, function(value) {
        if ( typeof value === 'number' ) {
          return value + 1;
        }
      });
      expect(arr3).to.not.deep.equal(arr);
      expect(arr3.length).to.equal(arr.length);
    });
    it('should map an object\'s values onto a new object', function() {
      var obj3 = util.map(obj, function(value) {
        if ( typeof value === 'number' ) {
          return value + 1;
        }
      });
      expect(obj3).to.not.deep.equal(obj);
      expect(Object.keys(obj3).length).to.equal(Object.keys(obj).length);
    });
  });
  describe('.object', function() {
    it('should create an object with extended methods', function() {
      var obj3 = util.object();
      obj3.key = true;
      expect(obj3.clone()).to.not.equal(obj3);
      expect(obj3.clone().clone).to.be.a('function');
      expect(util.isArray(obj3)).to.not.be.ok;
      expect(util.isArrayLike(obj3)).to.not.be.ok;
      expect(util.isObject(obj3)).to.be.ok;
      expect(obj3.keys().length).to.equal(1);
    });
    it('should allow providing a default object', function() {
      var obj3 = util.object(obj);
      console.log(obj3, obj);
      expect(obj3.keys().length).to.equal(Object.keys(obj).length);
      expect(obj3).to.not.equal(obj);
      expect(obj3.toObject()).to.deep.equal(obj);
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
    it('should reduce an array down to a single value', function() {
      var value = util.reduce(arr, function(sum, item) {
        if ( typeof item === 'number' ) {
          sum += item;
        }
        return sum;
      }, 0);
      expect(value).to.be.above(0);
    });
    it('should reduce an object down to a single value', function() {
      var value = util.reduce(obj, function(sum, item) {
        if ( typeof item === 'number' ) {
          sum += item;
        }
        return sum;
      }, 0);
      expect(value).to.be.above(0);
    });
    it('should act to combine map and filter with arrays', function() {
      var arr3 = util.reduce(arr, function(value, item) {
        if ( typeof item === 'number' ) {
          value.push(item+1);
        }
        return value;
      }, []);
      expect(arr3.length).to.be.below(arr.length);
      expect(arr3.length).to.be.above(0);
      var value = util.reduce(arr3, function(sum, item) {
        return sum = sum + item;
      }, 0);
      expect(value).to.be.above(0);
    });
    it('should act to combine map and filter with objects', function() {
      var obj3 = util.reduce(obj, function(value, item, key) {
        if ( typeof item === 'number' ) {
          value[key] = item+1;
        }
        return value;
      }, {});
      expect(Object.keys(obj3).length).to.be.below(Object.keys(obj).length);
      expect(Object.keys(obj3).length).to.be.above(0);
      var value = util.reduce(obj3, function(sum, item) {
        return sum = sum + item;
      }, 0);
      expect(value).to.be.above(0);
    });
  });
  describe('.reverse', function() {
    it('should reverse the order of an array', function() {
      expect(util.reverse([1,2,3])).to.deep.equal([3,2,1]);
    });
  });
});
