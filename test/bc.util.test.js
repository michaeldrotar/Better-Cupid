describe('bc.util', function() {
  var util = bc.util;
  var arr, arr2, obj, obj2, str, str2;
  beforeEach(function() {
    arr = ['Disneyland','Mickey',1,2,true,false,undefined];
    arr2 = [function(){},{one:'fish',two:'fish'}];
    obj = {name:'bob',age:32,children:['mary','sue']};
    obj2 = {name:'beth',age:45,married:false};
    str = 'Hello {1}, welcome to {0}!';
    str2 = '{name} is {age} years old';
  });


  describe('.clone', function() {
    it('should create a duplicate of everything', function() {
      var majorObject = {
            obj: obj,
            arr: arr
          },
          clonedObject = util.clone(majorObject);
      expect(clonedObject).to.deep.equal(majorObject);
      expect(clonedObject).to.not.equal(majorObject);
    });
  });
  describe('.cloneArray', function() {
    it('should create a duplicate of the array itself', function() {
      var arr2 = util.cloneArray(arr);
      expect(arr2).to.deep.equal(arr);
      expect(arr2).to.not.equal(arr);
    });
  });
  describe('.cloneObject', function() {
    it('should create a duplicate of the object itself', function() {
      var obj2 = util.cloneObject(obj);
      expect(obj2).to.deep.equal(obj);
      expect(obj2).to.not.equal(obj);
      expect(obj2.children).to.equal(obj.children);
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
  describe('.forEach', function() {
    it('should work with arrays', function() {
      var count = 0;
      util.forEachArray(arr, function(value) {
        count++;
      });
      expect(count).to.equal(arr.length);
    });
    it('should work with objects', function() {
      var count = 0;
      util.forEachObject(obj, function(value) {
        count++;
      });
      expect(count).to.equal(Object.keys(obj).length);
    });
  });
  describe('.forEachArray', function() {
    it('should iterate each member of an array', function() {
      var count = 0;
      util.forEachArray(arr, function(value) {
        count++;
      });
      expect(count).to.equal(arr.length);
    });
    it('should abort if a value is returned and provide the value', function() {
      var count = 0;
      var ret = util.forEachArray(arr, function(value) {
        count++;
        return 'test';
      });
      expect(count).to.equal(1);
      expect(ret).to.equal('test');
    });
  });
  describe('.forEachObject', function() {
    it('should iterate each member of an object', function() {
      var count = 0;
      util.forEachObject(obj, function(value) {
        count++;
      });
      expect(count).to.equal(Object.keys(obj).length);
    });
    it('should abort if a value is returned and provide the value', function() {
      var count = 0;
      var ret = util.forEachObject(obj, function(value) {
        count++;
        return 'test';
      });
      expect(count).to.equal(1);
      expect(ret).to.equal('test');
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
    });
  });
});
