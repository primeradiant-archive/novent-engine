/// <reference path="../node_modules/@types/createjs/index.d.ts" />
import NoventEngine from './main/NoventEngine';

createjs.Sound.alternateExtensions = ['mp3'];
(<any>window).NoventEngine = (<any>window).NoventEngine || new NoventEngine();
