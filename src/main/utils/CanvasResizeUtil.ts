var CanvasResizeUtil = {
  resize: function(canvas: HTMLCanvasElement): void {
    canvas.style.position = 'fixed';
		canvas.style.top = '0';
		canvas.style.left = '0';
		canvas.style.bottom = '0';
		canvas.style.right = '0';
		canvas.style.margin = 'auto';

		var width = window.innerWidth;
    var height = window.innerHeight;

		var screenRatio = height/width;
		var canvasRatio = canvas.height/canvas.width;

		if(screenRatio <= canvasRatio) {
			width = height / canvasRatio;
		} else {
			height = width * canvasRatio;
		}

		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';
  }
};

export default CanvasResizeUtil;
