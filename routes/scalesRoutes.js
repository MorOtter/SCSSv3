//  imports
const express = require('express');


const router = express.Router();

// helper
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

//  get scales views
router.get("/getScale", (req, res) => {
  let scales = ['/scales/sart', '/scales/nasa'];
  if (req.session.condition !== 'noAdvisor') {
    scales.push('/scales/tias');
  }
  shuffleArray(scales);
  req.session.scales = scales;
  let nextScale = scales.pop();
  req.session.currentScale = nextScale;
  res.redirect(nextScale);
})
  
  // handle scale posts
router.post("/addScale", async (req, res) => {
    let data = req.body;    
    let category;
    switch (req.session.trialNumber) {
      case 1:
        category = "pre-trials";
        break;
      case 3:
        category = "mid-trials";
        break;
      case 5:
        category = "post-trials";
        break;
      default:
        category = "error-finding-stage";
    }
    let firstDataEle = Object.keys(data)[0];
    let typeOfScale = firstDataEle.slice(0,4);
    let inputs = Object.values(data);
    let scaleId = await req.dbServices.insertScale(req.session.username, typeOfScale, category);
    for (let i = 0; i < inputs.length; i++){
      await req.dbServices.insertItem(i+1, scaleId, inputs[i]);
    }
    console.log(req.session.scales.length);
    if (req.session.scales.length === 0) { // check if scales complete
      res.redirect("/information/rules")
    } else {
      let scales = req.session.scales
      let nextScale = scales.pop();
      req.session.currentScale = nextScale;
      res.redirect(nextScale);
    }
});

// get TIAS view
router.get("/tias", (req,res) => {
    res.render("tias.ejs");
});
  
  // get sart view
router.get("/sart", (req,res) => {
    res.render("sart.ejs");
});
  
  // get nasa view
router.get("/nasa", (req,res) => {
    res.render("nasa.ejs");
});

module.exports =   router;
