const request = require('supertest');
const { Types: { ObjectId } } = require('mongoose');

const app = require('../app');
const User = require('../models/userModel');
const Account = require('../models/accountModel');

// 우선 로그인을 해서 userAuth를 얻고, 그 userAuth로 account API를 검사
const initDB = async () => {
    await User.deleteMany();
    await Account.deleteMany();

    const existUser = { userId: 'existuser', hash: 'existHash' };

    await requestHandler('post', '/users', existUser);
};

const getUserAuth = async (userInfo) => {
    const { userId, hash } = userInfo;

    const { body } = await requestHandler('post', '/auth', { userId, hash, });

    return body.token;
};

const createAccount = async (userAuth) => {
    const { body } = await requestHandler('post', '/accounts', undefined, userAuth);

    return body.accountId;
};

// account 생성, accounts 확인, 존재하는/존재하지 않는 account 확인, 존재하는/존재하지 않는 account 삭제

describe('TEST /accounts ROUTE', () => {
    let userAuth = '';
    let existAccountId = '';

    beforeAll(async () => {
        const existUser = { userId: 'existuser', hash: 'existHash' };

        await initDB();
        userAuth = await getUserAuth(existUser);
        existAccountId = await createAccount(userAuth);
    });

    test('Create Account 1', async () => {
        const res = await requestHandler('post', '/accounts', undefined, userAuth);

        expect(res.statusCode).toBe(201);
    });

    test('Create Account 2', async () => {
        const res = await requestHandler('post', '/accounts', undefined, userAuth);

        expect(res.statusCode).toBe(201);
    });

    test('Read Accounts', async () => {
        const res = await requestHandler('get', '/accounts', undefined, userAuth);

        expect(res.statusCode).toBe(200);
    });

    test('Read exist Account', async () => {
        const res = await requestHandler('get', `/accounts/${existAccountId}`, undefined, userAuth);

        expect(res.statusCode).toBe(200);
    });

    test('Read non-exist Account', async () => {
        const res = await requestHandler('get', `/accounts/${new ObjectId()}`, undefined, userAuth);

        expect(res.statusCode).toBe(404);
    });

    test('Delete exist Account', async () => {
        const res = await requestHandler('delete', `/accounts/${existAccountId}`, undefined, userAuth);

        expect(res.statusCode).toBe(200);
    });

    test('Delete non-exist Account', async () => {
        const res = await requestHandler('delete', `/accounts/${new ObjectId()}`, undefined, userAuth);

        expect(res.statusCode).toBe(404);
    });
});

/**
 * 
 * @param {"GET"|"POST"|"PUT"|"DELETE"|"get"|"post"|"put"|"delete"} method HTTP Method
 * @param {String} route 
 * @param {Object} [body] 
 * @param {String} [auth] JWT token
 * @returns {request.SuperTestStatic.Test}
 */
function requestHandler(method, route, body, auth){
    if (typeof method !== 'string'){
        throw new Error('Method should be String');
    }

    const upperMethod = method.toUpperCase();

    if (['GET', 'POST', 'PUT', 'DELETE'].indexOf(upperMethod) === -1){
        throw new Error('Invalid/Unsupported HTTP Method');
    }

    if (typeof route !== 'string'){
        throw new Error('Route should be String');
    }

    // 함수 반환값으로 request(app).HTTPMETHOD(route)를 주지 않고, object에서 바로 value로 넣어줄 경우 사용하지 않은 method에서 jest openHandle 문제를 일으킴
    const requestMap = {
        'GET': () => { return request(app).get(route) },
        'POST': () => { return request(app).post(route) },
        'PUT': () => { return request(app).put(route) },
        'DELETE': () => { return request(app).delete(route) },
    };

    let result = requestMap[upperMethod](route);

    if (!!body){
        result = result.send(body);
    }

    if (typeof auth === 'string'){
        result = result.set('Authorization', `Bearer ${auth}`);
    }

    return result;
}