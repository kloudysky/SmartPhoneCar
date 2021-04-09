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
        document
          .getElementById("accel")
          .addEventListener("click", touchStart, false);
        document
          .getElementById("brake")
          .addEventListener("click", touchEnd, false);
        // document
        //   .getElementById("radio")
        //   .addEventListener("click", toggleMusic, false);
        window.addEventListener("devicemotion", deviceMotion, false);
        window.addEventListener("deviceorientation", deviceOrientation, false);
      } else {
        alert("Unable to connect controller");
      }
    });
  };

  if (current_url.indexOf("?id=") > 0) {
    controller(current_url.split("?id=")[1]);
    const controls = document.getElementById("controls");
    controls.style.display = "flex";
  } else {
    if (isMobile()) {
      const mobileMsg = document.getElementById("mobile-msg");
      mobileMsg.style.display = "flex";
    } else {
      console.log(isMobile());
      game(current_url);
    }
  }
});

const isMobile = () => {
  if (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
      navigator.userAgent
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      navigator.userAgent.substr(0, 4)
    )
  )
    return true;

  return false;
};
