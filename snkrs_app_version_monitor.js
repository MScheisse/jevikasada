const axios = require("axios");
const cron = require("node-cron");
const fs = require("fs");
const request = require("request");
require("dotenv").config();

const APP_ID = "911130812"; // Replace with your iOS app's App Store ID
const CHECK_INTERVAL = "*/30 * * * *"; // Every 30 minutes
const DATA_FILE = "latest_version.json";

async function getAppStoreInfo() {
    try {
        const url = `https://itunes.apple.com/lookup?id=${APP_ID}`;
        const response = await axios.get(url);
        if (response.data.resultCount > 0) {
            return response.data.results[0];
        }
        return null;
    } catch (error) {
        console.error("Error fetching App Store data:", error.message);
        return null;
    }
}

function getLastVersion() {
    if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
        return data.version;
    }
    return null;
}

function saveVersion(version) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({version}), "utf8");
}

function toSlackObject(version) {
    function msToMinutes(milliseconds) {
        // Convert milliseconds to minutes by dividing by the number of milliseconds in a minute
        return milliseconds / (1000 * 60);
    }

    let text = `🚀 *New SNKRS IOS APP Update Detected!* 🎉\n\nThe app has been updated to *version ${version}*.`

    return {
        body: JSON.stringify({
            'username': 'TSB',
            'icon_emoji': ':robot_face:',
            'text': text
        }),
    };
}

function sendWebhook(lastSolvedIdApi, deviceid, uid, isvalid, validfor, msg = '') {
    let link = 'https://hooks.slack.com/services/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';
    let object = toSlackObject(lastSolvedIdApi, deviceid, uid, isvalid, validfor, msg);
    return new Promise((resolve, reject) => {
        request.post(link, object, (err, res, body) => {
            console.log('request send here', err, res, body);
            if (res && res.statusCode && ((res.statusCode.toString() === '204') || (res.statusCode.toString() === '200'))) {
                return resolve('');
            } else {
                if (res && res.statusCode) {
                    return reject(res.statusCode);
                } else {
                    return reject();
                }
            }
        });
    });
}

async function checkForUpdate() {
    console.log("Checking for updates...");

    const appInfo = await getAppStoreInfo();
    if (!appInfo) return;

    const latestVersion = appInfo.version;
    const lastVersion = getLastVersion();

    if (lastVersion !== latestVersion) {
        console.log(`App updated! Old: ${lastVersion}, New: ${latestVersion}`);
        sendWebhook(latestVersion);
        saveVersion(latestVersion);
    } else {
        console.log("No new updates.");
    }
}

// Schedule job to check every 30 minutes
cron.schedule(CHECK_INTERVAL, checkForUpdate);

checkForUpdate()

console.log("App Store monitor started... Checking every 30 minutes.");
