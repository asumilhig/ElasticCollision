
var div = document.getElementsByTagName("div")[0],
	canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d");
	
// adjust canvas width and height
canvas.width = div.offsetWidth;
canvas.height = div.offsetHeight;

// Array for circles
var circles = [], cirCounts = 10;
var sx = 100, sy = 100;

class circle {
	constructor(xPos,yPos,radius){
		this.x = xPos;
		this.y = yPos;
		this.r = radius;
		this.mass = Math.PI * this.r * this.r;
		this.colour = "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ")";
		this.dx = randomNumber(-5, 5); // dist x
		this.dy = randomNumber(-5, 5); // dist y
		this.xslope = slope(this.dx, this.dy);
		this.yslope = slope(this.dy, this.dx);
		//this.speed = this.speed();
		this.px = (this.mass * this.speed) / this.xslope;
		this.py = (this.mass * this.speed) / this.yslope;
	}
	
	draw(){
		ctx.fillStyle = this.colour
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, true)
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
	}
	
	move(){
		  this.x = this.x + this.dx;
		  this.y = this.y + this.dy;
		  this.wallBound();
	}
	
	wallBound(){
		bounceBack(this.x, this.r, canvas.width, this.dx);
		bounceBack(this.y, this.r, canvas.height, this.dy);
		if (this.x + this.r > canvas.width) this.dx = 0 - Math.abs(this.dx);
		if (this.x - this.r < 0 ) this.dx = Math.abs(this.dx);
		if (this.y + this.r > canvas.height) this.dy  = 0 - Math.abs(this.dy);
		if (this.y - this.r < 0 ) this.dy = Math.abs(this.dy);
		this.px = (this.mass * this.speed) / this.xslope;
		this.py = (this.mass * this.speed) / this.yslope;
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

function elasticCollision(circ1, circ2) {
	// magic happens
	var x_dist = circ1.x - circ2.x;
	var y_dist = circ1.y - circ2.y;
	var angle = Math.atan2(y_dist, x_dist);

	var new_xspeed_1 = circ1.speed() * Math.cos(circ1.direction() - angle);
	var final_yspeed_1 = circ1.speed() * Math.sin(circ1.direction() - angle);
	
	var new_xspeed_2 = circ2.speed() * Math.cos(circ2.direction() - angle);
	var final_yspeed_2 = circ2.speed() * Math.sin(circ2.direction() - angle);

	var final_xspeed_1 = ((circ1.mass - circ2.mass) * new_xspeed_1 + (circ2.mass + circ2.mass) * new_xspeed_2) / (circ1.mass + circ2.mass);
	var final_xspeed_2 = ((circ1.mass + circ1.mass) * new_xspeed_1 + (circ2.mass - circ1.mass) * new_xspeed_2) / (circ1.mass + circ2.mass);

	circ1.dx = Math.cos(angle) * final_xspeed_1 + Math.cos(angle+Math.PI/2) * final_yspeed_1;
	circ1.dy = Math.sin(angle) * final_xspeed_1 + Math.sin(angle+Math.PI/2) * final_yspeed_1;
	circ2.dx = Math.cos(angle) * final_xspeed_2 + Math.cos(angle+Math.PI/2) * final_yspeed_2;
	circ2.dy = Math.sin(angle) * final_xspeed_2 + Math.sin(angle+Math.PI/2) * final_yspeed_2;

	while (isCollide(circ1, circ2)) {
		circ1.move();
		circ2.move();
	}
	this.px = (this.mass * this.speed) / this.xslope;
	this.py = (this.mass * this.speed) / this.yslope;  
}

function displaySummary() {
  var summary = "<h3>Energy</h3>";
  var total_energy = 0;
  for (var i = 0; i < circles.length; i++) {
    summary = summary + i.toString() + ": " + circles[i].energy().toFixed(2) + "<br>";
    total_energy += circles[i].energy();
  }
  summary = summary + "Total: " + total_energy.toFixed(2);
  return summary;
}

function randomNumber(min,max){
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

function bounceBack(coord, radius, limit, speed) {
  if (coord + radius > limit) speed = 0 - Math.abs(speed);
  if (coord - radius < 0 ) speed = Math.abs(speed);
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

function animate() {
  ctx.clearRect(0, 0, canvas.width , canvas.height);
  
  renderCircles();
  
  document.getElementById("summary").innerHTML = displaySummary();
  
  requestAnimationFrame(animate);
}

// initialize circles
for(var i = 0; i < cirCounts; i++){
  var circ = new circle(randomNumber(60,canvas.width-60),randomNumber(60,canvas.height-60),randomNumber(15,30));
  console.log(circ);
  circles.push(circ);
}

animate(); //animation starts