// Sky Gradient Constants
var c1, c2;

var lines = [];
var mountains = [];
var stars = [];
var fireworks = [];
var gravity;

var mtnSpeed; var lineSpeed;

function setup() {
  createCanvas(innerWidth, innerHeight);
  // Define sky colors
  c1 = color(0);
  c2 = color(59,18,97);

  gravity = createVector(0, 0.2);

  for (var i = 0; i < 20; i++) {
    lines[i] = new Line();
  }
  for (var j = 0; j < 10; j++) {
    mountains[j] = new Mountain(0, 300, width - ((width/10) * j));
  }
  for (var k = 0; k < 80; k++) {
    stars[k] = new Star();
  }
}

function draw() {
  mtnSpeed = 4;
  lineSpeed = 50;

  setGradient(0, 0, width, height, c1, c2);

  translate(width / 2, height / 2);
  mountains.sort(function(a, b) {
        return b.z - a.z
  });
  for (var k = 0; k < stars.length; k++) {
    stars[k].show();
    stars[k].checkEdges();
    stars[k].update();
  }
  for (var j = 0; j < mountains.length; j++) {
    mountains[j].show();
  }
  if (random(1) < 0.02) {
    fireworks.push(new Firework());
  }
  for (var i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }
  for (var i = 0; i < lines.length; i++) {
    lines[i].update();
    lines[i].show();
  }
}

function setGradient(x, y, w, h, c1, c2) {
  noFill();
  for (var i = y; i <= y+h; i++) {
    var inter = map(i, y, y+h, 0, 1);
    var c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, i, x+w, i);
  }
}

function Line() {
  this.x = random(-100, 100);
  this.y = random(-100, 100);
  this.z = random(width);
  this.pz = this.z;

  this.update = function() {
    this.z -= lineSpeed;
    if (this.z < 1) {
      this.z = width;
      this.x = random(-100, 100);
      this.y = random(-100, 100);
      this.pz = this.z;
    }
  }

  this.show = function() {

    var sx = map(this.x / this.z, 0, 1, 0, width);
    var sy = map(this.y / this.z, 0, 1, 0, height);

    var px = map(this.x / this.pz, 0, 1, 0, width);
    var py = map(this.y / this.pz, 0, 1, 0, height);

    this.pz = this.z;

    stroke(255, 40);
    var sWeight = map(this.z, 0, width, 7, 0);
    strokeWeight(sWeight);
    line(px, py, sx, sy);

  }
}

function MountainPoint(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.sx = map(this.x / this.z, 0, 1, 0, width);
  this.sy = map(this.y / this.z, 0, 1, 0, height);

  this.update = function() {
    this.z -= mtnSpeed;
    this.sx = map(this.x / this.z, 0, 1, 0, width);
    this.sy = map(this.y / this.z, 0, 1, 0, height);
  }
}

function Mountain(minY, maxY, z) {
  this.z = z;
  this.alpha = 255;
  this.atHorizon = function() {
    this.vertices = [new MountainPoint(-width/2, height, this.z)];
    this.yoff = random(1000);
    this.xoff = 0;
    this.fill = map(this.z, 0, width, 255, 0);

    for (var x = -width/2; x <= width/2; x += 5) {
      var y = map(noise(this.xoff, this.yoff), 0, 1, minY, maxY);
      this.vertices.push(new MountainPoint(x, y, this.z));
      this.xoff += 0.05;
    }
    this.vertices.push(new MountainPoint(width/2, height, this.z));
  }

  this.atHorizon();

  this.show = function() {
    noStroke();
    fill(this.fill, this.fill, this.fill, this.alpha);
    // We are going to draw a polygon out of the wave points
    beginShape();
    this.vertices.forEach(function(v) {
      vertex(v.sx, v.sy);
      v.update();
    });
    endShape(CLOSE);
    this.update();
  }

  this.update = function() {
    this.z -= mtnSpeed;
    this.fill = map(this.z, 0, width, 255, 0);
    this.alpha += 4;
    if (this.z < 1) {
      this.z = width;
      this.alpha = 0;
      this.atHorizon();
    }
  }
}

function Star() {
  this.position = createVector(random(-width/2, width/2), random(-height/2, height/2));
  this.velocity = createVector();
  this.acceleration = createVector();
  this.noff = createVector(random(1000),random(1000));
  this.topspeed = 1;

  this.update = function() {
    this.acceleration.x = map(noise(this.noff.x), 0, 1, -0.2, 0.2);
    this.acceleration.y = map(noise(this.noff.y), 0, 1, -1, 0.1);
    this.noff.add(0.01,0.01,0);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.topspeed);
    this.position.add(this.velocity);
  }

  this.checkEdges = function() {
    if (this.position.x > width/2) {
      this.position.x = -width/2;
    } else if (this.position.x < -width/2) {
      this.position.x = width/2;
    }
    if (this.position.y > height/2) {
      this.position.y = -height/2;
    } else if (this.position.y < -height/2) {
      this.position.y = height/2;
    }
  };

  this.show = function() {
    fill(255);
    noStroke();
    ellipse(this.position.x, this.position.y, 2, 2);
  }
}

function Particle(x, y, firework) {
  this.pos = createVector(x, y);
  this.firework = firework;
  this.lifespan = 255;

  if (this.firework) {
    this.vel = createVector(0, random(-12, -8));
  } else {
    this.vel = p5.Vector.random2D();
    this.vel.mult(random(2, 10));
  }
  this.acc = createVector(0, 0);

  this.applyForce = function(force) {
    this.acc.add(force);
  }

  this.update = function() {
    if (!this.firework) {
      this.vel.mult(0.9);
      this.lifespan -= 4;
    }
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);


  }

  this.done = function() {
    if (this.lifespan < 0) {
      return true;
    } else {
      return false;
    }
  }

  this.show = function() {
    if (!this.firework) {
      strokeWeight(4);
      stroke(156, 255, 178, this.lifespan);
    } else {
      noStroke();
    }
    point(this.pos.x, this.pos.y);
  }

}

function Firework() {

  this.firework = new Particle(random(-width/2, width/2), height/4, true);
  this.exploded = false;
  this.particles = [];

  this.done = function() {
    if (this.exploded && this.particles.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  this.update = function() {
    if (!this.exploded) {
      this.firework.applyForce(gravity);
      this.firework.update();
      if (this.firework.vel.y >= 0) {
        this.exploded = true;
        this.explode();
      }
    }
    for (var i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].applyForce(gravity);
      this.particles[i].update();
      if (this.particles[i].done()) {
        this.particles.splice(i, 1);
      }
    }



  }

  this.explode = function() {
    for (var i = 0; i < 100; i++) {
      var p = new Particle(this.firework.pos.x, this.firework.pos.y, false);
      this.particles.push(p);
    }
  }

  this.show = function() {
    if (!this.exploded) {
      this.firework.show();
    }
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].show();
    }

  }
}
