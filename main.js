var div = document.getElementsByTagName("div")[0],
	canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d");
	
// adjust canvas width and height
canvas.width = div.offsetWidth;
canvas.height = div.offsetHeight;

// Array for circles
var circles = [], cirCounts = 15;
var blocks = [];

class rectangle{
	constructor(xPos,yPos,width,height){
		this.x = xPos;
		this.y = yPos;
		this.w = width;
		this.h = height;
		this.color = 'rgb(132,142,141)';
	}
	
	draw(){
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.rect(this.x, this.y, this.w, this.h);
		ctx.fill();
		ctx.closePath();
	}
}

class circle {
	constructor(xPos,yPos,radius){
		this.x = xPos;
		this.y = yPos;
		this.r = radius;
		this.mass = Math.PI * this.r * this.r;
		this.color = "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ")";
		this.dx = randomNumber(-5, 5); // direction x
		this.dy = randomNumber(-5, 5); // direction y
		this.xslope = slope(this.dx, this.dy);
		this.yslope = slope(this.dy, this.dx);
	}
	
	draw(){
		ctx.fillStyle = this.color
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, true)
		ctx.fill();
		ctx.closePath();
	}
	
	move(){
		  this.x = this.x + this.dx;
		  this.y = this.y + this.dy;
		  this.wallBound();
	}
	
	wallBound(){
		if (this.x + this.r > canvas.width){this.dx = 0 - Math.abs(this.dx);}
		if (this.x - this.r < 0 ){this.dx = Math.abs(this.dx);}
		this.bounce(this.x, this.r, canvas.width, this.dx);
		
		if (this.y + this.r > canvas.height){this.dy  = 0 - Math.abs(this.dy);}
		if (this.y - this.r < 0 ){this.dy = Math.abs(this.dy);}
		this.bounce(this.y, this.r, canvas.height, this.dy);
		
		blocksBound(this);
	}
	
	bounce(coord, radius, limit, bSpeed) {
		if (coord + radius > limit) bSpeed = 0 - Math.abs(bSpeed);
		if (coord - radius < 0 ) bSpeed = Math.abs(bSpeed);
	}
	
	speed(){
		return Math.sqrt(Math.pow(this.dx,2) + Math.pow(this.dy,2));
	}
	
	energy(){
		return (this.mass / 2) * (Math.pow(this.dx,2) + Math.pow(this.dy,2));
	}
	
	direction(){
		return Math.atan2(this.dy, this.dx);
	}
}

function isCollide(circ1, circ2) {
	// get the difference
	var x_dist = Math.abs(circ1.x - circ2.x);
	var y_dist = Math.abs(circ1.y - circ2.y);
	
	var dist = Math.sqrt(Math.pow(x_dist,2) + Math.pow(y_dist,2));
	return (dist < circ1.r + circ2.r); // test -> true or false
}

function degToRad(deg){
	return deg * Math.PI / 180;
}

function distance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

function detectCollision(rect, circle) {
	var cx, cy, deg = 0
	var rectCenterX = rect.x + rect.w / 2
	var rectCenterY = rect.y + rect.h / 2
	var angleOfRad = degToRad(-deg)

	var rotateCircleX = Math.cos(angleOfRad) * (circle.x - rectCenterX) - Math.sin(angleOfRad) * (circle.y - rectCenterY) + rectCenterX
	var rotateCircleY = Math.sin(angleOfRad) * (circle.x - rectCenterX) + Math.cos(angleOfRad) * (circle.y - rectCenterY) + rectCenterY

	if (rotateCircleX < rect.x) {
		cx = rect.x
	} else if (rotateCircleX > rect.x + rect.w) {
		cx = rect.x + rect.w
	} else {
		cx = rotateCircleX
	}

	if (rotateCircleY < rect.y) {
		cy = rect.y
	} else if (rotateCircleY > rect.y + rect.h) {
		cy = rect.y + rect.h
	} else {
		cy = rotateCircleY
	}

	if (distance(rotateCircleX, rotateCircleY, cx, cy) < circle.r) {
		return true
	}

	return false
}
		
function blocksBound(cir){
	blocks.forEach(function(block){		
		// if circle is bound at the right side of the rect flip dx to bounce back
		
		
		if (detectCollision(block,cir)){
				console.log(detectCollision(block,cir));
				cir.dx = (cir.x >= block.x ? Math.abs(cir.dx) : 0-Math.abs(cir.dx));
				cir.dy = (cir.y >= block.y ? Math.abs(cir.dy) : 0-Math.abs(cir.dy));
				cir.bounce(cir.x, cir.r, block.w, cir.dx);
				cir.bounce(cir.y, cir.r, block.h, cir.dy);
		}
	})
}

function elasticCollision(circ1, circ2) {
	// magic happens
	var x_dist = circ1.x - circ2.x;
	var y_dist = circ1.y - circ2.y;
	var angle = Math.atan2(y_dist, x_dist);

	var new_xSpeed1 = circ1.speed() * Math.cos(circ1.direction() - angle);
	var fin_ySpeed1 = circ1.speed() * Math.sin(circ1.direction() - angle);
	
	var new_xspeed_2 = circ2.speed() * Math.cos(circ2.direction() - angle);
	var fin_ySpeed2 = circ2.speed() * Math.sin(circ2.direction() - angle);

	var fin_xSpeed1 = ((circ1.mass - circ2.mass) * new_xSpeed1 + (circ2.mass + circ2.mass) * new_xspeed_2) / (circ1.mass + circ2.mass);
	var fin_xSpeed2 = ((circ1.mass + circ1.mass) * new_xSpeed1 + (circ2.mass - circ1.mass) * new_xspeed_2) / (circ1.mass + circ2.mass);

	circ1.dx = Math.cos(angle) * fin_xSpeed1 + Math.cos(angle+Math.PI/2) * fin_ySpeed1;
	circ1.dy = Math.sin(angle) * fin_xSpeed1 + Math.sin(angle+Math.PI/2) * fin_ySpeed1;
	circ2.dx = Math.cos(angle) * fin_xSpeed2 + Math.cos(angle+Math.PI/2) * fin_ySpeed2;
	circ2.dy = Math.sin(angle) * fin_xSpeed2 + Math.sin(angle+Math.PI/2) * fin_ySpeed2;

	while (isCollide(circ1, circ2)) {
		circ1.move();
		circ2.move();
	}
}


function displaySummary() {
  var summary = "<h3>Energy</h3>";
  var total_energy = 0;
  for (var i = 0; i < circles.length; i++) {
    summary = summary + "<span style='color: " + circles[i].color + "'>" + i.toString() + ": " + circles[i].energy().toFixed(2) + "</span><br>";
    total_energy += circles[i].energy();
  }
  summary = summary + "<span style='color: gray'>Total: " + total_energy.toFixed(2) + "</span>";
  return summary;
}

function randomNumber(min,max){
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

function slope(a, b) {
	var s = Math.sqrt(1 + Math.pow(b / a, 2));
	//console.log(a,b,s);
	return s;
}

function renderCircles() {
	// collision detection
	for(var i = 0; i < circles.length; i++){
		// move circles
		circles[i].move();
		for(var j = i + 1; j < circles.length; j++){
			// check for collisions
			if (isCollide(circles[i], circles[j])){
				elasticCollision(circles[i], circles[j]);
			}
		}
	}
	
	// drawing circles
	circles.forEach(function(el){
		el.draw();
	})
}

function renderBlocks(){
	blocks.forEach(function(el){
		el.draw();
	})
}

function animate() {
  ctx.clearRect(0, 0, canvas.width , canvas.height);
  
  renderBlocks();
  renderCircles();
  
  document.getElementById("summary").innerHTML = displaySummary();
  
  requestAnimationFrame(animate);
}

// initialze block/s
function mainBlock(){
	var x
	var block = new rectangle(250,150,150,300);
	block.draw();
	blocks.push(block);	
}
	
// initialize circles
for(var i = 0; i < cirCounts; i++){
  var circ = new circle(randomNumber(60,canvas.width-60),randomNumber(60,canvas.height-60),randomNumber(15,30));
  console.log(circ);
  circles.push(circ);
}

mainBlock();
animate(); //animation starts
