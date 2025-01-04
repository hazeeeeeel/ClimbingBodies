// import ParameterList from "./parameterList.js";

let classifier;
let bodyPose;
let video;
let font;

let maxWidth = 600;
let vwidth, vheight;
let marginlr = 60;
let margintb = 45;

let poses = [];
let classification = "";
let segmentation;
let pixelation_level = 10;
let isModelLoaded = false;

let article, curr_chapter;
let container, title, textContainer, textContent, textFootnotes, btn_prev, btn_next,
    checkbox_leftStroke, checkbox_rightStroke, checkbox_slant;
let lstroke_on = true, 
    rstroke_on = true, 
    slant_on = true;

let curr;

let blue, pale_gray, green, yellow, pink, red, borderColor;

let segmentOptions = {
  maskType: "background",
}


let  img1

let bodyposeOptions = {
  modelType: "SINGLEPOSE_LIGHTNING", // "MULTIPOSE_LIGHTNING", "SINGLEPOSE_LIGHTNING", or "SINGLEPOSE_THUNDER".
  enableSmoothing: true,
  minPoseScore: 0.45,
  enableTracking: true,
  trackerType: "boundingBox", // "keypoint" or "boundingBox"
  flipped: false
}

let poseHeight = 0,
    armSpan = 0,
    feetSpan = 0,
    leftHandSpan = 0,
    rightHandSpan = 0,
    leftFeetSpan = 0,
    rightFeetSpan = 0, 
    centerTop = 0,
    centerBottom = 0;
let   bgc;
function preload() {
  // Load the bodyPose model
  bodyPose = ml5.bodyPose(video, gotPoses);


  bgc=loadImage("./assets/image/1.jpg")
  // font = this.loadFont('assets/fonts/bb_bureau_trial/Politip-trial.ttf');
}

function setup() {
  container = document.getElementById("container");
  let w = container.clientWidth * 0.4 - 12;
  let h = container.clientWidth * 0.4 * 0.75;
  createCanvas(w, h);
  console.log("width: " + width, "; height: " + height);

  // Create the webcam video and hide it
  vwidth = w - marginlr;
  vheight = vwidth * 0.75;
  let constraints = {
    video: {
      mandatory: {
        minWidth: 1200,
        minHeight: 900,
    },
    optional: [{ maxFrameRate: 10 }]
    },
    audio: false
  };
  video = createCapture(VIDEO, {flipped: false});
  video.size(vwidth, vheight);
  video.hide();

  title = document.querySelector('title');
  textContainer = document.getElementById('text-container');
  textContent = document.getElementsByClassName("text-content")[0];
  textFootnotes = document.getElementsByClassName("text-footnote")[0];

  // For this example to work across all browsers
  // "webgl" or "cpu" needs to be set as the backend
  ml5.setBackend("webgl");

  // Set up the neural network
  let classifierOptions = {
    task: "classification",
  };
  classifier = ml5.neuralNetwork(classifierOptions);

  modelPath = "model-1018-AIX/";

  const modelDetails = {
    model: modelPath + "model.json",
    metadata: modelPath + "model_meta.json",
    weights: modelPath + "model.weights.bin",
  };

  classifier.load(modelDetails, modelLoaded);

  // Start the bodyPose detection
  bodyPose.detectStart(video, gotPoses);

  blue = new Color(100, 149, 237);
  pale_gray = new Color(244, 244, 246);
  green = new Color(64, 255, 96);
  yellow = new Color(255, 253, 133);
  pink = new Color(255, 205, 231);
  red = new Color(255, 23, 108);
  borderColor = new Color(62, 73, 94);

  initiateArticle();

  // btn_prev = document.querySelector('#btn-prev');
  // btn_next = document.querySelector('#btn-next');
  // bindButtonEvents();

  checkbox_leftStroke = document.getElementById('checkbox-leftStroke');
  checkbox_rightStroke = document.getElementById('checkbox-rightStroke');
  checkbox_slant = document.getElementById('checkbox-slant');

}

function draw() {
  // container = document.getElementById("container");
  // let w = container.clientWidth * 0.4;
  // let h = container.clientHeight;
  // resizeCanvas(w, h);

  background(pale_gray.r, pale_gray.g, pale_gray.b);

  // push();
  // fill(yellow.r, yellow.g, yellow.b);
  // noStroke();
  // rect(1, 1, width - 2, height - 2);
  // pop();
  
  //Display the webcam video
  if (video.loadedmetadata) {

    push();

    imageMode(CENTER);
    image(video, width / 2, (vheight + margintb) / 2 + 3, vwidth, vheight);

    pop();

  }

  // Draw the bodyPose keypoints
  if (poses[0]) {
    updatePose(poses[0]);

    if (isModelLoaded) {
      // If the model is loaded, make a classification and display the result
      let inputData = flattenPoseData();
      classifier.classify(inputData, gotClassification);
    }
  }

  if (curr) {

    drawKeypoints();
    drawParameters();

    drawCapture();
    
    // displayTitle();
    displayText();
  }
}

function drawKeypoints() {
  push();
  let pose = curr.pose;
  let scaleX = vwidth / 640;
  let scaleY = vheight / 480;
  // console.log(pose);

  // translate(marginlr / 2 + vwidth, margintb / 2);
  translate(marginlr / 2, margintb / 2);
  // scale(-1, 1);
  
  noFill();
  stroke(pink.r, pink.g, pink.b);
  strokeWeight(1);
  line(pose.left_ear.x * scaleX, pose.left_ear.y * scaleY, pose.left_eye.x * scaleX, pose.left_eye.y * scaleY);
  line(pose.left_eye.x * scaleX, pose.left_eye.y * scaleY, pose.nose.x * scaleX, pose.nose.y * scaleY);
  line(pose.nose.x * scaleX, pose.nose.y * scaleY, pose.right_eye.x * scaleX, pose.right_eye.y * scaleY);
  line(pose.right_eye.x * scaleX, pose.right_eye.y * scaleY, pose.right_ear.x * scaleX, pose.right_ear.y * scaleY);
  line(pose.left_shoulder.x * scaleX, pose.left_shoulder.y * scaleY, pose.right_shoulder.x * scaleX, pose.right_shoulder.y * scaleY);
  line(pose.left_hip.x * scaleX, pose.left_hip.y * scaleY, pose.right_hip.x * scaleX, pose.right_hip.y * scaleY);
  line(pose.left_shoulder.x * scaleX, pose.left_shoulder.y * scaleY, pose.left_elbow.x * scaleX, pose.left_elbow.y * scaleY);
  line(pose.left_wrist.x * scaleX, pose.left_wrist.y * scaleY, pose.left_elbow.x * scaleX, pose.left_elbow.y * scaleY);
  line(pose.right_shoulder.x * scaleX, pose.right_shoulder.y * scaleY, pose.right_elbow.x * scaleX, pose.right_elbow.y * scaleY);
  line(pose.right_elbow.x * scaleX, pose.right_elbow.y * scaleY, pose.right_wrist.x * scaleX, pose.right_wrist.y * scaleY);
  line(pose.left_hip.x * scaleX, pose.left_hip.y * scaleY, pose.left_knee.x * scaleX, pose.left_knee.y * scaleY);
  line(pose.left_knee.x * scaleX, pose.left_knee.y * scaleY, pose.left_ankle.x * scaleX, pose.left_ankle.y * scaleY);
  line(pose.right_hip.x * scaleX, pose.right_hip.y * scaleY, pose.right_knee.x * scaleX, pose.right_knee.y * scaleY);
  line(pose.right_knee.x * scaleX, pose.right_knee.y * scaleY, pose.right_ankle.x * scaleX, pose.right_ankle.y * scaleY);
  
  fill(blue.r, blue.g, blue.b);
  triangle(pose.left_shoulder.x * scaleX, pose.left_shoulder.y * scaleX, pose.right_shoulder.x * scaleX, pose.right_shoulder.y * scaleX, curr.midHip.x * scaleX, curr.midHip.y * scaleX);
  noFill();
  line(curr.midShoulder.x * scaleX, curr.midShoulder.y * scaleY, curr.midHip.x * scaleX, curr.midHip.y * scaleY);

  circle((pose.left_ear.x + pose.right_ear.x) / 2 * scaleX, (pose.left_ear.y + pose.right_ear.y) / 2 * scaleX, abs(pose.left_ear.x - pose.right_ear.x) * scaleX);
  line(pose.nose.x * scaleX, pose.nose.y * scaleX, curr.midShoulder.x * scaleX, curr.midShoulder.y * scaleX);
  
  // rect(curr.box.xMin * scaleX + 90, curr.box.yMin * scaleY + 70, pose.box.width, pose.box.height);

  fill(blue.r, blue.g, blue.b);
  // noStroke();
  for (let i = 5; i < pose.keypoints.length; i++) {
    
    let keypoint = pose.keypoints[i];
    // console.log(keypoint);
    circle(keypoint.x * scaleX, keypoint.y * scaleY, 10);
  }
  pop();
}

function drawParameters() {

  let left_arm_bar = document.getElementById('left-arm');
  let scalel = map(curr.rightHandSpan, 30, 200, 0, 1, true);
  let wl = left_arm_bar.parentElement.clientWidth * scalel;
  left_arm_bar.style.width = `${wl}px`;

  let right_arm_bar = document.getElementById('right-arm');
  let scaler = map(curr.leftHandSpan, 30, 200, 0, 1, true);
  let wr = right_arm_bar.parentElement.clientWidth * scaler;
  right_arm_bar.style.width = `${wr}px`;

  let slant = map(curr.angle, -30, 30, -34, 34, true);

  let torso_bar = document.getElementById('torso-bar');
  // let wtl = torso_.parentElement.clientWidth * scaletl;
  torso_bar.style.transform = `skewX(${slant}deg)`;

}

function drawCapture() {
  // let capture_la = document.getElementById("left-arm-capture");
  // let capture_ra = document.getElementById("right-arm-capture");
  // let capture_ts = document.getElementById("torso-capture");
  getBoundingBox(0,[curr.pose.nose, curr.pose.left_hip, curr.pose.right_hip, curr.pose.left_shoulder, curr.pose.right_shoulder, curr.pose.left_elbow, curr.pose.right_elbow]);
  getBoundingBox(1,[curr.pose.left_shoulder, curr.pose.left_elbow, curr.pose.left_wrist]);
  // console.log(box_la);
  getBoundingBox(2,[curr.pose.right_shoulder, curr.pose.right_elbow, curr.pose.right_wrist]);
 

  // let img_la = get(box_la.x, box_la.y, box_la.l, box_la.l);
  // loadImageElement("left-arm-capture", img_la);
  
}


function getBoundingBox(z,keypoints) {
  let scaleX = vwidth / 640;

  let xmin = 3000, ymin = 3000, xmax = -1, ymax = -1;

  for (let kp of keypoints) {
    // console.log(kp);
    xmin = min(xmin, kp.x);
    ymin = min(ymin, kp.y);
    xmax = max(xmax, kp.x);
    ymax = max(ymax, kp.y);
    // console.log(`xmin: ${xmin}, ymin: ${ymin}`);
  }

  let wbox = max(xmax - xmin, ymax - ymin);
  let hbox = max(xmax - xmin, ymax - ymin);
  let margin = 30;

  let x, y, l;

  if (wbox > hbox) {
    x = xmin - margin;
    y = ymin - (wbox - hbox) / 2 - margin; 
    l = wbox + margin * 2;
  } else {
    x = xmin - (hbox - wbox) / 2 - margin; 
    y = ymin - margin; 
    l = hbox + margin * 2;
    // image(bgc,x,y,l,l)
  }

  x *= scaleX;
  y *= scaleX;
  l *= scaleX;

  x += marginlr / 2;
  y += margintb / 2;


  


  push();
  noFill();
  stroke(blue.r, blue.g, blue.b);
  // fill(255, 0,0);

  
  
  rect(x, y, l);

  if(z==2){
    img1=get(x,y,l,l)
    let imgElement = createImg(img1.canvas.toDataURL());
  
    document.getElementById('left-arm-capture').innerHTML=""
    imgElement.parent('left-arm-capture'); // 将图像元素添加到指定的 div 中
  
    }
    if(z==1){
    img1=get(x,y,l,l)
    let imgElement = createImg(img1.canvas.toDataURL());
  
    document.getElementById('right-arm-capture').innerHTML=""
    imgElement.parent('right-arm-capture'); // 将图像元素添加到指定的 div 中
  
    }
    if(z==0){
    img1=get(x,y,l,l)
    let imgElement = createImg(img1.canvas.toDataURL());
  
    document.getElementById('torso-capture').innerHTML=""
    imgElement.parent('torso-capture'); // 将图像元素添加到指定的 div 中
  
    }
 
  pop();

  return { x: x, y: y, l: l };
}

function displayTitle() {
  let slant = map(curr.angle, -50, 50, -90, 90, true);
  title.style.fontVariationSettings = "'slnt' " + slant;

  // console.log(title.style.fontVariationSettings);
}

function displayText() {
  // slant: indicates the tilt of torso
  // displacement from midpoint of hips to midpoint of shoulders
  let slant = map(curr.angle, -30, 30, -12, 12, true);

  // thin stroke: left span indicates spread of left arm
  let thinStroke = (map(curr.rightHandSpan, 30, 200, 0, 100, true));
  // thick stroke: right span indicates spread of right arm
  let thickStroke = (map(curr.leftHandSpan, 30, 200, 0, 100, true));

  let fvs = "";
  fvs += "'slnt' " + (checkbox_slant.checked ? slant : "0") + ", ";
  fvs += "'yopq' " + (checkbox_leftStroke.checked ? thinStroke : "0") + ", ";
  fvs += "'xopq' " + (checkbox_rightStroke.checked ? thickStroke : "0");
      // console.log(fvs);

  for (let v of textContent.querySelectorAll('.v')) {
    v.style.fontVariationSettings = fvs;
  }

  for (let i of textFootnotes.querySelectorAll('.italic')) {
    i.style.fontVariationSettings = "'slnt' " + slant;
  }

  if (document.querySelector('#sample-leftStroke')) {
    document.querySelector('#sample-leftStroke').style.fontVariationSettings = "'yopq' " + thinStroke;
  } 

  if (document.querySelector('#sample-rightStroke')) {
    document.querySelector('#sample-rightStroke').style.fontVariationSettings = "'xopq' " + thickStroke;
  }

  if (document.querySelector('#sample-slant')) {
    document.querySelector('#sample-slant').style.fontVariationSettings = "'slnt' " + slant;
  }
}

function updatePose(pose) {
  if (!curr) {
    curr = { 
      pose: pose,
      midShoulder: { x: ( pose.left_shoulder.x + pose.right_shoulder.x ) / 2, y: ( pose.left_shoulder.y + pose.right_shoulder.y ) / 2 },
      midHip: { x: (pose.left_hip.x + pose.right_hip.x ) / 2, y: ( pose.left_hip.y + pose.right_hip.y ) / 2 },
      leftHandSpan: abs( pose.left_shoulder.x - pose.left_wrist.x ),
      rightHandSpan: abs( pose.right_shoulder.x - pose.right_wrist.x ),
      leftFeetSpan: abs( pose.left_hip.x - pose.left_ankle.x ),
      rightFeetSpan: abs( pose.right_hip.x - pose.right_ankle.x ),
    }
    curr.angle = (curr.midShoulder.x - curr.midHip.x) / ((curr.midShoulder.y - curr.midHip.y) / 100);

  } else {
    for (let i = 0; i < pose.keypoints.length; i++) {
      const kp = pose.keypoints[i];
      if ( kp.confidence > 0.3 ) {
        curr.pose[kp.name].x = (curr.pose[kp.name].x + kp.x) / 2;
        curr.pose[kp.name].y = (curr.pose[kp.name].y + kp.y) / 2;
        curr.pose.keypoints[i].x = curr.pose[kp.name].x;
        curr.pose.keypoints[i].y = curr.pose[kp.name].y;
      }
    }
    if ( pose.score > 0.3 ) {
      curr.pose.box = pose.box;
      const p = curr.pose;
      curr.midShoulder = { x: ( p.left_shoulder.x + p.right_shoulder.x ) / 2, y: ( p.left_shoulder.y + p.right_shoulder.y ) / 2 };
      curr.midHip = { x: (p.left_hip.x + p.right_hip.x ) / 2, y: ( p.left_hip.y + p.right_hip.y ) / 2 };
      curr.leftHandSpan = abs( p.left_shoulder.x - p.left_wrist.x );
      curr.rightHandSpan = abs( p.right_shoulder.x - p.right_wrist.x );
      curr.leftFeetSpan = abs( p.left_hip.x - p.left_ankle.x );
      curr.rightFeetSpan = abs( p.right_hip.x - p.right_ankle.x );
      curr.angle = (curr.midShoulder.x - curr.midHip.x) / ((curr.midShoulder.y - curr.midHip.y) / 100);
    }
  }
}

// convert the bodyPose data to a 1D array
function flattenPoseData() {
  let pose = poses[0];
  let poseData = [];
  for (let i = 0; i < pose.keypoints.length; i++) {
    let keypoint = pose.keypoints[i];
    poseData.push(keypoint.x);
    poseData.push(keypoint.y);
  }
  return poseData;
}

// Callback function for when bodyPose outputs data
function gotPoses(results) {
  poses = results;
}

// function gotSegmentation(result) {
//   segmentation = result;
// }

// Callback function for when the classifier makes a classification
function gotClassification(results) {
  classification = results[0].label;
}

// Callback function for when the pre-trained model is loaded
function modelLoaded() {
  isModelLoaded = true;
}

function redirect2train() {
  window.location.href = "train.html";
}

function initiateArticle() {

}

function bindButtonEvents() {
  btn_next.addEventListener("click", () => {
    textContainer.removeChild(textContent);
    addLines(["that it <span class=\"v\">h</span>as the "]);
  });
}

class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

function windowResized() {
  // if ( windowWidth > 800 ) {

    let w = container.clientWidth * 0.4 - 13;
    let h = container.clientWidth * 0.4 * 0.75;
    resizeCanvas(w, h);

    vwidth = w - marginlr;
    vheight = vwidth * 0.75;

  // } else {

  //   let w = container.clientWidth;
  //   let h = container.clientHeight;
  //   resizeCanvas(w, h);

  //   vwidth = w - 120;
  //   vheight = (w - 120) * 0.75;

  // }
  
}

function addLines(texts) {
  const newP = document.createElement("p");
  newP.classList.add("text-content");

  let content = "";

  for (let t of texts) {
    t = t + "<br>";
    content += t;
  }

  const newTextNode = document.createTextNode(content);

  newP.appendChild(newTextNode);

  textContainer.insertBefore(newP, textFootnotes);
}