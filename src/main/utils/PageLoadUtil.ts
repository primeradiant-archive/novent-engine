/// <reference path="../../../node_modules/@types/createjs/index.d.ts" />
/// <reference path="../../../node_modules/@types/node/index.d.ts" />
/// <reference path="../../../node_modules/@types/bluebird-global/index.d.ts" />
import Page from '../modules/Page';
import * as Promise from 'bluebird';

var PageLoadUtil = {

  createAndPopulateLoadQueue: function(page: Page): createjs.LoadQueue {
    page.loading = true;
    var loadQueue = new createjs.LoadQueue(true);
		loadQueue.installPlugin(createjs.Sound);

    for(var key in page.materials) {
      if (page.materials.hasOwnProperty(key))
			   loadQueue.loadFile({id:key, src: page.materials[key]});
		}

    loadQueue.on('fileload', function(event: any) {
			page.lib[event.item.id] = event.result;
		});

    loadQueue.on('complete', function() {
      page.loading = false;
      page.emit('loaded');
    });

    loadQueue.on('error', function(event) {
      page.loading = false;
      page.emit('loadError');
    });

    loadQueue.on('fileerror', function(event) {
      page.loading = false;
      page.emit('loadError');
    });

    return loadQueue;
  },

  nonEmptyLoadQueuePromise: function(page: Page): Promise<any> {
    return new Promise(function(resolve, reject) {
      if(!page.loading) {
        page.loadQueue = PageLoadUtil.createAndPopulateLoadQueue(page);
      }

      if(page.loadQueue.loaded)
        resolve();

      page.loadQueue.on('complete', resolve);
      page.loadQueue.on('error', reject);
  		page.loadQueue.on('fileerror', reject);

      page.loadQueue.load();
    });
  },

  emptyLoadQueuePromise: function(page: Page): Promise<any> {
    page.loadQueue = new createjs.LoadQueue(true);
    page.loadQueue.progress = 1;
		page.loadQueue.dispatchEvent('progress');
		page.loadQueue.dispatchEvent('complete');
		page.emit('loaded');

    return Promise.resolve();
  }

};

export default PageLoadUtil;
