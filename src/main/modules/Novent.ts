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
  waiting: boolean;
  scope: Object;
  loading: boolean;

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
    this.waiting = true;
    this.scope = {};
    this.loading = false;

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

    if(ordinal === undefined || ordinal === null)
      ordinal = this.index;

    if(!novent.loading && ordinal >= 0 && ordinal < this.pages.length) {
      novent.loading = true;
      return novent.page(ordinal).load()
      .then(function() {
        novent.loading = false;
        if(ordinal !== novent.pages.length - 1) {
          return novent.load(ordinal + 1);
        } else {
          novent.emit('loaded');
        }
        return null;
      });
    } else {
      return Promise.resolve();
    }
  }

  play(): Promise<any> {
    var novent = this;
    if(novent.waiting && novent.index !== novent.pages.length) {
      novent.waiting = false;
      return novent.page(novent.index).play()
      .then(function() {
        novent.waiting = true;
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
    }

    return Promise.resolve();
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
