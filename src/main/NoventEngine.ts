import Novent from './modules/Novent';

export default class NoventEngine {

  private n: Novent;

  novent(height:number, width: number, init: (stage: any, novent: Novent) => void): Novent {
    if(height && width) {
      this.n = new Novent(height, width, init);
    }

    return this.n;
  }

}
