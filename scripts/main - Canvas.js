function onResizeCanvas()
{
	var canvas = document.getElementById("designer");
	var toolbar = document.getElementById("toolbar");	
	
	//create a temporary hidden canvas
	var inMemCanvas = document.createElement('canvas');
	var inMemCtx = inMemCanvas.getContext('2d');
	
	//copy the canvas befor resizing
	inMemCanvas.width = canvas.width;
	inMemCanvas.height = canvas.height;
	inMemCtx.drawImage(canvas, 0, 0);
	
	//resize the canvas
	canvas.width = window.innerWidth-toolbar.clientWidth-68;
	canvas.height = toolbar.clientHeight - 120;
	
	//redraw the original canvas
	var ctx = canvas.getContext("2d");
	ctx.drawImage(inMemCanvas,0,0);
}

function isCanvasBlank(canvas) {
var blank = document.createElement('canvas');
blank.width = canvas.width;
blank.height = canvas.height;

return canvas.toDataURL() == blank.toDataURL();
}

function allowDrop(ev) {
	ev.preventDefault();
}

function drag(ev) {
	ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	var ctx = ev.target.getContext("2d");
	var img = document.getElementById(data);
	//ctx.drawSvg(img.src, 50, 10, img.width, img.height);
	var x = ev.clientX - ev.target.getBoundingClientRect().left;
	var y = ev.clientY - ev.target.getBoundingClientRect().top;
	ctx.drawImage(img, x, y, 75, 25);
}