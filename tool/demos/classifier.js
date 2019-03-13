import * as tf from '@tensorflow/tfjs';


var model = undefined;
export function load_classifier(){
  tf.loadLayersModel('http://localhost:1234/classifier-net/model.json').then(function(_model){
    model = _model;
    console.log("loaded classifier model");
  });
}

export function classify_pose_sequence(sequence){
  if(model!=undefined){
    //console.log(sequence)
    let tensor_sequence = tf.tensor(sequence)
    let prediction = model.predict(tensor_sequence)
    prediction = Array.from(prediction.dataSync());
    return prediction
  }else{
    console.error("classifier not loaded")
    return undefined;
  }
}

export function class_id_to_name(class_id){
  let class_names = ['Shake It All About', 'The Nobody', 'The Juju Jive', 'African Sun Calling', 'The Wave', 'Running Man', 'The Funky Jumping Jack', 'The Pushup', 'The Jumping Jack', 'The Bridge Lift', 'Quiet Before the Storm', 'The Pincer', 'The Typening', 'The Sitting Too Close', 'The CJ Sip', 'Mr BigHead'];
  return class_names[class_id];
}