const CustomElectronRequestC = require('./CustomElectronRequestC')
const http = require('http');
const agents = Array.from({length: 10}, newAgent);

function newAgent() {
    return new http.Agent({
        keepAlive: true,
        keepAliveMsecs: 60 * 1000,
        maxSockets: 100 * 1000,
        maxFreeSockets: 100 * 1000,
        timeout: 60 * 1000,
    });
}

class MyClient {

    constructor() {
    }

    async request(subject, payload, options) {
        return this.request2(subject, payload, options);
    }

    async request2(subject, payload, options) {
        let isping = false;
        if (subject === 'ping') {
            isping = true;
        }
        if (!isping) {
            // console.log(">", subject, payload);
        }
        const postData = JSON.stringify(payload);
        return new Promise((resolve, reject) => {
            const req = http.request({
                hostname: '127.0.0.1',
                agent: CustomGrpcRequestC.randomFromArray(agents),
                port: CustomGrpcRequestC.randomFromArray([7584, 7585, 7586, 7587, 7588, 7589, 7590]),
                path: '/' + subject,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            }, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    const responseD = JSON.parse(data);
                    if (!isping) {
                        console.log("<", responseD)
                    }
                    if (responseD.hasOwnProperty("error")) {
                        reject(responseD["error"]);
                    }
                    if (responseD.hasOwnProperty("body")) {
                        responseD['body'] = Buffer.from(responseD['body'], 'base64').toString();
                    }
                    resolve(responseD);
                });
            });

            req.setTimeout(options.timeout, () => {
                req.abort();
                reject(`[${subject}] timeout`);
            })

            req.on('error', (error) => {
                reject(error);
            });

            req.write(postData);
            req.end();
        })
    }

    async init() {
        return;
    }

    Close() {
    }

    async Init(o) {
        try {
            const payload = {
                proxy: o.proxy,
                partition: o.partition,
                defaultUserAgent: o.defaultUserAgent || '',
                profile: o.profile || '',
            };
            console.log('here init client right now', payload);
            let x = await this.request('initClient', payload, {timeout: 5000});
            return x;
        } catch (e) {
            console.log('exception caught init client', e)
            // @ts-ignore
            if (e && e.message && (e.message.includes('TIMEOUT') || e.message.includes('503'))) {
                console.log('<>>> true timedout', e);
                await CustomGrpcRequestC.resetClient(o.partition);
                await CustomElectronRequestC.sleep(250);
                return this.Init(o);
            }
            if (e && typeof e === 'string' && e.includes('timeout')) {
                await CustomGrpcRequestC.resetClient(o.partition);
                console.log('<>>> true timedout', e);
                await CustomElectronRequestC.sleep(250);
                return this.Init(o);
            }
            return Promise.reject(e);
        }
    }

    async Send(o) {
        try {
            const payload = o;
            payload.timeout = payload.timeout || 45000;
            payload.useSessionCookies = payload.useSessionCookies !== undefined ? o.useSessionCookies : true;
            let x = await this.request('send', payload, {timeout: 45000});
            return x;
        } catch (e) {
            // @ts-ignore
            if (e && e.message && (e.message.includes('TIMEOUT') || e.message.includes('503'))) {
                console.log('<>>> true timedout', e);
                await CustomGrpcRequestC.resetClient(o.partition);
                await CustomElectronRequestC.sleep(250);
                return this.Send(o);
            }
            if (e && typeof e === 'string' && e.includes('timeout')) {
                console.log('<>>> true timedout', e);
                await CustomGrpcRequestC.resetClient(o.partition);
                await CustomElectronRequestC.sleep(250);
                return this.Send(o);
            }
            return Promise.reject(e)
        }
    }

    async SetCookie(o) {
        try {
            const payload = {
                partition: o.partition,
                cookie: {
                    name: o.cookie.name,
                    value: o.cookie.value,
                    url: o.cookie.url,
                    domain: o.cookie.domain,
                    expirationDate: o.cookie.expirationDate,
                },
            };

            let x = await this.request('setCookie', payload, {timeout: 5000});
            return x
        } catch (e) {
            // @ts-ignore
            if (e && e.message && (e.message.includes('TIMEOUT') || e.message.includes('503'))) {
                console.log('<>>> true timedout', e);
                await CustomGrpcRequestC.resetClient(o.partition);
                await CustomElectronRequestC.sleep(250);
                return this.SetCookie(o);
            }
            if (e && typeof e === 'string' && e.includes('timeout')) {
                console.log('<>>> true timedout', e);
                await CustomGrpcRequestC.resetClient(o.partition);
                await CustomElectronRequestC.sleep(250);
                return this.SetCookie(o);
            }
            return Promise.reject(e);
        }
    }

    async SetCookies(o) {
        try {
            const payload = {
                partition: o.partition,
                cookies: o.cookies,
            };

            let x = this.request('setCookies', payload, {timeout: 5000});
            return x;
        } catch (e) {
            // @ts-ignore
            if (e && e.message && (e.message.includes('TIMEOUT') || e.message.includes('503'))) {
                console.log('<>>> true timedout', e);
                await CustomGrpcRequestC.resetClient(o.partition);
                await CustomElectronRequestC.sleep(250);
                return this.SetCookies(o);
            }
            if (e && typeof e === 'string' && e.includes('timeout')) {
                console.log('<>>> true timedout', e);
                await CustomGrpcRequestC.resetClient(o.partition);
                await CustomElectronRequestC.sleep(250);
                return this.SetCookies(o);
            }
            return Promise.reject(e)
        }
    }

    async GetCookies(o) {
        try {
            console.log('getCookies>', o);
            const payload = {
                partition: o.partition,
            };
            const cookies = await this.request('getCookies', payload, {timeout: 5000});
            if (!cookies['cookies']) {
                cookies['cookies'] = [];
            }
            return cookies;
        } catch (e) {
            console.log('get cookies broke here', e);
            console.log('get cookies broke here', e.message);
            // @ts-ignore
            if (e && e.message && (e.message.includes('TIMEOUT') || e.message.includes('503'))) {
                console.log('<>>> true timedout', e);
                await CustomGrpcRequestC.resetClient(o.partition);
                await CustomElectronRequestC.sleep(250);
                return this.GetCookies(o);
            }
            if (e && typeof e === 'string' && e.includes('timeout')) {
                console.log('<>>> true timedout', e);
                await CustomGrpcRequestC.resetClient(o.partition);
                await CustomElectronRequestC.sleep(250);
                return this.GetCookies(o);
            }
            return Promise.reject(e);
        }
    }

    async GetCookie(o) {
        try {
            const payload = {
                partition: o.partition,
                name: o.name,
            };

            const response = await this.request('getCookie', payload, {
                timeout: 5000,
            });

            // @ts-ignore
            return response.value;
        } catch (e) {
            // @ts-ignore
            if (e && e.message && (e.message.includes('TIMEOUT') || e.message.includes('503'))) {
                console.log('<>>> true timedout', e);
                await CustomGrpcRequestC.resetClient(o.partition);
                await CustomElectronRequestC.sleep(250);
                return this.GetCookie(o);
            }
            if (e && typeof e === 'string' && e.includes('timeout')) {
                console.log('<>>> true timedout', e);
                await CustomGrpcRequestC.resetClient(o.partition);
                await CustomElectronRequestC.sleep(250);
                return this.GetCookie(o);
            }
            return Promise.reject(e)
        }
    }

    async RemoveCookie(o) {
        try {
            const payload = {
                partition: o.partition,
                name: o.name,
                url: o.url,
            };
            let x = await this.request('removeCookie', payload, {timeout: 5000});
            return x;
        } catch (e) {
            // @ts-ignore
            if (e && e.message && (e.message.includes('TIMEOUT') || e.message.includes('503'))) {
                console.log('<>>> true timedout', e);
                await CustomGrpcRequestC.resetClient(o.partition);
                await CustomElectronRequestC.sleep(250);
                return this.RemoveCookie(o);
            }
            if (e && typeof e === 'string' && e.includes('timeout')) {
                console.log('<>>> true timedout', e);
                await CustomGrpcRequestC.resetClient(o.partition);
                await CustomElectronRequestC.sleep(250);
                return this.RemoveCookie(o);
            }
            return Promise.reject(e)
        }
    }

    async ResetPartition(o) {
        try {
            const payload = {
                partition: o.partition,
            };

            let x = await this.request('resetPartition', payload, {timeout: 5000});
            return x;
        } catch (e) {
            // @ts-ignore
            if (e && e.message && (e.message.includes('TIMEOUT') || e.message.includes('503'))) {
                console.log('<>>> true timedout', e);
                await CustomGrpcRequestC.resetClient(o.partition);
                await CustomElectronRequestC.sleep(250);
                return this.ResetPartition(o);
            }
            if (e && typeof e === 'string' && e.includes('timeout')) {
                console.log('<>>> true timedout', e);
                await CustomGrpcRequestC.resetClient(o.partition);
                await CustomElectronRequestC.sleep(250);
                return this.ResetPartition(o);
            }
            return Promise.reject(e)
        }
    }

    async Ping() {
        try {
            return await this.request('ping', {}, {timeout: 1000});
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async ResetClient(o) {
        try {
            const payload = {
                partition: o.partition,
            };

            let x = await this.request('resetClient', payload, {timeout: 5000});
            return x;
        } catch (e) {
            // @ts-ignore
            if (e && e.message && (e.message.includes('TIMEOUT') || e.message.includes('503'))) {
                console.log('<>>> true timedout', e);
                await CustomGrpcRequestC.resetClient(o.partition);
                await CustomElectronRequestC.sleep(250);
                return this.ResetClient(o);
            }
            if (e && typeof e === 'string' && e.includes('timeout')) {
                console.log('<>>> true timedout', e);
                await CustomGrpcRequestC.resetClient(o.partition);
                await CustomElectronRequestC.sleep(250);
                return this.ResetClient(o);
            }
            return Promise.reject(e)
        }
    }
}

const _client = new MyClient();

_client.init();

class CustomGrpcRequestC {
    static async actualSend(requestConfig) {
        let origin;
        if (requestConfig.headers && requestConfig.headers['origin']) {
            origin = requestConfig.headers['origin'];
        }

        if (requestConfig.body) {
            // if object stringify it
            if (typeof requestConfig.body == 'object') {
                requestConfig.body = JSON.stringify(requestConfig.body);
            }
        }

        const send_opts = {
            method: requestConfig.method,
            url: requestConfig.url,
            useSessionCookies: !requestConfig.dontUseCookies,
            headers: requestConfig.headers,
            order: requestConfig.order,
            partition: requestConfig.partition,
            proxy: requestConfig.proxy,
            body: requestConfig.body,
            rawBody: requestConfig.rawBody,
            form: requestConfig.form,
            timeout: requestConfig.timeout,
            skipRedirections: requestConfig.skipRedirections,
            parts: requestConfig.parts,
            ignoreBody: requestConfig.ignoreBody,
            brotli: !!requestConfig.brotli,
            skipCookies: requestConfig.skipCookies,
        };

        return new Promise((resolve, reject) => {
            _client
                .Send(send_opts)
                .then((response) => {
                    let headers = response.headers || {};
                    let keys = Object.keys(headers);
                    for (let key of keys) {
                        let values = headers[key];
                        headers[key] = values.length > 1 ? values : values[0];
                        if (key === 'location' || key == 'set-cookie') {
                            headers[key] = values;
                        }
                    }

                    let body = response.body;
                    if (requestConfig.json) {
                        try {
                            body = JSON.parse(response.body);
                        } catch (e) {
                        }
                    }

                    let resp = {
                        statusCode: response.status_code || response.statusCode,
                        headers: headers,
                        redirectedUrl: response.redirected_url || response.redirectedUrl,
                        body: body,
                        parts: response.parts,
                    };
                    if (!resp.statusCode) {
                        resp = null;
                    }
                    return resolve(resp);
                })
                .catch(async (err) => {
                    console.log('Error calling send:', err);
                    if (err && typeof err === 'string' && err.includes('unexpected EOF')) {
                        console.log('>>>>>>>>>>>>>>>>>>>> RESETTING CLIENT!')
                        await CustomGrpcRequestC.resetClient(requestConfig.partition);
                        await CustomElectronRequestC.sleep(250);
                    }
                    return reject(err);
                });
        });
    }

    static async setCookie(partition, key, value, url) {
        let cookie = {
            url: url,
            name: key,
            value: value,
            expirationDate: Date.now() / 1000 + 864000 + 864000, // 20 days expiration date // @todo check if expiration date exists - respect do not change
        };
        if (url === 'https://www.nike.com') {
            cookie['domain'] = '.nike.com';
        }
        if (url === 'https://unite.nike.com') {
            cookie['domain'] = 'unite.nike.com';
        }
        if (url === 'https://api.nike.com') {
            cookie['domain'] = 'api.nike.com';
        }
        if (url === 'https://accounts.nike.com') {
            cookie['domain'] = 'accounts.nike.com';
        }
        if (key === 'unite_session') {
            cookie['path'] = '/auth/unite_session_cookies/v1';
        } else if (key === 'unite_session_timestamp') {
            cookie['path'] = '/session.html';
        } else {
            cookie['path'] = '/';
        }
        return new Promise((resolve, reject) => {
            _client
                .SetCookie({
                    partition: partition,
                    // @ts-ignore
                    cookie,
                })
                .then((response) => {
                    return resolve(true);
                })
                .catch((err) => {
                    return reject(err);
                });
        });
    }

    static async setCookies(partition, cookiesRaw) {
        console.log("setCookies", partition, cookiesRaw);
        let cookies = cookiesRaw;
        try {
            cookies = JSON.parse(cookiesRaw);
        } catch (e) {
        }
        console.log('here setting cookies', cookies)
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i]) {
                if (cookies[i].sourceScheme) {
                    cookies[i].secure = cookies[i].sourceScheme === 'Secure';
                }
                const url = CustomGrpcRequestC.getCookieUrlFromDomain(cookies[i].secure, cookies[i].domain);
                if (cookies[i].expires && cookies[i].expires !== -1) {
                    cookies[i].expirationDate = cookies[i].expires;
                } else {
                    cookies[i].expirationDate = Date.now() / 1000 + 864000 + 864000;
                }
                if (cookies[i].sameSite === 'None') {
                    delete cookies[i].sameSite;
                }
                if (cookies[i].sameSite) {
                    cookies[i].sameSite = cookies[i].sameSite.toLowerCase();
                }
                cookies[i].url = url;
                delete cookies[i].expires;
                if (cookies[i].session) {
                    cookies[i].expirationDate = 0;
                }
                if (cookies[i].domain && cookies[i].domain.startsWith('.') && cookies[i].domain.split('.').length > 3) {
                    cookies[i].domain = cookies[i].domain.substring(1);
                }
            }
        }
        return new Promise((resolve, reject) => {
            _client
                .SetCookies({
                    partition: partition,
                    cookies,
                })
                .then((response) => {
                    return resolve(true);
                })
                .catch((err) => {
                    return reject(err);
                });
        });
    }

    static getCookieUrlFromDomain(secure, domain) {
        let hostParts = domain.split('.');
        const scheme = secure ? 'https' : 'http';
        let url = '';
        if (hostParts[0] === '') {
            hostParts = hostParts.slice(1);
        }
        if (hostParts.length === 2) {
            if (hostParts[0] === 'www') {
                url = `${scheme}://${hostParts.join('.')}`;
            } else {
                url = `${scheme}://www.${hostParts.join('.')}`;
            }
        } else {
            url = `${scheme}://${hostParts.join('.')}`;
        }

        return url;
    }

    static async removeCookie(partition, key, url) {
        return new Promise((resolve, reject) => {
            _client
                .RemoveCookie({
                    partition: partition,
                    url,
                    name: key,
                })
                .then((response) => {
                    return resolve(true);
                })
                .catch((err) => {
                    return reject(err);
                });
        });
    }

    static async resetPartition(partition) {
        return new Promise((resolve, reject) => {
            _client
                .ResetPartition({
                    partition: partition,
                })
                .then((response) => {
                    return resolve(true);
                })
                .catch((err) => {
                    return reject(err);
                });
        });
    }

    static async getCookies(partition, filter, loc = '') {
        return new Promise((resolve, reject) => {
            _client
                .GetCookies({
                    partition: partition,
                    loc: loc,
                })
                .then((response) => {
                    return resolve(response.cookies);
                })
                .catch((err) => {
                    return reject(err);
                });
        });
    }

    static async getCookie(partition, name) {
        return new Promise((resolve, reject) => {
            _client
                .GetCookie({
                    partition: partition,
                    name: name,
                })
                .then((response) => {
                    // console.log('[getCookie] here got response', response);
                    return resolve(response);
                })
                .catch((err) => {
                    console.log('[getCookie] here err broke', err);
                    return reject(err);
                });
        })
    }

    static async init(partition, proxy, defaultUserAgent = '', profile = '') {
        return new Promise((resolve, reject) => {
            _client
                .Init({
                    partition: partition,
                    proxy: proxy,
                    defaultUserAgent: defaultUserAgent,
                    profile: profile
                })
                .then((response) => {
                    return resolve(true);
                })
                .catch((err) => {
                    return reject(err);
                });
        });
    }

    static async ping() {
        return new Promise((resolve, reject) => {
            _client
                .Ping()
                .then((response) => {
                    return resolve(response);
                })
                .catch((err) => {
                    return reject(err);
                })
        })
    }

    static async resetClient(partition) {
        return new Promise((resolve, reject) => {
            _client
                .ResetClient({
                    partition
                })
                .then((response) => {
                    return resolve(response);
                })
                .catch((err) => {
                    return reject(err);
                })
        })
    }

    static randomFromArray(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}

module.exports = CustomGrpcRequestC;
