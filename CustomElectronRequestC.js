const CustomGrpcRequestC = require('./CustomGrpcRequestC');
const ErrorHelper = require('./ErrorHelper');
const useGrpc = true;

class CustomElectronRequestC {
    static counter = 1;

    static get(url, options) {
        return this.send('GET', url, options);
    }

    static post(url, options) {
        return this.send('POST', url, options);
    }

    static patch(url, options) {
        return this.send('PATCH', url, options);
    }

    static put(url, options) {
        return this.send('PUT', url, options);
    }

    static delete(url, options) {
        return this.send('DELETE', url, options);
    }

    static async send(method, url, options) {
        const defOptions = {
            resolveOnlyBody: true
        };
        const _options = Object.assign({}, defOptions, options);
        CustomElectronRequestC.counter++;
        let part = this.getPartitionPersist(_options.task);
        // let proxy = '';
        // let proxy = CustomGrpcRequestC.randomFromArray([
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_hkf8ncgc2c:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_cPLiKErri3:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_QaGB0iw7vp:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_H6aCdLxBGd:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_RIy7dLtOXd:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_DOrwCvzKJm:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_dBb9CgQfze:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_p71Ba5ikc5:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_ol305uqTDr:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_SoUAFPKs9h:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_H0eVSzAXZ9:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_inz5lhKha4:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_Fn3Y5ZEO5Y:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_6qBdv03ve1:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_wVLsm5LsDh:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_xJYgSVGOpu:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_AS1a2wfhiz:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_ez6DLU7mKn:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_QD8nANvcXK:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_P68Mpzkmqr:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_HL385ETxhb:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_AdTtzCrQ3Z:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_5Q91SACkxB:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_MBetu5D79N:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_tQVbhK0oEy:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_zJD6cOAoZf:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_uW9mwRSrlt:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_IJWChSiHaJ:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_CqRprKhJ1w:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_M4cpuqEehO:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_rfn0EJQP9b:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_cLtHuqMucz:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_oSelAVcPHP:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_N3AzTS0xNJ:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_TYiP46yamo:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_kMw74IprEL:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_fPZvlESeY6:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_o4YBp0rwsm:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_ovYrOVzrzk:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_4RAS6SLfLh:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_6XI80xzhtP:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_4MxGYOFadg:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_UzH9Vi48Gm:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_MRiKdfNT8w:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_ws6R4BgQyO:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_lHfkdkKKRx:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_6oEURBBwDT:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_nhdN4630Sn:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_z3wh2o4irT:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_xqZAHVauC9:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_5gmpCKGqFA:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_0WzuNbhKml:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_gGaxkh074c:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_02Z4pEGUzl:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_qzgWHO7K5I:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_wDmtCUxxwE:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_Yuzsb2lVO1:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_hVVEmsJdCy:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_ateroqZC1C:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_GZM5cUQONO:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_AIeMpIeVd5:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_U3SiA5Dzep:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_FrHHB97ivh:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_ACFUFQ0GxH:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_c4mbQ0iGYm:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_y4lVe8eIeT:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_xVPME74ofD:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_aQEJe4zkYN:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_tvZmZszNcr:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_rRvHK9XAim:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_Q6230UbnzM:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_HVzzaKrri6:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_UMvhhLr3dA:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_Llx5nR5Seq:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_hLmzJJNEzu:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_r4QbkGzdDg:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_9mN3dPJ67O:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_g126a0Z8By:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_rqXAdW8owO:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_0o5zv6BJRW:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_SmLlXbncqz:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_3bO86hHVHX:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_9ahwu6RBfD:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_6NDcgAXFfw:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_CBvAeQEmD2:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_Ue7eV2gfPy:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_0YJCVKllw6:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_nJFEC8mXT6:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_QbhS7nfBAu:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_g6B5WQ7LpQ:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_LXigbQIXoA:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_kxw3TBlum4:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_9w7laVreCQ:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_K2epe7qzze:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_d8PdABp1wt:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_OFCzvnSEIk:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_BewDPGSLES:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_mcWcduueks:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_Fitd1ZCUD9:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_WmekG4Arxn:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_o3xe3GlFas:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_oxvTvxHroQ:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_8Y6DPbzOfS:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_Kw7U03is4G:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_3xSfR0FRQa:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_zutGoscPpT:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_rWpg6AIk3K:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_lYgVFyeNtt:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_bzSSSlJN7H:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_XE1ATAmmFF:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_d48vu7LVzO:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_CYcU2Aimge:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_tWHvp46q4y:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_xZ2zUOigEZ:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_rRIMZwC0T9:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_8AaNpnrMHk:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_NHnzpBXqQl:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_FKb6LqTzD4:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_D6uDNKzCJV:04hSRIMz',
        //     'gate.nstproxy.io:24125:B67159618699A144-residential-country_US-sense_sneaker-r_10m-s_Ls81POfXUJ:04hSRIMz',
        // ]);
        let proxy = 'http://127.0.0.1:8888';
        if (url.includes('165.227.104.89:40321') || url.includes('api.capsolver.com') || url.includes('86.29.185.160:5215') || url.includes('.sneakerpengiun.com') || url.includes('.rapidapi.com') || url.includes('.fdisservices') || url.includes('api.sms-activate.org') || url.includes('localhost:44') || url.includes('/v2/web') || url.includes('jevi.dev') || url.includes('ksd-ct.cobolt7.io') || url.includes('api.ez-captcha.com') || options.proxy === 'localhost') {
            // proxy = '';
            // proxy = 'http://127.0.0.1:8888';
            // _options.dumpSess = true;
            // part = this.getDatasetPartitionForTask(_options.task);
        }
        const headerOrder = [':method', ':authority', ':scheme', ':path'];
        if (method === 'POST' || method === 'PUT' || method === 'PATCH') { // special handing for content-length on POST/PATCH
            headerOrder.push('content-length');
        }
        for (const a in options.headers) {
            if (a) {
                headerOrder.push(a);
                if (options.headers[a]) {
                    options.headers[a] = options.headers[a].toString();
                }
            }
        }

        const requestConfig = {
            method: method,
            url: url,
            proxy: proxy,
            headers: _options.headers,
            order: headerOrder,
            partition: part,
            timeout: 45000
        };
        if (_options.timeout) {
            requestConfig.timeout = _options.timeout;
        }
        if (_options.ignoreBody) {
            requestConfig.ignoreBody = _options.ignoreBody;
        }
        if (_options.parts) {
            requestConfig.parts = _options.parts;
        }
        if (_options.hasOwnProperty('json')) {
            requestConfig.json = _options.json;
        } else {
            requestConfig.json = true;
        }
        if (_options.body) {
            requestConfig.body = _options.body;
        }
        if (_options.form) {
            requestConfig.form = _options.form;
        }
        if (_options.rawBody) {
            requestConfig.rawBody = _options.rawBody;
        }
        if (_options.uintArray) {
            requestConfig.uintArray = _options.uintArray;
        }
        if (_options.resolveOnlyBody) {
            requestConfig.resolveOnlyBody = _options.resolveOnlyBody;
        }
        if (_options.skipRedirections) {
            requestConfig.skipRedirections = _options.skipRedirections;
        }
        if (_options.skipStringify) {
            requestConfig.skipStringify = _options.skipStringify;
        }
        if (_options.dontUseCookies) {
            requestConfig.dontUseCookies = _options.dontUseCookies;
        }
        if (_options.brotli) {
            requestConfig.brotli = _options.brotli;
        }
        if (_options.skipCookies) {
            requestConfig.skipCookies = _options.skipCookies;
        }

        const response = await this.actualSend(requestConfig).catch((e) => {
            console.log('here err broke', e)
            // done = true;
        });
        return this.afterRequest(method, _options, response, url).then((r) => {
            return Promise.resolve(r);
        }).catch((e) => {
            return Promise.reject(e);
        });
    }


    static async actualSend(requestConfig) {
        // @ts-ignore
        return CustomGrpcRequestC.actualSend(requestConfig);
    }

    static async afterRequest(method, _options, response, url) {
        if (response) {
            if (response.headers && response.headers['x-kpsdk-ct']) {
                if (url && url.includes('api.')) {
                    _options.task.kpsdkctAPI = response.headers['x-kpsdk-ct'];
                } else if (url && url.includes('accounts.')) {
                    _options.task.kpsdkctAccounts = response.headers['x-kpsdk-ct'];
                }
            }
            if (response.statusCode) {
                if (String(response.statusCode).startsWith('666')) {
                    // @todo also do no connection - instant retry
                    await CustomElectronRequestC.sleep(CustomElectronRequestC.random(500, 2500));
                    return this.send(method, url, _options);
                }
                if (String(response.statusCode).startsWith('2') || String(response.statusCode).startsWith('3')) {
                    if (_options.resolveOnlyBody) {
                        return Promise.resolve(response.body);
                    }
                    return Promise.resolve(response);
                }

                // return Promise.reject(response);

                if (response.statusCode === 429) {
                    if (response.headers && response.headers['retry-after']) {
                        await CustomElectronRequestC.sleep(CustomElectronRequestC.random(2500, 5000));
                    } else {
                    }
                }
                if (response.statusCode && (response.statusCode === 403 || response.statusCode === 409 || response.statusCode === 405 || response.statusCode === 401 || response.statusCode === 400 || response.statusCode === 503 || response.statusCode === 400) || response.statusCode === 429 || response.statusCode === 500 || response.statusCode === 501) {
                    return Promise.reject(new ErrorHelper('REQUEST FAILED', response))
                }
                return Promise.reject(response);
            }
        }
        return Promise.reject('Request timed out!');
    }

    static async setCookie(task, key, value, url) {
        const partition = this.getPartitionPersist(task);
        try {
            await CustomGrpcRequestC.setCookie(partition, key, value, url);
        } catch (e) {
            // console.log('couldn\'t set cookie!', e);
        }
    }

    static async removeCookie(task, key, url = '') { // key can be includes or full cookie name
        const partition = this.getPartitionPersist(task);
        try {
            if (useGrpc) {
                await CustomGrpcRequestC.removeCookie(partition, key, url);
                return;
            }
            const cookies = await this.getCookies(task);
            const found = cookies.find(({name}) => name === key);
            if (found) {
                await CustomGrpcRequestC.removeCookie(partition, key, url);
            }
        } catch (e) {
            console.log('couldn\'t remove cookie!', e);
        }
    }

    static async resetPartition(task) {
        const partition = this.getPartitionPersist(task);

        try {
            await CustomGrpcRequestC.resetPartition(partition)
        } catch (e) {
            // console.log('couldn\'t set cookie!', e);
        }
    }

    static async setCookies(task, cookies) {
        const partition = this.getPartitionPersist(task);
        try {
            await CustomGrpcRequestC.setCookies(partition, cookies);
        } catch (e) {
            // console.log('couldn\'t set cookiessss!', e);
        }
    }

    static async getCookies(task, filter = '') {
        const partition = this.getPartitionPersist(task);
        const filt = filter || {};

        try {
            const cookies = await CustomGrpcRequestC.getCookies(partition, filter)
            return cookies;
        } catch (e) {
            console.log('couldn\'t get cookies!', e);
        }
    }


    static async getCookie(task, key) { // key can be includes or full cookie name
        try {
            if (useGrpc) {
                const partition = this.getPartitionPersist(task);
                const value = await CustomGrpcRequestC.getCookie(partition, key);

                return value;
            } else {
                const cookies = await this.getCookies(task);
                const found = cookies.find(({name}) => name === key);
                if (found) {
                    return found.value;
                }
            }
            return '';
        } catch (e) {
            // console.log('couldn\'t get cookie!', e);
        }
    }

    static getPartitionPersist(task) {
        if (task.uid) {
            return 'persist:' + 'TSBSnkrs' + task.uid;
        }
        throw 'invalid task config uid'
    }

    static getDatasetPartitionForTask(task) {
        return 'TSBSnkrs' + task.datasetPartitionForTask + CustomElectronRequestC.random(1, 200).toString();
    }

    static async initPartition(task, profile = '') {
        let proxy = '';
        const part = CustomElectronRequestC.getPartitionPersist(task);
        await CustomGrpcRequestC.init(part, proxy, task.user_agent, profile);
        return Promise.resolve();
    }


    static sleep(ms = 0) {
        return new Promise(r => setTimeout(r, ms));
    }

    static random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static btoa(text = '') {
        return Buffer.from(text, 'utf8').toString('base64');
    }
}

module.exports = CustomElectronRequestC;
