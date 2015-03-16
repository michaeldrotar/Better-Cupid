describe('bc.util', function() {
  describe('array functions', function() {
    var arr, arr2;
    beforeEach(function() {
      arr = [1,2,'red','blue',true,false,undefined];
      arr2 = [function(){},{one:'fish',two:'fish'}];
    })
    describe('.cloneArray', function() {
      it('should create a duplicate of the array itself', function() {
        var arr2 = bc.cloneArray(arr);
        expect(arr2).to.deep.equal(arr);
        expect(arr2).to.not.equal(arr);
      });
    });
    describe('.concat', function() {
      it('should join multiple arrays together', function() {
        var arr3 = bc.concat(arr, arr2);
        expect(arr3.length).to.equal(arr.length+arr2.length);
      });
      it('should add non-array arguments to the final array', function() {
        var arr3 = bc.concat('one', [1,2,3], undefined, false, [['inner','array']]);
        expect(arr3.length).to.equal(7);
      });
    });
    describe('.forEachArray', function() {
      it('should iterate each member of an array', function() {
        var count = 0;
        bc.forEachArray(arr, function(value) {
          count++;
        });
        expect(count).to.equal(arr.length);
      });
      it('should abort if a value is returned and provide the value', function() {
        var count = 0;
        var ret = bc.forEachArray(arr, function(value) {
          count++;
          return 'test';
        });
        expect(count).to.equal(1);
        expect(ret).to.equal('test');
      });
    });
    describe('.isArray', function() {
      it('should identify arrays', function() {
        expect(bc.isArray(arr)).to.be.true;
      });
      it('should not identify other objects', function() {
        expect(bc.isArray({})).to.be.false;
        expect(bc.isArray()).to.be.false;
        expect(bc.isArray(null)).to.be.false;
        expect(bc.isArray(undefined)).to.be.false;
        expect(bc.isArray('array')).to.be.false;
        expect(bc.isArray(true)).to.be.false;
        expect(bc.isArray(1)).to.be.false;
        expect(bc.isArray({forEach:function(){}})).to.be.false;
      });
    });
  });
});
