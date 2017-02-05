/// <reference path="../../../node_modules/@types/createjs/index.d.ts" />

var CreateJsUtil = {

  sortFunction: function(obj1: createjs.DisplayObject, obj2: createjs.DisplayObject): number {
		 if ((<any>obj1).index > (<any>obj2).index) { return 1; }
		 if ((<any>obj1).index < (<any>obj2).index) { return -1; }
		 return 0;
	}

};

export default CreateJsUtil;
