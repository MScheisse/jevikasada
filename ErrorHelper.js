class ErrorHelper {
    code = ErrorCode.GENERAL;
    data = {};
    message = '';

    constructor(message = '', data = {}, code = ErrorCode.GENERAL) {
        this.code = code;
        this.message = message;
        this.data = data;
        return {code: this.code, message: this.message, data: this.data};
    }

    static is(a) {
        return Boolean(a && a.hasOwnProperty('code') && a.message && a.data);
    }

    static stop() {
        return new ErrorHelper('TERMINATING TASK', {}, ErrorCode.STOPPED);
    }

    static kasadaBlocked() {
        return new ErrorHelper('K4SDA GLOBAL RETRY LIMIT!', {}, ErrorCode.STOPPED);
    }

    static handleSensor(err) {
        return (this.sensorAccessDenied403(err) || this.sensorAccessDenied429(err) || this.cryptoChallenge428(err))
    }

    static sensorAccessDenied403(e) {
        return (this.is(e) && e.data &&
            ((e.data.statusCode === 403)
                || (e.data.body && ErrorHelper.isString(e.data.body) && (e.data.body.indexOf('Access Denied') !== -1))
            )
        ) || (e && e.statusCode === 403);
    }

    static sensorAccessDenied400(e) {
        return (this.is(e) && e.data &&
            ((e.data.statusCode === 400))
        ) || (e && e.statusCode === 400);
    }

    static sensorAccessDenied429(e) {
        return (this.is(e) && ((e.data && e.data.statusCode === 429) || (e.message && e.message.statusCode === 429)) || (e && e.statusCode === 429)
        );
    }

    static cryptoChallenge428(e) {
        return (this.is(e) && e.data &&
            ((e.data.statusCode === 428)
                || (e.data.body && ErrorHelper.isString(e.data.body) && (e.data.body.indexOf('sec-cp-challenge') !== -1))
            )
        ) || (e && e.statusCode === 428);
    }

    static sensorAccessDenied504(e) {
        return (this.is(e) && e.data && e.data.statusCode === 504) || (e && e.statusCode === 504);
    }

    static isAccessDenied401(e) {
        return (this.is(e) && e.data &&
            ((e.data.statusCode === 401)
                || (e.data.body && ErrorHelper.isString(e.data.body) && (e.data.body.toLowerCase().indexOf('unauthorized user access') !== -1))
            ) || (e.message && typeof e.message === 'string' && e.message.toUpperCase() === 'UNAUTHORIZED USER ACCESS!!')
        ) || (e && e.statusCode === 401) || ((e && e.message && e.message.toUpperCase() === 'UNAUTHORIZED USER ACCESS!!'));
    }

    static unAuthorizedUserAccess(e) {
        return ((e && e.message && e.message.toUpperCase() === 'UNAUTHORIZED USER ACCESS!!'));
    }

    static isString(x) {
        return Object.prototype.toString.call(x) === '[object String]';
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

module.exports = ErrorHelper;
