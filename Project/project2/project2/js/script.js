/**
Project 2 prototype
Lucien Cusson-Fradet

I ran out of time doing the prototype. Parts of it ended up being more complicated than anticipated.
This serves as a basic representation of the visuals that the game will have.

At the moment, it is possible to rotate the tunnel using A and D keys.


TODO LIST:
OK Create matter.js objects for matter.js
OK Visualise the objects with p5.js
- tweak the parameters so the controls feel nice
OK Spawn objects and make them follow the tunnel
- Collision with the main object
- Implement a life system
- Add different functions like a ring of spikes that you have to jump over
- Implement States as objects

- Implement dithering effect!?

*/

"use strict";
let canvasWidth = 700;
let canvasHeight = 550;

//fonts
let yoster;

let time;

let world;

const NUM_RING = 50;
let tunnel = [];
let tunnelPositionHistory = [];

let wheel;

let meatBall;

let radar;

let item = [];

let rampTest;

//sliders for debugging
let sliders = [];


/**
--
*/
function preload() {
  yoster = loadFont('assets/fonts/yoster.ttf');
}


/**
Description of setup
*/
function setup() {
  createCanvas(canvasWidth, canvasHeight, WEBGL);
  background(0);

  world = new Physics();
  world.runWorld();
  console.log(world.engine);

  for (let i = 0; i < NUM_RING; i++) {
    let layer = i;
    let tunnelRing = new Tunnel(layer);
    tunnel.push(tunnelRing);
  }

  wheel = new Wheel();

  meatBall = new MeatBall(0, -10, 30);

  radar = new Radar();

  sliders[0] = new Slider({
    value: undefined,
    min: 0,
    max: 1,
    defaut: 0.8,
    step: 0.01,
    name: 'ballFriction',
    id: 0,
    callback: function (event) {
      meatBall.body.friction = sliders[0].update(0);
    }
  });
  sliders[1] = new Slider({
    value: undefined,
    min: 0,
    max: 1,
    defaut: 0.8,
    step: 0.01,
    name: 'wheelFriction',
    id: 1,
    callback: function (event) {
      wheel.compoundBody.friction = sliders[1].update(1);
    }
  });
  sliders[2] = new Slider({
    value: undefined,
    min: -5,
    max: 5,
    defaut: 1,
    step: 0.1,
    name: 'gravityY',
    id: 2,
    callback: function (event) {
      world.engine.gravity.y = sliders[2].update(2);
    }
  });
  sliders[3] = new Slider({
    value: undefined,
    min: 0,
    max: 1,
    defaut: 0.5,
    step: 0.01,
    name: 'ballFrictionStatic',
    id: 3,
    callback: function (event) {
      meatBall.body.frictionStatic = sliders[3].update(3);
    }
  });
  sliders[4] = new Slider({
    value: undefined,
    min: 0,
    max: 1,
    defaut: 0.5,
    step: 0.01,
    name: 'wheelFrictionStatic',
    id: 4,
    callback: function (event) {
      wheel.compoundBody.frictionStatic = sliders[4].update(4);
    }
  });
  sliders[5] = new Slider({
    value: undefined,
    min: 0.001,
    max: 0.5,
    defaut: 0.02,
    step: 0.001,
    name: 'wheelRotationSpeed',
    id: 5,
    callback: function (event) {
      wheel.wheelRotationSpeed = sliders[5].update(5);
    }
  });
  sliders[6] = new Slider({
    value: undefined,
    min: 0,
    max: 20,
    defaut: 5,
    step: 0.1,
    name: 'wheelJumpForce',
    id: 6,
    callback: function (event) {
      wheel.jumpForce = sliders[6].update(6);
    }
  });


  //Ramp Test
  // rampTest = Bodies.rectangle(0, 0, 180, 30, {angle: TWO_PI/16, isStatic: true});
  // World.add(world.world, rampTest);
}


/**
Description of draw()
*/
function draw() {
  background(0);
  time = frameCount/60;

  wheel.display();
  wheel.rotate();

  meatBall.display();

  // Deploys the tunnel after an amount of time
  if (time > 0) {
    for (let i = 0; i < tunnel.length; i++) {
      tunnel[i].deploy();
      }
      radar.display();
      radar.rotate();

      let r = random();
      if (r < 0.2) {
        let newItem = new Item(radar.position.x, radar.position.y, radar.centerPositionZ);
        item.push(newItem);
      }

      for (let i = 0; i < item.length; i++) {;
        item[i].display();
        item[i].followTunnel();
        if (item[i].isOffScreen()) {
          item.splice(i, 1);
          i--; //the splice function removes and jacks everything back so I need to move back with the array before checking the IsOfScreen function again
        }
    }
  }

  // console.log(`radar.position.x: ${radar.position.x}`);
  // console.log(`radar.position.y: ${radar.position.y}`);
  // console.log(`mouseX: ${mouseX - width/2}`);
  // console.log(`mouseY: ${mouseY - height/2}`);

  for (let i = 0; i < tunnel.length; i++) {
    tunnel[i].display();
    tunnel[i].rotate();
  }
  delayTunnel();

  // tunnel[0].saveHistory();
  //
  // for (let i = tunnel[0].history.length - 1; i >= 1; i--) {
  //   let size = map(tunnel[0].history[i].y, -100, 100, 25, 100);
  //   let xPos = map(i, 0, 49, -width/2, width/2);
  //   ellipse(xPos, 0, size);
  // }

  debuggingSliders();
}

function delayTunnel() {
  if (tunnelPositionHistory.length > NUM_RING - 2) {
    tunnelPositionHistory.splice(0, 1);
  }

  let pos = wheel.compoundBody.position;
  tunnel[0].position.x = pos.x;
  tunnel[0].position.y = pos.y;

  let vPos = createVector(pos.x, pos.y);

  tunnelPositionHistory.push(vPos);

  for (let i = tunnelPositionHistory.length - 1; i >= 1; i--) {
    let size = map(tunnelPositionHistory[i].y, -100, 100, 25, 100);
    let xPos = map(i, 0, 49, -width/2, width/2);

    //ellipse(xPos, 0, size);

    tunnel[tunnelPositionHistory.length - i].position.x = tunnelPositionHistory[i].x;
    tunnel[tunnelPositionHistory.length - i].position.y = tunnelPositionHistory[i].y;
  }

}

function debuggingSliders() {
  for (let i = 0; i < sliders.length; i++) {
    sliders[i].update(i);
  }
}

function keyPressed() {
  wheel.keyPressed();
}
