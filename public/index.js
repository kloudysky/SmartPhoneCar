const socket = io();
const current_url = window.location.href;

socket.on("connect", () => {
  console.log("Connected to Server");

  const game = (url) => {
    let QRCodeElement;
    let modal;
    // const sound = new Howl({
    //   src: ["assets/music/Nutty - Secret Love.mp3"],
    //   loop: true,
    // });

    const createQR = () => {
      modal = document.createElement("div");
      let modalHeader = document.createElement("div");
      let modalTitle = document.createElement("h2");
      let modalText = document.createElement("p");
      let modalIcon = document.createElement("i");
      let modalImg = document.createElement("img");
      QRCodeElement = document.createElement("div");
      modal.className = "body-blackout";
      modalIcon.className = "far fa-image";
      modalTitle.id = "modal-title";
      modalText.id = "modal-text";
      modalImg.src = "assets/device-phone-rotate-landscape-512.webp";
      modalImg.style.width = "100px";
      modalImg.style.color = "white";
      QRCodeElement = document.createElement("div");
      QRCodeElement.id = "qr-code";
      modalHeader.appendChild(modalTitle);
      modalHeader.appendChild(modalImg);
      modalHeader.appendChild(modalText);
      modal.appendChild(modalHeader);
      modal.appendChild(QRCodeElement);
      document.body.appendChild(modal);
      modalTitle = document.getElementById("modal-title");
      modalTitle.innerHTML = "Smartphone Controller";
      modalText = document.getElementById("modal-text");
      modalText.innerHTML =
        "This game uses your phone as a remote control.<br><br>Use the QR Code below to connect your phone and start playing.<br><br>After you connect, hold your phone LANDSCAPE style and pretend it's a steering wheel.<br><br>Hit accel to accelerate and brake to stop";
      QRCodeElement = document.getElementById("qr-code");

      const QRcode = new QRCode("qr-code");
      const qrurl = `${url}?id=${socket.id}`;
      QRcode.makeCode(qrurl);
    };

    const gameConnected = () => {
      createQR();
      socket.removeListener("game connected", gameConnected);
    };

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("skyblue");
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);
    renderer.setClearAlpha(1.0);
    const gltfLoader = new THREE.GLTFLoader();

    const ambientLight = new THREE.AmbientLight(0x222222);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);

    const floor = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(40, 10000),
      new THREE.MeshLambertMaterial({ color: 0x343434 })
    );
    //grass
    const grassLeft = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(30, 10000),
      new THREE.MeshLambertMaterial({ color: 0x136d15 })
    );
    const grassRight = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(30, 10000),
      new THREE.MeshLambertMaterial({ color: 0x136d15 })
    );

    //end grass
    //Rails
    const railGeometry = new THREE.PlaneGeometry(10000, 2, 100);
    const railMaterial = new THREE.MeshBasicMaterial({
      color: 0x828282,
      side: THREE.DoubleSide,
    });
    const railLeft = new THREE.Mesh(railGeometry, railMaterial);
    railLeft.rotateY(Math.PI / 2);
    railLeft.position.x = 20;

    const railRight = new THREE.Mesh(railGeometry, railMaterial);
    railRight.rotateY(Math.PI / 2);
    railRight.position.x = -20;

    scene.add(railLeft);
    scene.add(railRight);
    //End rails
    // const controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.update();

    const render = () => {
      renderer.render(scene, camera);

      if (car) {
        if (controllerState.steer) {
          let accel = speed / 2;

          car.rotateY(-controllerState.steer * accel);
          camera.position.z = car.position.z - 10;
          camera.position.x = car.position.x;
          // if (camera.rotation.x < -2.7 && camera.rotation.x > -3.3) {
          // camera.rotation.x += controllerState.leanForward;
          // console.log(camera.rotation.x);
          // }
          //camera.rotation.y += -controllerState.leanSide / 100;

          // if (controllerState.rotation.beta) {
          //   camera.rotation.x += -controllerState.rotation.beta / 9000;
          // }
          // if (controllerState.rotation.alpha) {
          //   camera.rotation.y += -controllerState.rotation.alpha / 9000;
          // }
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

        if (controllerState.music) {
          // sound.play();
        } else {
          // sound.pause();
        }

        car.translateZ(speed);

        if (car.position.x > 18) {
          car.position.x = 18;
        }
        if (car.position.x < -18) {
          car.position.x = -18;
        }
        // if (car.position.z > 150) {
        //   car.position.z = 150;
        // }
        // if (car.position.z < -150) {
        //   car.position.z = -150;
        // }
      }

      requestAnimationFrame(render);
    };

    let car;
    let speed = 0;
    let controllerState = {};

    renderer.shadowMap.enabled = true;

    camera.position.z = -10;
    camera.position.y = 6;

    directionalLight.position.y = 150;
    directionalLight.position.x = -100;
    directionalLight.position.z = -60;
    directionalLight.castShadow = true;

    floor.rotation.x = -90 * (Math.PI / 180);
    grassRight.rotation.x = -90 * (Math.PI / 180);
    grassLeft.rotation.x = -90 * (Math.PI / 180);

    floor.receiveShadow = true;
    grassRight.receiveShadow = true;
    grassLeft.receiveShadow = true;

    grassLeft.position.x = 35;
    grassRight.position.x = -35;

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

    scene.add(camera);
    scene.add(ambientLight);
    scene.add(directionalLight);
    scene.add(floor);
    scene.add(grassLeft);
    scene.add(grassRight);

    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    render();

    socket.emit("game connect");

    socket.on("game connected", gameConnected);

    socket.on("controller connected", (connected) => {
      if (connected) {
        modal.style.display = "none";
      } else {
        modal.style.display = "flex";

        controller_state = {};
      }
    });

    socket.on("controller state change", (state) => {
      controllerState = state;
    });
  };

  const controller = (gameId) => {
    socket.emit("controller connect", gameId);

    socket.on("controller connected", (connected) => {
      if (connected) {
        alert("Controller Successfully Connected!");

        const controllerState = {
          music: false,
          accelerate: false,
          rotation: {
            gamma: 0,
            beta: 0,
            alpha: 0,
          },
          orientation: {
            absolute: 0,
            gamma: 0,
            beta: 0,
            alpha: 0,
          },
          acceleration: {
            x: 0,
            y: 0,
            z: 0,
          },
          steer: 0,
          leanForward: 0,
          leanSide: 0,
        };

        const emitUpdates = () => {
          console.log(controllerState);
          socket.emit("controller state change", controllerState);
        };

        const touchStart = (e) => {
          e.preventDefault();
          controllerState.accelerate = true;
          emiteUpdates();
        };

        const touchEnd = (e) => {
          e.preventDefault();
          controllerState.accelerate = false;
          emitUpdates();
        };

        const toggleMusic = (e) => {
          e.preventDefault();
          controllerState.music = !controllerState.music;
        };

        const deviceMotion = (e) => {
          controllerState.steer = e.accelerationIncludingGravity.y / 100;
          controllerState.leanForward = e.accelerationIncludingGravity.z / 100;
          controllerState.leanSide = e.accelerationIncludingGravity.y / 100;
          controllerState.acceleration.x = e.acceleration.x;
          controllerState.acceleration.y = e.acceleration.y;
          controllerState.acceleration.z = e.acceleration.z;
          controllerState.rotation.gamma = e.rotationRate.gamma;
          controllerState.rotation.beta = e.rotationRate.beta;
          controllerState.rotation.alpha = e.rotationRate.alpha;
          emitUpdates();
        };

        const deviceOrientation = (e) => {
          controllerState.orientation.absolute = e.absolute;
          controllerState.orientation.gamma = e.gamma;
          controllerState.orientation.beta = e.beta;
          controllerState.orientation.alpha = e.alpha;
          emitUpdates();
        };
        screen.lockOrientation("portrait-primary");
        document
          .getElementById("accel")
          .addEventListener("click", touchStart, false);
        document
          .getElementById("brake")
          .addEventListener("click", touchEnd, false);
        document
          .getElementById("radio")
          .addEventListener("click", toggleMusic, false);
        window.addEventListener("devicemotion", deviceMotion, false);
        window.addEventListener("deviceorientation", deviceOrientation, false);
      } else {
        alert("Unable to connect controller");
      }
    });
  };

  if (current_url.indexOf("?id=") > 0) {
    controller(current_url.split("?id=")[1]);
  } else {
    game(current_url);
  }
});
