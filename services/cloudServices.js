// imports
const fetch = require('node-fetch');
const dotenv = require('dotenv');


// set up config vars
dotenv.config();


const Dropbox = require('dropbox').Dropbox;
const box = new Dropbox({accessToken: process.env.DROPBOX_TOKEN});

box.usersGetCurrentAccount()
    .then(function(res) {
        console.log(res);
    })
    .catch(function(err) {
        console.error(err);
    })

async function uploadVideo(file, urlPath) {
    try {
        const response = await box.filesUpload({path: urlPath, contents : file});
        if (response.ok) {
            console.log("uploaded successfully");
        }
    } catch (err) {
        console.error("Error: ", err);
    }
};

const cloudServices = {uploadVideo}


module.exports = cloudServices;