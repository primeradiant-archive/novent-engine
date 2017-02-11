import Novent from '../../../src/main/modules/Novent';
import MissingCanvasTagException from '../../../src/main/exceptions/MissingCanvasTagException';
import * as chai from 'chai';
import * as chaispies from 'chai-spies';
import {} from 'mocha';

chai.use(chaispies);
const expect = chai.expect;
const spy = chai.spy;


describe('Novent', function() {
  describe('constructor', function() {
    it('should throw error when there is no canvas tag in page', function() {
      var newNovent = function() {
        new Novent(1, 1, null);
      }

      expect(newNovent).to.throw(MissingCanvasTagException);
    });

    it('should instantiate canvas with first canvas in page', function() {
      var firstCanvas = document.createElement("CANVAS");
      firstCanvas.className = 'first-canvas';
      document.body.appendChild(firstCanvas);

      var secondCanvas = document.createElement("CANVAS");
      secondCanvas.className = 'second-canvas';
      document.body.appendChild(secondCanvas);

      var novent = new Novent(1, 2, null);

      expect(novent.canvas).to.eql(firstCanvas);
      expect(novent.canvas.height).to.eql(1);
      expect(novent.canvas.width).to.eql(2);
      expect(novent.stage).to.exist;
      expect(novent.pages).to.eql([]);
      expect(novent.index).to.eql(0);
      expect(novent.scope).to.eql({});
    });
  });

  describe('page', function() {
    var novent;

    beforeEach(function() {
      var firstCanvas = document.createElement("CANVAS");
      firstCanvas.className = 'first-canvas';
      document.body.appendChild(firstCanvas);

      novent = new Novent(1, 1, null);
    });

    it('should create a new page when given name and ordinal', function() {
      var page = novent.page(0, 'Novent name');

      expect(page).to.exist;
      expect(page.ordinal).to.eql(0);
      expect(page.name).to.eql('Novent name');
    });

    it('should create page at given ordinal', function() {
      var page = novent.page(16, 'Novent name');

      expect(novent.pages.length).to.eql(17);
      expect(novent.pages[16]).to.eql(page);
    });

    it('should return the given ordinal page', function() {
      var page = novent.page(0, 'Novent name');

      expect(novent.page(0)).to.eql(page);
      expect(novent.page(1)).to.not.exist;
    });
  });

  describe('load', function() {
    var novent;

    beforeEach(function() {
      var firstCanvas = document.createElement("CANVAS");
      firstCanvas.className = 'first-canvas';
      document.body.appendChild(firstCanvas);

      novent = new Novent(1, 1, null);
    });

    it('should load the given ordinal page', function(done) {
      var page = novent.page(10, 'Novent name');
      page.load = spy(page.load);

      novent.load(10)
      .then(function() {
        expect(page.load).to.have.been.called();
        done();
      });
    });

    it('should load the first page when given no ordinal', function(done) {
      var page = novent.page(0, 'Novent name');
      page.load = spy(page.load);

      novent.load()
      .then(function() {
        expect(page.load).to.have.been.called();
        done();
      });
    });

    it('should load the given ordinal page', function(done) {
      var page = novent.page(10, 'Novent name');
      page.load = spy(page.load);

      novent.load(10)
      .then(function() {
        expect(page.load).to.have.been.called();
        done();
      });
    });

    it('should emit loaded event', function(done) {
      var page = novent.page(10, 'Novent name');
      novent.emit = spy(novent.emit);

      novent.load(10)
      .then(function() {
        expect(novent.emit).to.have.been.called.with('loaded');
        done();
      });
    });

    it('should load one page after the other', function(done) {
      var page0 = novent.page(0, 'Novent name');
      var page1 = novent.page(1, 'Novent name');
      var page2 = novent.page(2, 'Novent name');
      var page3 = novent.page(3, 'Novent name');
      novent.load = spy(novent.load);
      page0.load = spy(page0.load);
      page1.load = spy(page1.load);
      page2.load = spy(page2.load);
      page3.load = spy(page3.load);

      novent.load(1)
      .then(function() {
        expect(page0.load).to.not.have.been.called();
        expect(page1.load).to.have.been.called();
        expect(page2.load).to.have.been.called();
        expect(page3.load).to.have.been.called();
        done();
      });
    });
  });

  describe('read', function() {
    var novent;

    beforeEach(function() {
      var firstCanvas = document.createElement("CANVAS");
      firstCanvas.className = 'first-canvas';
      document.body.appendChild(firstCanvas);

      novent = new Novent(1, 1, null);
    });

    it('should play page event', function(done) {
      var pageInit = function() {console.log('page init');};
      var eventFunction = function(container, page, resolve) {console.log('event'); resolve();};
      var page = novent.page(0, 'Novent name', pageInit);
      var event = page.event(0, eventFunction);

      page.play = spy(page.play);
      page.init = spy(page.init);
      page._init = spy(page._init);
      event.play = spy(event.play);
      event.eventFunction = spy(event.eventFunction);

      novent.play()
      .then(function() {
        expect(page.play).to.have.been.called();
        expect(event.play).to.have.been.called();
        expect(page.init).to.have.been.called();
        expect(page._init).to.have.been.called();
        expect(event.eventFunction).to.have.been.called();
        done();
      });
    });

    it('should play next event', function(done) {
      var pageInit = function() {console.log('page init');};
      var eventFunction = function(container, page, resolve) {console.log('event'); resolve();};
      var page = novent.page(0, 'Novent name', pageInit);
      var event1 = page.event(0, eventFunction);
      var event2 = page.event(1, eventFunction);

      page.play = spy(page.play);
      event2.play = spy(event2.play);
      event2.eventFunction = spy(event2.eventFunction);

      novent.play()
      .then(function() {
        novent.play()
        .then(function() {
          expect(page.play).to.have.been.called();
          expect(event2.play).to.have.been.called();
          expect(event2.eventFunction).to.have.been.called();
          done();
        });
      });
    });

    it('should play next page first event', function(done) {
      var pageInit = function() {console.log('page init');};
      var eventFunction = function(container, page, resolve) {console.log('event'); resolve();};
      var page1 = novent.page(0, 'Novent name', pageInit);
      var event1 = page1.event(0, eventFunction);
      var event2 = page1.event(1, eventFunction);

      var page2 = novent.page(1, 'Novent name', pageInit);
      var event3 = page2.event(0, eventFunction);

      page2.play = spy(page2.play);
      page2.init = spy(page2.init);
      page2._init = spy(page2._init);
      event3.play = spy(event3.play);
      event3.eventFunction = spy(event3.eventFunction);

      novent.play()
      .then(function() {
        novent.play()
        .then(function() {
          expect(page2.play).to.have.been.called();
          expect(page2.init).to.have.been.called();
          expect(page2._init).to.have.been.called();
          expect(event3.play).to.have.been.called();
          expect(event3.eventFunction).to.have.been.called();
          done();
        });
      });
    });

  });
});
