import Novent from './modules/Novent';

export default class NoventEngine {

  private _novent: Novent;

  novent(height?:number, width?: number, init?: (stage: any, novent: Novent) => void): Novent {
    if(height && width) {
      this._novent = new Novent(height, width, init);
    }

    return this._novent;
  }

}
