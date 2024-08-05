// imports

const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

async function convertBlobToFile(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const tempFilePath = path.join(__dirname, 'temp', 'facetracking.mp4');
  
  fs.mkdirSync(path.dirname(tempFilePath), {recursive:true});
  fs.writeFileSync(tempFilePath, buffer);

  return tempFilePath
}


// GET /game: Render the game page based on user group
router.get('/game', async (req, res) => {
    // Ensure session is defined
    if (!req.session.condition) {
      return res.redirect('/');
    }
    await req.flaskServices.handleRecording("start");
   
    // Retrieve experiment info
    
    const condition = req.session.condition;
    const group = req.session.group;
    const censorship = req.session.censoredInfo;
    let conditionText = '';
    const censoredArrayNumber = req.session.censoredArrayNumber;
    req.session.trialStartTime = new Date().toISOString();
    
    const packetArray = req.session.packetArray.map(x => x);
    // req.experiment.setCurrentStage();
  
    // Define recommendations based on group
    switch (condition) {
      case "noAdvisor":
        conditionText = "No Advisor"; // No recommendations for this group
        break;
      case "aiAdvisor":
        conditionText = "AI Advisor";
        break;
      case "humanAdvisor":
        conditionText = "Human Advisor";
        break;
      default:
        conditionText = ''; // Default to no recommendations
    }
  
    // Pass recommendations to the view
    res.render('game.ejs', { conditionText, group, censorship, censoredArrayNumber, packetArray: JSON.stringify(packetArray)});
  });
  
  //  handle adding data to Experiment
router.post("/addTrial", async (req, res) => {
    // get request
    const inputs = req.body['input'];
  
    await req.flaskServices.handleRecording("stop");
  
    // create and insert trial data
    req.session.trialEndTime = new Date().toISOString();
    let trialNumber = req.session.trialNumber;
    console.log(req.session.trialNumber)
    let trialType = '';
    if (req.session.trialNumber === 0) {
      trialType = 'test';
    } else {
      trialType = 'main';
    }
   
  
    const blob = await req.flaskServices.downloadVideo();
    const filePath = convertBlobToFile(blob);
    const trialVideoUrl = `/${req.session.username}-${req.session.trialNumber}`
    await req.cloudServices.uploadVideo(blob, trialVideoUrl)
      .catch(console.error);
    
  
    
  
    const trialId = await req.dbServices.insertTrial(req.session.username, trialType, trialNumber, req.session.trialStartTime, req.session.trialEndTime, trialVideoUrl.toString());
    trialNumber++;
    req.session.trialNumber = trialNumber;

    // insert packet data
    
    for (let input of inputs) {
      if (!input.time) {
        input["time"] = new Date().toISOString();
      }
      await req.dbServices.insertPacket(trialId, input.user, input.advisor, input.accepted, input.time);
    }

    res.sendStatus(200);

});

module.exports =   router;