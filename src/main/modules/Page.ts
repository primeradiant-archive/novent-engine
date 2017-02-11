/// <reference path="../../../node_modules/@types/createjs/index.d.ts" />
/// <reference path="../../../node_modules/@types/node/index.d.ts" />
/// <reference path="../../../node_modules/@types/bluebird-global/index.d.ts" />
import Novent from './Novent';
import Event from './Event';
import * as events from 'events';
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
  loadQueue: createjs.LoadQueue;
  loadPromise: Promise<any>;
  lib: Object;
  scope: Object;
  events: Array<Event>;
  index: number;
  playPromise: Promise<any>;

  constructor(novent: Novent, ordinal: number, name: string, materials: Object, init?: (container: createjs.Container, page: Page) => void) {
    super();
    var page = this;
    page.novent = novent;
    page.ordinal = ordinal;
    page.name = name;
    page.materials = materials;
    page.init = init;
    page.complete = false;
    page.container = new createjs.Container();
    page.lib = {};
    page.scope = {};
    page.events = [];
    page.index = 0;
    page.playPromise = null;
    page.loadQueue = new createjs.LoadQueue(true);
    page.loadQueue.setPaused(true);
		page.loadQueue.installPlugin(createjs.Sound);
    page.playPromise = null;

    page.loadQueue.on('fileload', function(event: any) {
			page.lib[event.item.id] = event.result;
		});

    page.loadQueue.on('complete', function() {
      page.emit('loaded');
    });

    page.loadQueue.on('error', function() {
      page.emit('loadError');
    });

    page.loadQueue.on('fileerror', function() {
      page.emit('loadError');
    });
  }

  event(ordinal: number, eventFunction: (container: createjs.Container, page: Page, resolve: () => void) => void): Event {
    this.events[ordinal] = new Event(this, ordinal, eventFunction);
    return this.events[ordinal];
  }

  load(): Promise<any> {
    var page = this;
    if(!page.loadPromise) {
      if(this.materials && Object.keys(this.materials).length !== 0) {
        page.loadPromise = new Promise(function(resolve, reject) {
          page.loadQueue.on('complete', resolve);
          page.loadQueue.on('error', reject);
      		page.loadQueue.on('fileerror', reject);
        });

        for(var key in page.materials) {
          if (page.materials.hasOwnProperty(key))
             page.loadQueue.loadFile({id:key, src: page.materials[key], loadNow: false});
        }

        page.loadQueue.load();
      } else {
        page.loadQueue.progress = 1;
    		page.loadQueue.dispatchEvent('progress');
    		page.loadQueue.dispatchEvent('complete');
    		page.emit('loaded');

        page.loadPromise = Promise.resolve();
      }
    }

    return page.loadPromise;
  }

  play(): Promise<any> {
    var page = this;

    if(!page.playPromise) {
      if(page.index !== page.events.length) {
        if(page.index === 0) {
          page.playPromise = page.load()
          .then(function() {
            page._init();
            return page.events[page.index].play();
          })
          .then(function() {
            page.index++;
            page.playPromise = null;
            if(page.index === page.events.length) {
              page.complete = true;
              page.emit('complete');
            }
          });
        } else {
          page.playPromise = page.events[page.index].play()
          .then(function() {
            page.index++;
            page.playPromise = null;
            if(page.index === page.events.length) {
              page.complete = true;
              page.emit('complete');
            }
          });
        }
      } else {
        page.playPromise = Promise.resolve();
      }
    }

    return page.playPromise;
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
