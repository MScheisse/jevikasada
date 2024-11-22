const CustomElectronRequestC = require('./CustomElectronRequestC');
const ErrorHelper = require('./ErrorHelper');
const v4 = require('uuid').v4;
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const retryInterval = 10 * 60 * 1000 // 10 minutes
const cdgen_generator = require('./cdgen_generator')

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


async function testJeviAccounts(task) {
    console.log('testing jevi Accounts here');
    try {
        await generateFPAccounts(task);
        await solveAccounts(task);
        console.log('done generating jevi Accounts fp');
    } catch (e) {
        console.log('exception caught here', e);
        clearInterval(task.interv)
        // handle all errors when invalid - send to slack
    }
}

async function solveAccounts(task) {
    if (task.accountsIpsJSUrl) {
        const ipsjsbody = await getIpsJSAccounts(task);
        let postTl = await jeviGetPostTlDataBeta(task, CustomElectronRequestC.btoa(ipsjsbody), 'accounts.nike.com');
        await postTlDataAccounts(task, postTl)
    }
    return Promise.resolve();
}

async function generateFPAccounts(task, retries = 0, isGS = false) {

    task.headers = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "sec-fetch-site": "same-origin",
        "cookie": "",
        "sec-fetch-dest": "iframe",
        'accept-language': task.acceptLanguage,
        "sec-fetch-mode": "navigate",
        'user-agent': task.user_agent,
        'referer': 'https://api.nike.com/idn/shim/oauth/2.0/token',
        "accept-encoding": "gzip, deflate, br"
    };

    return CustomElectronRequestC.get('https://accounts.nike.com/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/fp?x-kpsdk-v=j-0.0.0', {
        task: task,
        headers: task.headers,
        resolveOnlyBody: false,
        retries: 0,
        timeout: 45000
    }).then(async (r) => {
        console.log('here r did resolve', r);
        if (r && r.statusCode === 200 && (!r.body || r.body.length === 0)) {
            throw ('KASADA ACCOUNTS BLOCKED! PROCEED CAUTIOUSLY!', Status.DANGER);
        }
        if (r && r.body) {
            const extractedIPS = firstBetween(r.body, '<script src="', '"></script>');
            if (extractedIPS && extractedIPS !== -1) {
                task.accountsIpsJSUrl = ('https://accounts.nike.com' + firstBetween(r.body, '<script src="', '"></script>')).split('amp;').join('');
            }
            if (r && r.statusCode === 200) {
                console.log('here still valid!');
                task.validfor = task.validfor + retryInterval;
                task.accountsIpsJSUrl = '';
                return Promise.resolve(r.statusCode.toString());
            }
        }
        return Promise.reject(new ErrorHelper('KASADA FAILURE!', r, ErrorCode.GENERAL));
    }).catch(async (err) => {
        console.log('here err exception caught', err);
        retries++;
        if (ErrorHelper.sensorAccessDenied429(err)) {
            if (err && err.data && err.data.body?.length === 0 && retries < 3) {
                throw ('PROXY BLOCKED EMPTY!');
            }
            if (err && err.data && err.data.body) {
                task.accountsFpBody = err.data.body;
                const extractedIPS = firstBetween(err.data.body, '<script src="', '"></script>');
                if (extractedIPS && extractedIPS !== -1) {
                    task.accountsIpsJSUrl = ('https://accounts.nike.com' + extractedIPS.split('amp;').join(''));
                }
            }
            return Promise.resolve();
        }
        throw ('PROXY BLOCKED!');
    });
}


async function getIpsJSAccounts(task, retries = 0) {
    task.headers = {
        'accept': '*/*',
        'sec-fetch-site': 'same-origin',
        'cookie': '',
        'sec-fetch-dest': 'script',
        'accept-language': task.acceptLanguage,
        'sec-fetch-mode': 'no-cors',
        'user-agent': task.user_agent,
        'referer': 'https://accounts.nike.com/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/fp?x-kpsdk-v=j-0.0.0'
    }
    return CustomElectronRequestC.get(task.accountsIpsJSUrl, {
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
        console.log('here err broke right now let me knw ipsjsaccounts', err);
        // task.setProxyWalk();
        if (retries > 2) {
            if (ErrorHelper.sensorAccessDenied403(err)) {
                throw 'PROXY BLOCKED!';
            }
            return Promise.resolve();
        }
        await CustomElectronRequestC.sleep(CustomElectronRequestC.random(1000, 2500));
        return getIpsJSAccounts(task, retries);
    });
}

async function jeviGetPostTlDataBeta(task, challenge = '', domain = 'accounts.nike.com') {
    if (!challenge || challenge.length < 250) {
        return Promise.resolve();
    }
    let body = {
        "mode": 0,
        "kasadaRequest": {
            "site": domain,
            "ips": challenge,
            "userAgent": task.user_agent,
            "language": 'en-US',
            "bmsz": task.accountsIpsJSUrl.split('?')[1].split('=')[1].split('&')[0]
        }
    }
    return CustomElectronRequestC.post('https://new.jevi.dev/Solver/solve', {
        // return CustomElectronRequestC.post('http://81.104.34.49:5215/Solver/solve', {
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
        console.log('got r', r);
        try {
            if (r && r.statusCode === 200) {
                task.deviceid = r.body.deviceid;
                if (r && r.body && r.body.dtHeader) {
                    task.kpsdkdtAccounts = r.body.dtHeader;
                }
                if (r && r.body && r.body.imHeader) {
                    task.kpsdkheadervalueAccounts = r.body.imHeader;
                }
                if (r && r.body && r.body.ctHeader) {
                    const kpsdkct = r.body.ctHeader;
                    task.kpsdkctAccounts = kpsdkct;
                }
                if (r && r.body && r.body.id) {
                    const id = r.body.id;
                    task.lastSolveIdAccounts = id;
                }
                if (r && r.body && r.body.payload) {
                    return Promise.resolve(r.body.payload);
                }
            }
        } catch (e) {
            console.log('exception caught kasada post tl', e)
        }
        return Promise.reject(new ErrorHelper('Accounts CT GEN AnonDev FAILED!', r, ErrorCode.GENERAL));
    }).catch(async (err) => {
        console.log('here got err broke', err)
        if (typeof err === 'string' && err?.includes('Request timed out')) {
            await CustomElectronRequestC.sleep(2500);
            return jeviGetPostTlDataBeta(task, challenge, domain)
        }
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

async function postTlDataAccounts(task, ipsData = '') {
    task.headers = {
        "content-type": "application/octet-stream",
        ['x-kpsdk-ct']: task.kpsdkctAccounts,
        'cookie': '',
        "accept": "*/*",
        "sec-fetch-site": "same-origin",
        "x-kpsdk-dt": task.kpsdkdtAccounts,
        'accept-language': task.acceptLanguage,
        "accept-encoding": "gzip, deflate, br",
        "sec-fetch-mode": "cors",
        "x-kpsdk-v": 'j-0.0.0',
        "origin": 'https://accounts.nike.com',
        'user-agent': task.user_agent,
        "referer": 'https://accounts.nike.com/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/fp?x-kpsdk-v=j-0.0.0',
        'x-kpsdk-im': task.kpsdkheadervalueAccounts,
        'content-length': '',
        "sec-fetch-dest": "empty",
    };
    return CustomElectronRequestC.post('https://accounts.nike.com/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/tl', {
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
                    task.kpsdkctAccounts = kpsdkct;
                    if (r.headers && r.headers['x-kpsdk-cd']) {
                        task.kpsdkcd = r.headers['x-kpsdk-cd']
                    }
                    if (r.headers && r.headers['x-kpsdk-st']) {
                        // task.kpsdkst = r.headers['x-kpsdk-st']
                    }
                    if (r.headers && r.headers['x-kpsdk-cr']) {
                        task.kpsdkcr = r.headers['x-kpsdk-cr']
                    }
                    task.accountsIpsJSUrl = '';
                    return Promise.resolve();
                }
            } else {
                throw 'FAILED TO EGN CT TOKEN NO RELOAD TRUE';
            }
        }
        return Promise.reject(new ErrorHelper('FAILED TO SOLVE CT ACCOUNTS TL!', r, ErrorCode.REQUIRES_LOGIN));
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
    let now = (new Date()).toLocaleString();
    console.log(`-> ${now} - running tests`);
    const task = new Task();
    try {

        await launchBinary(goclient_args, goclientCallback);
        console.log('done launch binary');
        await testJeviAccounts(task);
        console.log('doing atc pre order');
        await generateFPAccounts(task);
        await CustomElectronRequestC.sleep(10000) // remove sleep and u will get 200 - with sleep 403
        await generateFPAccounts(task);
        await CustomElectronRequestC.sleep(10000) // remove sleep and u will get 200 - with sleep 403
        await generateFPAccounts(task);
    } catch (e) {
        console.log('err here ', e);
    }
}

class Task {
    kpsdkcd = '';
    kpsdkst = '';
    kpsdkctAccounts = '';
    uid = '';
    datasetPartitionForTask = 'datasetPartitioning';
    acceptLanguage = 'en-US,en;q=0.9'
    user_agent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
    secchua = '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"';
    interv = ''
    validfor = 0;
    lastExecutionTime = Date.now();
    visitId = 1;
    visitorId = '';
    accountsIpsJSUrl = '';

    constructor() {
        console.log('here logging v4', v4);
        this.uid = v4();
        console.log('got uid ', this.uid);
        // initialize new uid v4()
    }

    async generateCDHeaders(task) {
        try {
            console.log('here got cdgen', cdgen_generator);
            let body = await cdgen_generator.generateCd()
            if (body && body.workTime) {
                // if (task.kpsdkst) {
                //     body.st = task.kpsdkst;
                // }
                task.kpsdkcd = JSON.stringify(body);
                return Promise.resolve()
            }
        } catch (err) {
            console.log('here got err', err);
        }
        return this.generateCDHeaders(task)
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


