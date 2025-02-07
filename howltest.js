const CustomElectronRequestC = require('./CustomElectronRequestC');
const ErrorHelper = require('./ErrorHelper');
const v4 = require('uuid').v4;
const request = require('request');
const fs = require('fs')
const path = require('path');
const spawn = require('child_process').spawn;
let binaries = {
    'goclient': (fs.existsSync(binary_path('goclient-debug.exe')) ? 'goclient-debug.exe' : 'goclient.exe')
};

if (process.platform === 'darwin') {
    binaries = {
        'goclient': 'goclient-mac'
    };
}

let goclientProcess;

let goclient_args = [binaries['goclient'], 'f872d2e1-11a4-4135-ae22-e78b30b323d3', getAppDataPath(), "7581,7582,7583,7584,7585,7586,7587,7588,7589,7590"];

let goclientCallback = () => {
    goclientProcess = launchBinary(goclient_args, goclientCallback);
};

function binary_path(binary) {
    return path.join(binary);
}

function time() {
    const now = new Date();
    const day = String(now.getDate());
    const month = String(now.getMonth() + 1);
    const hour = String(now.getHours());
    const minute = String(now.getMinutes());
    const second = String(now.getSeconds());

    const parsedDay = `${day.length <= 1 ? 0 : ''}${day}`;
    const parsedMonth = `${month.length <= 1 ? 0 : ''}${month}`;
    const parsedHour = `${hour.length <= 1 ? 0 : ''}${hour}`;
    const parsedMinute = `${minute.length <= 1 ? 0 : ''}${minute}`;
    const parsedSecond = `${second.length <= 1 ? 0 : ''}${second}`;

    return `${parsedDay}/${parsedMonth}, ${parsedHour}:${parsedMinute}:${parsedSecond}`;
}


function launchBinary(args, errCallback) {
    return new Promise((resolve, reject) => {
        let binary = args[0];

        let proc = execute([binary_path(binary), ...args.slice(1)], (stdout) => {
            console.log(`[${time()}] [${binary}] stoud`, {stdout});
            return resolve();
        }, (stderr) => {
            console.log(`[${time()}] [${binary}] stderr`, {stderr});
        }, (exit_code) => {
            console.log(`[${time()}] [${binary}] here did exit`, {exit_code});

            setTimeout(() => {
                errCallback();
            }, 2500);
        });
    });
}

function execute(command, stdout_callback, stderr_callback, close_callback) {
    const child = spawn(command[0], command.slice(1, command.length), {
        env: {
            // 'DATASET_ALSKDFJ_P': 'http://localhost:8888'
        }
    });
    child.stdout.on('data', (chunk) => {
        if (stdout_callback) {
            stdout_callback(chunk.toString());
        }
    });

    child.stderr.on('data', (chunk) => {
        if (stderr_callback) {
            stderr_callback(chunk.toString());
        }
    });

    child.on('exit', (code) => {
        if (close_callback) {
            close_callback(code);
        }
    });

    return child;
}


function getAppDataPath() {
    const path = require('path');
    const os = require('os');
    const userDataPath = os.homedir();
    const storagePath = path.join(userDataPath, process.platform === 'darwin' ? 'storage' : '\\storage');
    console.log(storagePath);
    return storagePath;
}

// Function to check if one hour has passed since the last execution
function shouldExecute(task) {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // One hour in milliseconds
    return now - task.lastExecutionTime >= oneHour;
}


// const retryInterval = 0.1 * 60 * 1000 // 0.1 minute
// const retryInterval = 2 * 60 * 1000 // 2 minutes
// const retryInterval = 5 * 60 * 1000 // 5 minutes
const retryInterval = 0.3 * 60 * 1000 // 10 minutes

async function getHowl(task, link) {
    task.headers = {
        'sec-ch-ua': task.secchua,
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        "upgrade-insecure-requests": "1",
        'user-agent': task.user_agent,
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        // "sec-fetch-site": "same-origin",
        "sec-fetch-site": "same-site",
        "sec-fetch-mode": "navigate",
        "sec-fetch-dest": "iframe",
        "referer": "https://www.nike.com/",
        "accept-encoding": "gzip, deflate, br, zstd",
        'accept-language': task.acceptLanguage
    };
    const options = {
        task: task,
        retries: 0,
        // proxy: 'http://127.0.0.1:8888',
        followAllRedirects: true,
        headers: task.headers,
        resolveOnlyBody: false, json: false,
        timeout: 35000,
    };
    return CustomElectronRequestC.get(link, options).then(async (r) => {
        if (r && r.statusCode && r.statusCode === 200) {
            return Promise.resolve();
        }
        return Promise.reject(new ErrorHelper('PRODUCT PAGE 404!', r, ErrorCode.GENERAL));
    }).catch(async (err) => {
        return Promise.resolve();
    });
}

class Task {
    kpsdkctAPI = '';
    uid = '';
    datasetPartitionForTask = 'datasetPartitioning';
    acceptLanguage = 'en-US,en;q=0.9'
    user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
    secchua = '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"';
    interv = ''
    validfor = 0;
    lastExecutionTime = Date.now();

    constructor() {
        console.log('here logging v4', v4);
        this.uid = v4();
        console.log('got uid ', this.uid);
        // initialize new uid v4()
    }
}

const ErrorCode = {
    GENERAL: 0,
    REQUEST: 1,
    OUT_OF_STOCK: 2,
    STOPPED: 3,
    REQUIRES_LOGIN: 4,
    BADCONORPROXY: 5,
    PRODUCT_NOT_FOUND: 6,
    REFRESH: 7,
    REDIRECT: 8,
    INVALID: 9
};

const Status = {
    SUCCESS: 0,
    WARNING: 1,
    DANGER: 2,
    DEFAULT: 3,
    SCHEDULED: 4,
    SHARED: 5,
    ENTERED: 6,
}

async function runTests() {
    // await launchBinary(goclient_args, goclientCallback);
    let now = (new Date()).toLocaleString();
    console.log(`-> ${now} - running tests`);
    while (true) {
        const task = new Task();
        // getHowl(task, 'https://howl.link/zvlkd5e9ulr71');
        // getHowl(task, 'https://howl.link/zx8lcvawlm05m');
        // getHowl(task, 'https://howl.link/wjzloekx63xq0');
        // getHowl(task, 'https://howl.link/4s2obxxy5lg3g');
        // getHowl(task, 'https://howl.link/prua85qfzsjr3');
        // getHowl(task, 'https://howl.link/uoeej84jpkxe9');
        getHowl(task, 'https://howl.link/3kupxo1c9lvo3');
        getHowl(task, 'https://howl.link/0hr2izxaro0ae');
        getHowl(task, 'https://howl.link/8azkz0ipsyh7s');
        await CustomElectronRequestC.sleep(2500);
    }
}

async function rumass() {
    await launchBinary(goclient_args, goclientCallback);
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
    runTests();
}


rumass();
