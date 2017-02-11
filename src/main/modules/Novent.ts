/// <reference path="../../../node_modules/@types/createjs/index.d.ts" />
/// <reference path="../../../node_modules/@types/node/index.d.ts" />
/// <reference path="../../../node_modules/@types/bluebird-global/index.d.ts" />
import MissingCanvasTagException from '../exceptions/MissingCanvasTagException';
import CanvasResizeUtil from '../utils/CanvasResizeUtil';
import Page from './Page';
import * as events from 'events';
import * as Promise from 'bluebird';

export default class Novent extends events.EventEmitter {

  height: number;
  width: number;
  init: (stage: any, novent: Novent) => void;
  canvas: HTMLCanvasElement;
  stage: createjs.Stage;
  pages: Array<Page>;
  index: number;
  playPromise: Promise<any>;
  scope: Object;
  loadPromise: Promise<any>;

  constructor(height:number, width: number, init: (stage: createjs.Stage, novent: Novent) => void) {
    super();
    this.canvas = document.getElementsByTagName('canvas')[0];
    if(!this.canvas)
      throw new MissingCanvasTagException();
    this.height = this.canvas.height = height;
    this.width = this.canvas.width = width;
    this.init = init;
    this.stage = new createjs.Stage(this.canvas);
    this.pages = [];
    this.index = 0;
    this.scope = {};
    this.loadPromise = null;
    this.playPromise = null;

    this._init();
  }

  page(ordinal: number, name?: string, materials?: Object, init?: (container: createjs.Container, page: Page) => void): Page {
    if(ordinal !== undefined && ordinal !== null) {
      if(name)
        this.pages[ordinal] = new Page(this, ordinal, name, materials, init);

      return this.pages[ordinal];
    }

    return null;
  }

  load(ordinal?: number): Promise<any> {
    var novent = this;

    if(ordinal === undefined || ordinal === null || ordinal < 0 || ordinal >= novent.pages.length)
      ordinal = novent.index;

    if(!novent.loadPromise) {
      novent.loadPromise = novent.page(ordinal).load();

      var loadIndex: number = ordinal;
      for(var i = loadIndex + 1; i < novent.pages.length; i++) {
        novent.loadPromise = novent.loadPromise.then(function() {
          loadIndex++;
          return novent.page(loadIndex).load();
        });
      }

      novent.loadPromise.then(function() {
        return novent.emit('loaded');
      });
    }

    return novent.loadPromise;
  }

  play(): Promise<any> {
    var novent = this;
    if(!novent.playPromise) {
      if(novent.index !== novent.pages.length) {
        novent.playPromise = novent.page(novent.index).play()
        .then(function() {
          novent.playPromise = null;
          if(novent.page(novent.index).complete) {
            novent.index++;
            if(novent.index === novent.pages.length) {
              novent.emit('complete');
            } else {
              return novent.play();
            }
          }
          return null;
        });
      } else {
        novent.playPromise = Promise.resolve();
      }
    }

    return novent.playPromise;
  }

  eventCount(): number {
    var eventCount = 0;
    for(var i = 0; i < this.pages.length; i++) {
      eventCount += + this.page(i).events.length;
    }

    return eventCount;
  }

  loadProgress(): number {
    var progress = 0;
    for(var i = 0; i < this.pages.length; i++) {
      progress = progress + (this.page(i).loadQueue.progress*this.page(i).events.length)/this.eventCount();
    }

    return progress;
  }

  progress(): number {
    var readEvents = 0;

    for(var i = 0; i < this.pages.length; i++) {
      for(var j = 0; j < this.page(i).index; j++) {
        readEvents++;
      }
    }

    return readEvents/this.eventCount();
  }

  private _init(): void {
    var novent = this;
    createjs.Ticker.setFPS(30);
		createjs.Ticker.addEventListener('tick', this.stage);

    if(this.init)
      this.init(this.stage, this);

    window.onresize = function() {
  	   CanvasResizeUtil.resize(novent.canvas);
  	};

  	CanvasResizeUtil.resize(novent.canvas);
  }
}
