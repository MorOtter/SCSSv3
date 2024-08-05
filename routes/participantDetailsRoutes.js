// imports
const express = require('express');
// import { insertParticipant, getNextId, insertFeedback } from '../services/dbServices';
const setPacketArray = require('../public/scripts/packet')

// set router const
const router = express.Router();

router.post("/login", async (req, res) => {

    // set up id number
    const participantId = await req.dbServices.getNextId();
    
    // set up experiment parameters
    const conditionNumber= participantId % 3;
    const groupNumber = parseInt(participantId) % 2;
    const censoredInfoNumber = Math.floor(participantId / 4) % 2;
  
    let condition = '';
    switch (conditionNumber) {
      case 0:
        condition = "noAdvisor";
        break;
      case 1:
        condition = "humanAdvisor";
        break;
      case 2:
        condition = "aiAdvisor";
        break;
      default:
        condition = "noAdvisor"; // Default to noAdvisor
    }
  
    let groupName = groupNumber === 0 ? "A" : 'B';
    let censoredInfo = censoredInfoNumber === 0 ? 'RIO' : 'SIO';
  
    // let experiment = new Experiment();
    // experiment.init(participantId, condition, groupName, censoredInfo);
    
    const packetArray = setPacketArray();
    req.session.packetArray = packetArray;
    const censoredArrayNumber = censoredInfo === 'RIO' ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 4); // made a check here to account for the differing lengths of RIO and SIO conditions. RIO condition has 3 items and SIO still has 4 
  
    // Save the group in the user's session
    req.session.username = participantId;
    req.session.condition = condition;
    req.session.group = groupName;
    req.session.censoredInfo = censoredInfo
    req.session.censoredArrayNumber = censoredArrayNumber;
    req.session.trialNumber = 0;
    req.session.getScales = false;
    
    await req.dbServices.insertParticipant(participantId, condition, groupNumber, censoredInfo)
  
    // Redirect to the description page after login
    res.redirect('/information/description');
});

// get feedback view
router.get("/feedback", (req,res) => {
  res.render("feedback.ejs");
})

router.post("/feedback", async (req, res) => {
  let feedback = req.body.feedback;
  
  await req.dbServices.insertFeedback(req.session.username, feedback);
  res.redirect("/information/debrief")
})


module.exports = router;