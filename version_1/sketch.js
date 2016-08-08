var stars = [];
var mountains = [];

var mtnSpeed; var starSpeed;

function setup() {
  createCanvas(innerWidth, innerHeight);
  for (var i = 0; i < 1600; i++) {
    stars[i] = new Star();
  }
  for (var j = 0; j < 10; j++) {
    mountains.push(new Mountain(0, 300, width - ((width/10) * j)));
  }
}

function draw() {
  mtnSpeed = 2;
  starSpeed = 0.2;
  background(0);
  translate(width / 2, height / 2);
  for (var i = 0; i < stars.length; i++) {
    stars[i].update();
    stars[i].show();
  }
  mountains.sort(function(a, b) {
        return b.z - a.z
  })
  for (var j = 0; j < mountains.length; j++) {
    mountains[j].show();
  }
}

function Star() {
  this.x = random(-width, width);
  this.y = random(-height, height);
  this.z = random(width);
  this.pz = this.z;

  this.update = function() {
    this.z -= starSpeed;
    if (this.z < 1) {
      this.z = width;
      this.x = random(-width, width);
      this.y = random(-height, height);
      this.pz = this.z;
    }
  }

  this.show = function() {
    fill(255);
    noStroke();

    var sx = map(this.x / this.z, 0, 1, 0, width);
    var sy = map(this.y / this.z, 0, 1, 0, height);

    var px = map(this.x / this.pz, 0, 1, 0, width);
    var py = map(this.y / this.pz, 0, 1, 0, height);

    this.pz = this.z;

    stroke(255);
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
    fill(this.fill);
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
    if (this.z < 1) {
      this.z = width;
      this.atHorizon();
    }
  }
}
