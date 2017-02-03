export default class Novent {

  height: number;
  width: number;
  init: (stage: any, novent: Novent) => void;

  constructor(height:number, width: number, init: (stage: any, novent: Novent) => void) {
    this.height = height;
    this.width = width;
    this.init = init;
  }

}
