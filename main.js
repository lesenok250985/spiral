
var self = window; 
 
(function(self) {
		
	var canvas, context, dots = [], dirtyRegion = null, mouse = { fromX: innerWidth * 0.5, fromY: innerHeight * 0.5, toX: innerWidth * 0.5, toY: innerHeight * 0.5 }, rect = { x: 0, y: 0, width: 0, height: 0 }, color = { r: 0, g: 0, b: 0 }, cycle = 0, FPS = 60;

	// Dat GUI default values
	var size = 5, depth = 72, ease = 0.05, stretch = flexibility = 0.5, rotation = dirty = false;
	
	/*
	 * Settings.
	 */
	
	var Settings = function() {
		
		this.size = 5;
		this.depth = 72;
		this.ease = 0.05;
		this.flexibility = 0.5;
		this.rotation = this.dirty = false;
		
		this.changeSize = function(value) {
		
			size = value;
		
		};
		
		this.changeDepth = function(value) {
		
			depth = value;
		
		};
		
		this.changeEase = function(value) {
		
			ease = value;
		
		};
		
		this.changeFlexibility = function(value) {
		
			flexibility = value;
		
		};
		
		this.enableRotation = function(value) {
		
			!rotation ? rotation = true : rotation = false;
		
		};
		
		this.enableDirty = function(value) {
		
			!dirty ? dirty = true : dirty = false;
		
		};
				
	};
	
	/*
 	 * Init.
	 */
	
	function init() {
		
		var settings = new Settings();
		var GUI = new dat.GUI();
		
		// Dat GUI main
		GUI.add(settings, 'size').min(1).max(10).onChange(settings.changeSize);
		GUI.add(settings, 'depth').min(50).max(300).onChange(settings.changeDepth);
		GUI.add(settings, 'ease').min(0.01).max(1).onChange(settings.changeEase);
		GUI.add(settings, 'flexibility').min(0.1).max(0.9).onChange(settings.changeFlexibility);
		GUI.add(settings, 'rotation').onChange(settings.enableRotation);
		GUI.add(settings, 'dirty').onChange(settings.enableDirty);
		
		var body = document.querySelector('body');
		
		canvas = document.createElement('canvas');
					
        canvas.width = innerWidth;
		canvas.height = innerHeight;
				
		canvas.style.position = 'absolute';
		canvas.style.top = 0;
		canvas.style.bottom = 0;
		canvas.style.left = 0;
		canvas.style.right = 0;
		canvas.style.zIndex = -1;
		
		canvas.style.background = '-webkit-radial-gradient(#ffffff, #505050)';
		canvas.style.background = '-moz-radial-gradient(#ffffff, #505050)';
		canvas.style.background = '-ms-radial-gradient(#ffffff, #505050)';
		canvas.style.background = '-o-radial-gradient(#ffffff, #505050)';
		canvas.style.background = 'radial-gradient(#ffffff, #505050)';
       
        body.appendChild(canvas);
		
		// Browser supports canvas?
		if(!!(capable)) {
		
			context = canvas.getContext('2d');
		
			// Events
			'ontouchmove' in window ? canvas.addEventListener('touchmove', onTouchMove, false) : canvas.addEventListener('mousemove', onMouseMove, false);
			
			window.onresize = onResize;
			
			dirtyRegion = new Region();
		
			createDots();
		
		}
		
		else {
		
			console.error("Sorry, your browser doesn't support canvas.");
		
		}
        
	}
	
	/*
	 * Check if browser supports canvas element.
	 */
	
	function capable() {
	
		return canvas.getContext && canvas.getContext('2d');
	
	}
	
	/*
	 * On resize window event.
	 */
	
	function onResize() {
	
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	
	}
	
	/*
	 * Mouse move event.
	 */
	
	function onMouseMove(event) {
	
		event.preventDefault();
	
		mouse.fromX = event.pageX - canvas.offsetLeft;
		mouse.fromY = event.pageY - canvas.offsetTop;
	
	}
	
	/*
	 * Touch move event.
	 */
	
	function onTouchMove(event) {
	
		event.preventDefault();
	
		mouse.fromX = event.touches[0].pageX - canvas.offsetLeft;
		mouse.fromY = event.touches[0].pageY - canvas.offsetTop;
	
	}
	
	/*
	 * Populate the spiral with dots.
	 */
	
	function createDots() {
	
		for(var dot = 0, len = 200; dot < len; dot++) {
					
			dots.push({
				
				x: 0,
				y: 0,
				orbit: 2,
				perspective: dot / depth,
				rotation: 0
				
			});
		}
		
		loop();
	
	}
	
	/*
	 * Loop logic.
	 */
	
	function loop() {
	
		if(!dirty) {
		
			context.clearRect(rect.x, rect.y, rect.width, rect.height);
			
			dirtyRegion.reset();
			
		}
		
		update();
		render();
	
		requestAnimFrame(loop);
		
	}
	
	/*
	 * Update the spiral.
	 */
	
	function update() {
	
		// Steps 30 at once
		var steps = Math.PI * 2 / 30;		        
		var angle = steps;  
		
		// Linear animation
		mouse.toX += (mouse.fromX - mouse.toX - canvas.width / 2) * ease;
		mouse.toY += (mouse.fromY - mouse.toY - canvas.height / 2) * ease;
				
		stretch += (flexibility - stretch) * ease;		
				
		[].forEach.call(dots, function(dot, index) {  

			dot.x = (angle * Math.cos(angle) * dot.orbit) + mouse.toX * stretch;
			dot.y = (angle * Math.sin(angle) * dot.orbit) + mouse.toY * stretch;
			
			dot.perspective += (index / depth - dot.perspective) * ease;				
			dot.rotation += ((!rotation ? index / Math.PI / 180 : index * Math.PI / 180) - dot.rotation) * ease;
			
			angle += steps;      
			
		});
		
		// Clear only dirty region
		dirtyRegion.inflate(mouse.toX + canvas.width / 2, mouse.toY + canvas.height / 2);
		dirtyRegion.expand(10 * 200 * (rotation ? 4 : 1), 10 * 200 * (rotation ? 4 : 1));
			
		rect = dirtyRegion.toRect();
	
	}
	
	/*
	 * Render the spiral.
	 */
	
	function render() {
		
		[].forEach.call(dots, function(dot, index) {  
			
			context.save();
			context.translate(canvas.width / 2, canvas.height / 2);
			context.scale(dot.perspective, dot.perspective);
			context.rotate(dot.rotation);
			context.fillStyle = 'rgb' + '(' + color.r + ', ' + color.g + ', ' + color.b + ')';
			context.beginPath();
			context.arc(dot.x, dot.y, size, 0, Math.PI * 2);
			context.closePath();
			context.fill();
			context.restore();
			
			context.save();
			context.globalAlpha = 0.09;
			context.translate(canvas.width / 2, canvas.height / 2 + 10);
			context.scale(dot.perspective, dot.perspective);
			context.rotate(dot.rotation);
			context.beginPath();
			context.arc(dot.x, dot.y, size, 0, Math.PI * 2);
			context.closePath();
			context.fill();
			context.restore();
			
		});
		
		updateColorCycle();
	
	}
	
	/*
	 * Update color cycle.
	 */
	
	function updateColorCycle() {
	
		cycle = Math.min(cycle + 0.1, 100) !== 100 ? cycle += 0.1 : 0;
		
		color.r = ~~(Math.sin(0.3 * cycle + 0) * 127 + 128);
		color.g = ~~(Math.sin(0.3 * cycle + 2) * 127 + 128);
		color.b = ~~(Math.sin(0.3 * cycle + 4) * 127 + 128);
	
	}
	
	/*
	 * Region area.
	 */
	
	function Region() {
	
		this.left = 999999;
		this.top = 999999;
		this.right = 0;
		this.bottom = 0;
		
	}
	
	/*
	 * Reset the region.
	 */
	
	Region.prototype.reset = function() {	
	
		this.left = 999999; 	
		this.top = 999999; 	
		this.right = 0; 	
		this.bottom = 0; 
		
	};
	
	/*
	 * Inflate the region.
	 */
	
	Region.prototype.inflate = function(x, y) {
	
		this.left = Math.min(this.left, x);
		this.top = Math.min(this.top, y);
		this.right = Math.max(this.right, x);
		this.bottom = Math.max(this.bottom, y);
	
	};

	/*
	 * Expand the region.
	 */
	
	Region.prototype.expand = function(x, y) {	
	
		this.left -= x;	
		this.top -= y;	
		this.right += x;	
		this.bottom += y;
		
	};	
	
	/*
	 * Convert the region in a rectangle.
	 */
	
	Region.prototype.toRect = function() {	
	
		return { x: this.left, y: this.top, width: this.right - this.left, height: this.bottom - this.top };
		
	};
	

	
	window.requestAnimFrame = (function() {
	 
		return  window.requestAnimationFrame       || 
				window.webkitRequestAnimationFrame || 
				window.mozRequestAnimationFrame    || 
				window.oRequestAnimationFrame      || 
				window.msRequestAnimationFrame     || 
			  
				function(callback) {
			  
					window.setTimeout(callback, 1000 / FPS);
				
				};
			  
    	})();

	window.addEventListener ? window.addEventListener('load', init, false) : window.onload = init;
	
})(self);