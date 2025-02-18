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
    const storagePath = path.join(userDataPath, 'AppData', 'Roaming', 'tsb', process.platform === 'darwin' ? 'storage' : '\\storage');
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

// every one hour report if still valid or not

async function testJeviApi(task) {
    console.log('testing jevi api here');
    try {
        await generateFPApi(task);
        await solveApi(task);
        task.interv = setInterval(async () => { // check if still valid every 10 minutes
            await generateFPApi(task);
        }, retryInterval)
        sendWebhook(task.lastSolveIdAPI, task.deviceid, task.uid, true, task.validfor)
        console.log('done generating jevi api fp');
    } catch (e) {
        console.log('exception caught here', e);
        clearInterval(task.interv)
        sendWebhook(task.lastSolveIdAPI, task.deviceid, task.uid, false, task.validfor, e)
        // handle all errors when invalid - send to slack
    }
}

async function solveApi(task) {
    if (task.apiIpsJSUrl) {
        const ipsjsbody = await getIpsJSApi(task);
        const postTl = await jeviGetPostTlDataBeta(task, CustomElectronRequestC.btoa(ipsjsbody), 'api.nike.com');
        await postTlDataApi(task, postTl)
    }
    return Promise.resolve();
}

async function generateFPApi(task, retries = 0, isGS = false) {
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
    return CustomElectronRequestC.get('https://api.nike.com/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/fp?x-kpsdk-v=j-0.0.0', {
        task: task,
        headers: task.headers,
        resolveOnlyBody: false,
        retries: 0,
        timeout: 45000
    }).then(async (r) => {
        console.log('here r did resolve', r);
        if (r && r.statusCode === 200 && (!r.body || r.body.length === 0)) {
            throw ('KASADA API BLOCKED! PROCEED CAUTIOUSLY!', Status.DANGER);
        }
        if (r && r.body) {
            const extractedIPS = firstBetween(r.body, '<script src="', '"></script>');
            if (extractedIPS && extractedIPS !== -1) {
                task.apiIpsJSUrl = ('https://api.nike.com' + firstBetween(r.body, '<script src="', '"></script>')).split('amp;').join('');
            }
            if (r && r.statusCode === 200) {
                console.log('here still valid!');
                task.validfor = task.validfor + retryInterval;
                task.apiIpsJSUrl = '';
                if (shouldExecute(task)) { // report still valid every one hour
                    task.lastExecutionTime = Date.now();
                    sendWebhook(task.lastSolveIdAPI, task.deviceid, task.uid, true, task.validfor)
                    clearInterval(task.interv);
                }
                return Promise.resolve(r.statusCode.toString());
            }
        }
        return Promise.reject(new ErrorHelper('KASADA FAILURE!', r, ErrorCode.GENERAL));
    }).catch(async (err) => {
        console.log('here err exception caught', err);
        retries++;
        // console.log('ERR GENERATING KASADA API!', Status.WARNING, true);
        if (ErrorHelper.sensorAccessDenied429(err)) {
            if (err && err.data && err.data.body?.length === 0 && retries < 3) {
                throw ('PROXY BLOCKED EMPTY!');
            }
            // console.log('KASADA API FP BLOCKED! REGENNING!', Status.WARNING, true);
            if (err && err.data && err.data.body) {
                task.apiFpBody = err.data.body;
                const extractedIPS = firstBetween(err.data.body, '<script src="', '"></script>');
                if (extractedIPS && extractedIPS !== -1) {
                    task.apiIpsJSUrl = ('https://api.nike.com' + extractedIPS.split('amp;').join(''));
                }
            }
            return Promise.resolve();
        }
        throw ('PROXY BLOCKED!');
    });
}


async function getIpsJSApi(task, retries = 0) {
    task.headers = {
        'sec-ch-ua': task.secchua,
        'sec-ch-ua-mobile': '?0',
        'user-agent': task.user_agent,
        'sec-ch-ua-platform': '"Windows"',
        "accept": "*/*",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "no-cors",
        "sec-fetch-dest": "script",
        "referer": 'https://api.nike.com/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/fp?x-kpsdk-v=j-0.0.0',
        "accept-encoding": "gzip, deflate, br, zstd",
        'accept-language': task.acceptLanguage
    };
    return CustomElectronRequestC.get(task.apiIpsJSUrl, {
        task: task,
        headers: task.headers,
        resolveOnlyBody: false,
        timeout: 35000,
        retries: 0
    }).then(async (r) => {
        if (r && r.body && r.statusCode === 200 && r.body.length > 500) {
            return Promise.resolve(r.body);
        }

        if (r && r.statusCode === 200 && (!r.body || r.body.length === 0)) {
            throw '200 empty body';
        }
        return Promise.reject(new ErrorHelper('FAILED TO FETCH IPSJS!', r, ErrorCode.REQUIRES_LOGIN));
    }).catch(async (err) => {
        retries++;
        console.log('here err broke right now let me knw ipsjsapi', err);
        // task.setProxyWalk();
        if (retries > 2) {
            if (ErrorHelper.sensorAccessDenied403(err)) {
                throw 'PROXY BLOCKED!';
            }
            return Promise.resolve();
        }
        await CustomElectronRequestC.sleep(CustomElectronRequestC.random(1000, 2500));
        return getIpsJSApi(task, retries);
    });
}

async function jeviGetPostTlDataBeta(task, challenge = '', domain = 'api.nike.com') {
    if (!challenge || challenge.length < 250) {
        return Promise.resolve();
    }
    // let bmsc = task.kpsdkctAPI;
    let body = {
        "mode": 0,
        "kasadaRequest": {
            "site": domain,
            "ips": challenge,
            "userAgent": task.user_agent,
            "language": 'en-US',
            "bmsz": task.apiIpsJSUrl.split('?')[1].split('=')[1].split('&')[0]
        }
    }
    return CustomElectronRequestC.post('https://new.jevi.dev/Solver/solve', {
        task: task,
        headers: {
            "user-agent": task.user_agent,
            "accept": "*/*",
            'accept-language': task.acceptLanguage,
            'content-type': 'application/json; charset=UTF-8',
            'X-TSB-Version': 'TSB-Monitor',
            'x-key': 'TSB-dtrhfth4576-gffdsgh-4817-geragerag-greag',
            'user': 'TSB'
        },
        body: body,
        resolveOnlyBody: false,
        timeout: 35000,
    }).then(async (r) => {
        try {
            if (r && r.statusCode === 200) {
                task.deviceid = r.body.deviceid;
                if (r && r.body && r.body.dtHeader) {
                    task.kpsdkdtApi = r.body.dtHeader;
                }
                if (r && r.body && r.body.imHeader) {
                    task.kpsdkheadervalueApi = r.body.imHeader;
                }
                if (r && r.body && r.body.ctHeader) {
                    const kpsdkct = r.body.ctHeader;
                    task.kpsdkctAPI = kpsdkct;
                }
                if (r && r.body && r.body.id) {
                    const id = r.body.id;
                    task.lastSolveIdAPI = id;
                }
                if (r && r.body && r.body.payload) {
                    return Promise.resolve(r.body.payload);
                }
            }
        } catch (e) {
            console.log('exception caught kasada post tl', e)
        }
        return Promise.reject(new ErrorHelper('API CT GEN AnonDev FAILED!', r, ErrorCode.GENERAL));
    }).catch(async (err) => {
        console.log('here got err broke', err)
        if (err && err.data && err.data.body && typeof err.data.body === 'string' && err.data.body.toLowerCase().includes('keyexpired')) {
            throw ('KEY EXPIRED! CONTACT DEV...');
        }
        if (err && err.data && err.data.body && typeof err.data.body === 'string' && err.data.body.includes('Empty IPS')) {
            throw ('IPS EMPTY');
        }
        if (err && err.data && err.data.body && typeof err.data.body === 'string' && err.data.body.includes('SafelyDisable')) {
            throw ('SafelyDisable');
        }
        if (err && err.data && err.data.body && typeof err.data.body === 'string' && err.data.body.includes('VerySafelyDisable')) {
            throw ('VerySafelyDisable');
        }
        if (err && err.data && err.data.body && typeof err.data.body === 'string' && err.data.body.includes('Error#')) {
            throw ('EDGE: ' + err.data.body);
        }
        if (err && err.data && err.data.statusCode === 401) {
            throw ('EDGE: 401 unauthorized');
        }
        if (err && err.data && err.data.body) {
            if (err.data.body === 'API is not ready yet. Please try again') {
                throw ('API is not ready yet. Please try again');
            } else if (err.data.body.payload) {
                throw (err.data.body.payload);
            } else {
                throw (JSON.stringify(err.data.body));
            }
        } else {
            throw (JSON.stringify(err.data.statusCode));
        }
    });
}

async function postTlDataApi(task, ipsData = '') {
    task.headers = {
        'sec-ch-ua': task.secchua,
        'x-kpsdk-im': task.kpsdkheadervalueApi,
        'x-kpsdk-ct': task.kpsdkctAPI,
        'sec-ch-ua-mobile': '?0',
        'user-agent': task.user_agent,
        "content-type": "application/octet-stream",
        "x-kpsdk-dt": task.kpsdkdtApi,
        "x-kpsdk-v": 'j-0.0.0',
        'sec-ch-ua-platform': '"Windows"',
        "accept": "*/*",
        "origin": "https://api.nike.com",
        // "sec-fetch-site": "same-origin",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        "referer": "https://api.nike.com/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/fp?x-kpsdk-v=j-0.0.0",
        "accept-encoding": "gzip, deflate, br, zstd",
        'accept-language': task.acceptLanguage
    };
    return CustomElectronRequestC.post('https://api.nike.com/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/tl', {
        task: task,
        headers: task.headers,
        resolveOnlyBody: false,
        json: true,
        // proxy: 'http://127.0.0.1:8888',
        // proxy: 'localhost',
        // body: ipsData
        rawBody: ipsData,
        retries: 0,
        uintArray: true
    }).then(async (r) => {
        if (r && r.body) {
            if (r.body.reload || r.body.includes('reload":true')) {
                if (r.headers && r.headers['x-kpsdk-ct']) {
                    const kpsdkct = r.headers['x-kpsdk-ct'];
                    task.kpsdkctAPI = kpsdkct;
                    if (r.headers && r.headers['x-kpsdk-cd']) {
                        task.kpsdkcd = r.headers['x-kpsdk-cd']
                    }
                    if (r.headers && r.headers['x-kpsdk-st']) {
                        task.kpsdkst = r.headers['x-kpsdk-st']
                    }
                    if (r.headers && r.headers['x-kpsdk-cr']) {
                        task.kpsdkcr = r.headers['x-kpsdk-cr']
                    }
                    task.apiIpsJSUrl = '';
                    return Promise.resolve();
                }
            } else {
                throw 'FAILED TO EGN CT TOKEN NO RELOAD TRUE';
            }
        }
        return Promise.reject(new ErrorHelper('FAILED TO SOLVE CT API TL!', r, ErrorCode.REQUIRES_LOGIN));
    }).catch(async (err) => {
        throw 'FAILED TO EGN CT TOKEN NO RELOAD TRUE EXCEPTION';
    });
}

function firstBetween(html = '', start = '', end = '') {
    if (!isString(html)) {
        return -1;
    }
    const firstIndex = html.indexOf(start);
    if (firstIndex === -1) {
        return -1;
    }
    const sub1 = html.substring(firstIndex + start.length, html.length);
    const sub2 = sub1.substring(0, sub1.indexOf(end));
    return sub2;
}

function isString(x) {
    return Object.prototype.toString.call(x) === '[object String]';
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function runTests() {
    await launchBinary(goclient_args, goclientCallback);
    await CustomElectronRequestC.sleep(5000);
    let now = (new Date()).toLocaleString();
    console.log(`-> ${now} - running tests`);
    const task = new Task();
    try {
        testJeviApi(task);
    } catch (e) {
        console.log('exception caught here', e);
        clearInterval(task.interv)
        sendWebhook(task.lastSolveIdAPI, task.deviceid, task.uid, false, task.validfor, e)
        // handle all errors when invalid - send to slack
    }
}

function sendWebhook(lastSolvedIdApi, deviceid, uid, isvalid, validfor, msg = '') {
    let link = 'https://hooks.slack.com/services/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';
    let object = toSlackObject(lastSolvedIdApi, deviceid, uid, isvalid, validfor, msg);
    return new Promise((resolve, reject) => {
        request.post(link, object, (err, res, body) => {
            console.log('here got error webhook', res)
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

function toSlackObject(lastSolvedIdApi, deviceid, uid, isvalid, validfor, msg) {
    function msToMinutes(milliseconds) {
        // Convert milliseconds to minutes by dividing by the number of milliseconds in a minute
        return milliseconds / (1000 * 60);
    }

    let text = `:white_check_mark: ${uid}: IS VALID: ${msToMinutes(validfor)} minutes; deviceid: ${deviceid}; lastSolvedIdAPI: ${lastSolvedIdApi}`
    if (!isvalid) {
        text = `:x: ${uid}: NOT VALID - stayed valid for ${msToMinutes(validfor)} minutes; MSG: ${msg}; deviceid: ${deviceid}; lastSolvedIdAPI: ${lastSolvedIdApi}`;
    }

    return {
        body: JSON.stringify({
            'username': 'TSB',
            'icon_emoji': ':robot_face:',
            'text': text
        }),
    };
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


runTests();

setInterval(runTests, 4 * 60 * 60 * 1000); // rerun and retry tests every 4 hours

