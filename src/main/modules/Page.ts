/// <reference path="../../../node_modules/@types/createjs/index.d.ts" />
/// <reference path="../../../node_modules/@types/node/index.d.ts" />
/// <reference path="../../../node_modules/@types/bluebird-global/index.d.ts" />
import Novent from './Novent';
import Event from './Event';
import * as events from 'events';
import PageLoadUtil from '../utils/PageLoadUtil';
import CreateJsUtil from '../utils/CreateJsUtil';
import * as Promise from 'bluebird';

export default class Page extends events.EventEmitter {

  novent: Novent;
  ordinal: number;
  name: string;
  materials: Object;
  init: (container: createjs.Container, page: Page) => void;
  complete: boolean;
  container: createjs.Container;
  loading: boolean;
  loadQueue: createjs.LoadQueue;
  lib: Object;
  scope: Object;
  events: Array<Event>;
  index: number;
  waiting: boolean;

  constructor(novent: Novent, ordinal: number, name: string, materials: Object, init?: (container: createjs.Container, page: Page) => void) {
    super();
    this.novent = novent;
    this.ordinal = ordinal;
    this.name = name;
    this.materials = materials;
    this.init = init;
    this.complete = false;
    this.container = new createjs.Container();
    this.loading = false;
    this.lib = {};
    this.scope = {};
    this.events = [];
    this.index = 0;
    this.waiting = true;
  }

  event(ordinal: number, eventFunction: (container: createjs.Container, page: Page, resolve: () => void) => void): Event {
    this.events[ordinal] = new Event(this, ordinal, eventFunction);
    return this.events[ordinal];
  }

  load(): Promise<any> {
    if(this.materials && Object.keys(this.materials).length !== 0) {
      return PageLoadUtil.nonEmptyLoadQueuePromise(this);
    } else {
      return PageLoadUtil.emptyLoadQueuePromise(this);
    }
  }

  play(): Promise<any> {
    var page = this;

    if(page.waiting && page.index !== page.events.length) {
      page.waiting = false;
      var promise;
      if(page.index === 0) {
        return page.load()
        .then(function() {
          page._init();
          return page.events[page.index].play();
        })
        .then(function() {
          page.index++;
          page.waiting = true;
          if(page.index === page.events.length) {
            page.complete = true;
            page.emit('complete');
          }
        });
      } else {
        return page.events[page.index].play()
        .then(function() {
          page.index++;
          page.waiting = true;
          if(page.index === page.events.length) {
            page.complete = true;
            page.emit('complete');
          }
        });
      }
    }

    return Promise.resolve();
  }

  private _init(): void {
    if(this.init)
			this.init(this.container, this);

    this.container.sortChildren(CreateJsUtil.sortFunction);
  	this.novent.stage.addChild(this.container);
    if(this.novent.index > 0)
				this.novent.stage.removeChild(this.novent.pages[this.ordinal - 1].container);
  }
}
