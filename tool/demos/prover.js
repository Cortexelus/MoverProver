import { toggle_censor } from './camera'

const randombytes = require("randombytes");
const bigInt = require("big-integer");
const biformat = require("biguint-format");


function _convertPoseObj(pose){
  const _pose = {}
  for(const p in pose["keypoints"]){
    const part = pose["keypoints"][p]
    _pose[part["part"]] = part
  }
  return _pose;
}
var pose = {
  "score": 0.32371445304906,
  "keypoints": [
    {
      "position": {
        "y": 76.291801452637,
        "x": 253.36747741699
      },
      "part": "nose",
      "score": 0.99539834260941
    },
    {
      "position": {
        "y": 71.10383605957,
        "x": 253.54365539551
      },
      "part": "leftEye",
      "score": 0.98781454563141
    },
    {
      "position": {
        "y": 71.839515686035,
        "x": 246.00454711914
      },
      "part": "rightEye",
      "score": 0.99528175592422
    },
    {
      "position": {
        "y": 72.848854064941,
        "x": 263.08151245117
      },
      "part": "leftEar",
      "score": 0.84029853343964
    },
    {
      "position": {
        "y": 79.956565856934,
        "x": 234.26812744141
      },
      "part": "rightEar",
      "score": 0.92544466257095
    },
    {
      "position": {
        "y": 98.34538269043,
        "x": 399.64068603516
      },
      "part": "leftShoulder",
      "score": 0.99559044837952
    },
    {
      "position": {
        "y": 95.082359313965,
        "x": 458.21868896484
      },
      "part": "rightShoulder",
      "score": 0.99583911895752
    },
    {
      "position": {
        "y": 94.626205444336,
        "x": 163.94561767578
      },
      "part": "leftElbow",
      "score": 0.9518963098526
    },
    {
      "position": {
        "y": 150.2349395752,
        "x": 245.06030273438
      },
      "part": "rightElbow",
      "score": 0.98052614927292
    },
    {
      "position": {
        "y": 113.9603729248,
        "x": 393.19735717773
      },
      "part": "leftWrist",
      "score": 0.94009721279144
    },
    {
      "position": {
        "y": 186.47859191895,
        "x": 257.98034667969
      },
      "part": "rightWrist",
      "score": 0.98029226064682
    },
    {
      "position": {
        "y": 208.5266418457,
        "x": 284.46710205078
      },
      "part": "leftHip",
      "score": 0.97870296239853
    },
    {
      "position": {
        "y": 209.9910736084,
        "x": 243.31219482422
      },
      "part": "rightHip",
      "score": 0.97424703836441
    },
    {
      "position": {
        "y": 281.61965942383,
        "x": 310.93188476562
      },
      "part": "leftKnee",
      "score": 0.98368924856186
    },
    {
      "position": {
        "y": 282.80120849609,
        "x": 203.81164550781
      },
      "part": "rightKnee",
      "score": 0.96947449445724
    },
    {
      "position": {
        "y": 360.62716674805,
        "x": 292.21047973633
      },
      "part": "leftAnkle",
      "score": 0.8883239030838
    },
    {
      "position": {
        "y": 347.41177368164,
        "x": 203.88229370117
      },
      "part": "rightAnkle",
      "score": 0.8255187869072
    }
  ]
}

var MOD = 0

export function normalize(input_pose){
  let pose = JSON.parse(JSON.stringify(input_pose));
  const _pose = _convertPoseObj(pose);
  const ls = _pose["leftShoulder"]["position"]
  const rs = _pose["rightShoulder"]["position"]
  const lh = _pose["leftHip"]["position"]
  const rh = _pose["rightHip"]["position"]
  // the CENTER POINT is the MEAN point of the torso
  const midx = (ls["x"] + rs["x"] + lh["x"] + rh["x"])/4.0
  const midy = (ls["y"] + rs["y"] + lh["y"] + rh["y"])/4.0
  // SCALE is the euclidean distance between the shoulder midpoint and the hip midpoint
  const a = (lh["x"]+rh["x"])/2 - (ls["x"]+rs["x"])/2
  const b = (lh["y"]+rh["y"])/2 - (ls["y"]+rs["y"])/2
  const scale = Math.sqrt(Math.pow((a),2) + Math.pow((b),2))

  if (MOD % 1000 === 0) {
    console.log("midx:", midx)
    console.log("midy:", midy)
    console.log("scale:", scale)
    for(const p of pose["keypoints"]){
      switch(p.part) {
        case "leftShoulder":
          console.log("leftShoulder", p.position); break
        case "rightShoulder":
          console.log("rightShoulder", p.position); break
        case "rightHip":
          console.log("rightHip", p.position); break
        case "leftHip":
          console.log("leftHip", p.position); break
        default:
          break
      }
    }
    console.log("---------------------")
  }
  MOD += 1


  // subtract the mids, divide by scale
  for(const p in pose["keypoints"]){
    pose["keypoints"][p]["position"]["x"] -=  midx
    pose["keypoints"][p]["position"]["x"] /=  scale
    pose["keypoints"][p]["position"]["y"] -=  midy
    pose["keypoints"][p]["position"]["y"] /=  scale

    pose["keypoints"][p]["position"]["x"] *= 100
    pose["keypoints"][p]["position"]["x"] += 300
    pose["keypoints"][p]["position"]["y"] *= 100
    pose["keypoints"][p]["position"]["y"] += 300
  }

  return pose
}

// takes a normalized_pose json dictinoary, outputs a tensory multidimensional list for tfjs classifier model which has been normalized between -1 and 1
export function tensorize(pose){
  let p = _compressPoseObj(pose);
  p = normalize_the_tensor(p);
  return p;
}

// This function is bad practice to have hardcoded here..
// This normalizes the pose values between -1 and 1 
function normalize_the_tensor(pose){
  let x_mean = 296.0
  let x_std = 100.0
  let y_mean = 296.0
  let y_std = 126.0
  for(let p in pose){
    pose[p][0] -= x_mean;
    pose[p][0] /= x_std;
    pose[p][1] -= y_mean;
    pose[p][1] /= y_std/2;
  }
  return pose
}

var current_recording = [];
var is_recording = false; 
var saved_recordings = [];
var start_time = 0;

function initRecordingSession(){
  current_recording = [];
  is_recording = false;
  saved_recordings = [];
  video_data = [];
  start_time = 0;
  move_id = new_move_id();

}

function new_move_id(){
  return bigInt(biformat(randombytes(8), 'dec')).toString();
}

function startRecording(){
  current_recording = [];
  is_recording = true;
  start_time = Date.now();
}

function stopRecording(keep){
  is_recording = false;
  if(keep){
    saved_recordings.push(current_recording);
  }
  current_recording = [];
}

window.getSavedRecordings = function(){
  return saved_recordings;
}

// records the pose 
export function recordPose(pose){
  if(is_recording){
    let original = window.JSON.parse(window.JSON.stringify(pose));
    let normalized = normalize(pose);
    const timestamp = Date.now() - start_time;
    //console.log(timestamp, normalized, original);
    //const obj = _compressedPoseObj(original, normalized, timestamp);
    original = _compressPoseObj(original);
    normalized = _compressPoseObj(normalized);
    current_recording.push([timestamp, normalized])
  }
}

// Makes a compressed representation of the pose data
// To reduce the file size
// And to easily load into numpy 
function _compressPoseObj(pose){
  const _pose = []
  const pose_with_names = _convertPoseObj(pose)
  let names = ["leftAnkle","leftEar","leftElbow","leftEye","leftHip","leftKnee","leftShoulder","leftWrist","nose","rightAnkle","rightEar","rightElbow","rightEye","rightHip","rightKnee","rightShoulder","rightWrist"];
  for(let n in names){
    let part = pose_with_names[names[n]]
    let x = parseInt(part["position"]["x"]);
    let y = parseInt(part["position"]["y"]);
    let score = parseFloat(part["score"].toFixed(4));
    _pose.push([x, y, score])
  }
  
  return _pose;
}


function downloadJSON(json_data){
  let json_data_string = window.JSON.stringify(json_data,null, 2)
  download(json_data_string, move_id +".json", 'application/json');
}

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}


// UI

function show(id){
  document.querySelector(id).style.display = "block";
}
function hide(id){
  document.querySelector(id).style.display = "none";
}
function set_status(text){
  document.querySelector("#status").innerHTML = text;
  if(text.length>0){
    show("#status")
  }
}
function hide_all(){
  hide("#start-button");
  hide("#record-button");
  hide("#keep-button");
  hide("#dont-keep-button");
  hide("#finish-button");
  hide("#submit-button");
  hide("#email-input");
  hide("#username-input");
  hide("#movename-input");
  hide("#next-button");
  set_status("");
}
function init_ui(){
  set_status("");
  show("#start-button");
  menu_stage = 0;
  VideoRequest();

}

let menu_stage = 0;
init_ui();

var move_id = undefined;

function click_start_button(){
  hide_all();
  show("#record-button");
  set_status("New session has started");
  menu_stage = 1;
  initRecordingSession()

}

function click_record_button(){
  hide_all();
  show("#keep-button");
  show("#dont-keep-button");
  startRecording();
  VideoStartRecording();

  set_status("Recording in progress");
  menu_stage = 2;
}

function click_dont_keep_button(){
  hide_all();
  show("#record-button");
  show("#finish-button");
  stopRecording(false);
  VideoStopRecording(false);
  set_status("Deleted recording. Total recordings: " + saved_recordings.length);
  menu_stage = 1;

}

function click_keep_button(){
  hide_all();
  show("#record-button");
  show("#finish-button");
  stopRecording(true);
  VideoStopRecording(true);

  set_status("Record successful. Total recordings: " + saved_recordings.length);
  menu_stage = 1;
}

function click_finish_button(){
  hide_all();
  show("#email-input");
  show("#username-input");
  show("#movename-input");
  document.querySelector("#movename-input input").value = ""
  //document.querySelector("#username-input input").value = ""
  //document.querySelector("#email-input input").value = ""
  show("#submit-button");
  set_status("Register your move. Total recordings: " + saved_recordings.length);
  menu_stage = 3;

}

function click_submit_button(){
  hide_all();
  set_status("Submission successful");
  let json_data = {
    "move_id": move_id,
    "username": document.querySelector("#username-input input").value, 
    "email": document.querySelector("#email-input input").value, 
    "movename": document.querySelector("#movename-input input").value, 
    "saved_recordings": saved_recordings
  }
  downloadJSON(json_data);
  VideoDownload();
  show("#start-button");
  menu_stage = 0;
}

document.querySelector("#start-button").onclick = click_start_button;
document.querySelector("#record-button").onclick = click_record_button;
document.querySelector("#dont-keep-button").onclick = click_dont_keep_button;
document.querySelector("#keep-button").onclick = click_keep_button;
document.querySelector("#finish-button").onclick = click_finish_button;
document.querySelector("#submit-button").onclick = click_submit_button;

document.body.onkeyup = function(e){
    if(e.keyCode == 32){
      if(menu_stage==0){
        //click_start_button();
      }else if(menu_stage==1){
        click_record_button();
      }else if(menu_stage==2){
        click_keep_button();
      }
    }else if(e.keyCode == 8){
      let show = document.getElementById("classification").style.display
      if(show=="block") document.getElementById("classification").style.display = "none"
      else document.getElementById("classification").style.display = "block"
    }else if(e.keyCode == 187){
      toggle_censor();
    }else if(e.keyCode == 220){
      toggle_hammer();
    }
}
/*
document.querySelector("#finish-button").onclick = function(){
  hide_all();
  show_input_form(0);
}

let stage = 0; 

function show_input_form(stage){
  hide_all();
  if(stage==0){
    show("#email-input");
    show("#next-button");
  }else if(stage==1){
    show("#username-input");
    show("#next-button");
  }else if(stage==2){
    show("#movename-input");
    show("#submit-button");
  }
}
document.querySelector("#next-button").onclick = function(){
  hide_all();
  stage+=1
  show_input_form(stage)
}*/


var video, stream, recorder;
video = document.getElementById('video');
let video_data = []
function VideoRequest() {
  navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    })
    .then(stm => {
      stream = stm;
      //video.src = URL.createObjectURL(stream);
    }).catch(e => console.error(e));
}

function VideoStartRecording() {
  recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm'
  });
  recorder.start();
}


function VideoStopRecording(keep) {
  if(keep){
    recorder.ondataavailable = e => {
      let content = e.data;
      video_data.push(content);
    };
  }
  recorder.stop();
}

function VideoDownload(){
  for(let i in video_data){
    let content = video_data[i];
    let fileName = [move_id, '.', i, '.webm'].join('');
    let contentType = "video/webm"
    download(content, fileName, contentType);
  }
}

let show_hammer = false;
var hammer_audio = new Audio('http://localhost:1234/hammer/11080803.mp3');
function toggle_hammer(){
  show_hammer = !show_hammer;
  if(show_hammer){
    document.getElementById("hammer").style.display = "block";
    hammer_audio.play();
  }else{
    document.getElementById("hammer").style.display = "none";
    hammer_audio.pause();
  }
}

 