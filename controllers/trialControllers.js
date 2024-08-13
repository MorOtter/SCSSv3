const cloudServices = require("../services/cloudServices");
const flaskServices = require("../services/flaskServices");


// function to get video download and handle the formatting to go here





exports.startTrial = async (req, res, next) => {
    try {
        if (!req.session.condition) {
            return res.redirect('/');
        }
        await flaskServices.handleRecording("start");
        
        // Retrieve experiment info
        
        const condition = req.session.condition;
        const group = req.session.group;
        const censorship = req.session.censoredInfo;
        let conditionText = '';
        const censoredArrayNumber = req.session.censoredArrayNumber;
        req.session.trialStartTime = new Date().toISOString();
        
        const packetArray = req.session.packetArray.map(x => x);
    
        // set condition text to be more user friendly
        switch (condition) {
        case "noAdvisor":
            conditionText = "No Advisor"; 
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
        res.render('trial.ejs', { conditionText, group, censorship, censoredArrayNumber, packetArray: JSON.stringify(packetArray)})
    } catch (err) {
        console.error(err);
    }
}



exports.stopTrial = async (req, res, next) => {
    try {
        const trialEndTime = req.body["trialEndTime"];
        
        await flaskServices.handleRecording('stop');
        const trialVideo = await flaskServices.downloadVideo();
        const trialVideoName = `/EXP 1/${req.session.participantId} - ${req.session.trialNumber}`; 
        await cloudServices.uploadVideo(trialVideo, trialVideoName)

        const trialType = req.session.trialNumber === 0 ? 'test' : 'main';
        
       
        const trialId = await req.dbServices.insertTrial(req.session.participantId, trialType, req.session.trialNumber, req.session.trialStartTime, trialEndTime, trialVideoName);
      

        req.session.trialNumber++;

        
        for (let input of req.body["input"]) {
         
            input['time'] = input['time'] ? input['time'] : new Date().toISOString();
          
            await req.dbServices.insertPacket(trialId, input.user, input.advisor, input.accepted, input.time);
       
        }
        res.redirect("/information/rules");
        
    } catch (err) {
        console.error("Error caught :",err);
    }

}


