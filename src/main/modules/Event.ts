/// <reference path="../../../node_modules/@types/createjs/index.d.ts" />
/// <reference path="../../../node_modules/@types/node/index.d.ts" />
/// <reference path="../../../node_modules/@types/bluebird-global/index.d.ts" />
import * as events from 'events';
import Page from './Page';
import * as Promise from 'bluebird';

export default class Event extends events.EventEmitter {

  page: Page;
  ordinal: number;
  eventFunction: (container: createjs.Container, page: Page, resolve: () => void) => void;

  constructor(page: Page, ordinal: number, eventFunction: (container: createjs.Container, page: Page, resolve: () => void) => void) {
    super();
    this.page = page;
    this.ordinal = ordinal;
    this.eventFunction = eventFunction;
  }

  play(): Promise<any> {
    var event = this;
    return new Promise(function(resolve) {
      event.eventFunction(event.page.container, event.page, resolve);
    });
  }
}
