# Smartphone Car

Smartphone Car is a driving simulator that uses your phone as a gyroscope remote control to steer a car from your browser

![Alt text](https://media3.giphy.com/media/N8HhQ0F0JLwGrSA0g9/giphy.gif)

[Give it a try!](https://smartphonecar.herokuapp.com/)

### Architecture & Technology

- [Node.JS](https://nodejs.org/en/)
- [Express.JS](https://expressjs.com/)
- [Socket.IO](https://socket.io/) - Establish connection between phone broswer and desktop browser to track movement
- [DeviceMotionEvent Web API](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent) - Track phone movement
- [Three.JS](https://threejs.org/) - Render 3D environment

## Functionality

#### Listening to mobile phone orientation

- Setup Node.JS server and configure Socket.IO listen for movement on mobile device using [DeviceMotionEvent Web API](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent) and send it to browser.

```JavaScript
///Establish a unique connection between phone and browser
socket.on("game connect", () => {
    console.log(`Game Connected on ${socket.id}`);

    gameSockets[socket.id] = {
      socket: socket,
      controllerId: undefined,
    };
    socket.emit("game connected");
  });
```

```JavaScript
//server listens on 'orientation on unique connection'
socket.on("controller state change", (data) => {
    if (gameSockets[gameSocketId]) {
        gameSockets[gameSocketId].socket.emit(
        "controller state change",
        data
        );
    }
});
```

```JavaScript
//sends device movement on 'controller state change'
const deviceMotion = (e) => {
    controllerState.steer = e.accelerationIncludingGravity.y / 100;
    socket.emit("controller state change", controllerState);
};
window.addEventListener("devicemotion", deviceMotion, false);
```

#### Render car and scene to the web browser

- Using canvas and Three.JS to render a 3D car and scene to the browser

```JavaScript
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
gltfLoader.load(
      "assets/toyota_corolla_ae86_trueno_tofu_delivery/scene.gltf",
      (gltf) => {
        car = gltf.scene;
        car.castShadow = true;
        car.position.y = 1;
        camera.lookAt(car.position);
        //car.add(camera);
        scene.add(car);
      }
    );
```

#### Object interaction

- Acclerate or Brake using controls from the controller and move the car in real time while the camera follows

```JavaScript
socket.on("controller state change", (state) => {
    controllerState = state;

    if (car) {
        if (controllerState.steer) {
          let accel = speed / 2;

          car.rotateY(-controllerState.steer * accel);
          camera.position.z = car.position.z - 10;
          camera.position.x = car.position.x;
        }

        if (controllerState.accelerate) {
          if (speed < 2) {
            speed += 0.05;
          } else {
            speed = 2;
          }
        } else {
          if (0 < speed) {
            speed -= 0.05;
          } else {
            speed = 0;
          }
        }

        car.translateZ(speed);

        if (car.position.x > 18) {
          car.position.x = 18;
        }
        if (car.position.x < -18) {
          car.position.x = -18;
        }
      }

      requestAnimationFrame(render);
    };
});
```
