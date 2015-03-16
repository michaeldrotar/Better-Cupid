describe('bc.util', function() {
  var util = bc.util;
  describe('array functions', function() {
    var arr, arr2;
    beforeEach(function() {
      arr = [1,2,'red','blue',true,false,undefined];
      arr2 = [function(){},{one:'fish',two:'fish'}];
    })
    describe('.cloneArray', function() {
      it('should create a duplicate of the array itself', function() {
        var arr2 = util.cloneArray(arr);
        expect(arr2).to.deep.equal(arr);
        expect(arr2).to.not.equal(arr);
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
    describe('.isArray', function() {
      it('should identify arrays', function() {
        expect(util.isArray(arr)).to.be.true;
      });
      it('should not identify other objects', function() {
        expect(util.isArray({})).to.be.false;
        expect(util.isArray()).to.be.false;
        expect(util.isArray(null)).to.be.false;
        expect(util.isArray(undefined)).to.be.false;
        expect(util.isArray('array')).to.be.false;
        expect(util.isArray(true)).to.be.false;
        expect(util.isArray(1)).to.be.false;
        expect(util.isArray({forEach:function(){}})).to.be.false;
      });
    });
  });
  describe('string functions', function() {
    var str, str2, obj, arr;
    beforeEach(function() {
      str = 'Hello {1}, welcome to {0}!';
      str2 = 'The {object} has {color} {parts}';
      arr = [ 'Disneyland', 'Mickey' ];
      obj = { object: 'car', color: 'blue', parts: 'tires' };
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
          expect(ret).to.have.string(obj[k]);
          length += obj[k].length;
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
  });
});
