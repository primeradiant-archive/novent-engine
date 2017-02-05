import NoventEngine from '../../src/main/NoventEngine';
import Novent from '../../src/main/modules/Novent';
import { expect } from 'chai';
import {} from 'mocha';

var noventEngine = new NoventEngine();

describe('NoventEngine', function() {

    it('should be instantiated', function() {
       var noventEngine = new NoventEngine();
       expect(noventEngine).to.exist;
    });

    describe('novent', function() {

      var noventEngine;

      beforeEach(function() {
        noventEngine = new NoventEngine();
      });

      it('should not be instantiated with NoventEngine', function() {
        expect(noventEngine.novent()).to.not.exist;
      });

      it('should instantiate novent property', function() {
        var canvas = document.createElement("CANVAS");
        document.body.appendChild(canvas);

        var init = function() {console.log('test');};
        var novent = noventEngine.novent(1, 2, init);

        expect(novent).to.exist;
        expect(novent instanceof Novent).to.be.true;
        expect(novent.height).to.equal(1);
        expect(novent.width).to.equal(2);
        expect(novent.init).to.equal(init);
      });

      it('should return instantiated novent', function() {
        var canvas = document.createElement("CANVAS");
        document.body.appendChild(canvas);

        var novent = noventEngine.novent(1, 2);
        expect(noventEngine.novent()).to.equal(novent);
      });

    });
});
