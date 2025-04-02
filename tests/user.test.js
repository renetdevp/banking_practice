const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../app');
const User = require('../models/userModel');
const { encryptPassword } = require('../services/userService');

const { createToken } = require('../services/JWTService');

beforeAll(async () => {
    // initialize DB
    await User.deleteMany();
    const { salt, encrypted } = await encryptPassword('existHash');
    await User.create({ userId: 'existuser', hash: encrypted, salt: salt });
});

// testCodeSet
// {
//     readAllUsers: 401,
//     readUser: 401,
//     createUser: 201,
//     ...etc
// }

describe('TEST /users ROUTE', () => {
    describe('TEST /users ROUTE without identification', () => {
        const anonymousTestSet = {
            readAllUsers: 401,
            readOtherUser: 401,
            readNonExistUser: 401,
            createNewUser: 201,
            createExistUser: 409,
            updateOtherUser: 401,
            deleteOtherUser: 401,
            deleteAllUsers: 401,
        };
        userTest(undefined, undefined, anonymousTestSet);
    });

    describe('TEST /users ROUTE with non-admin identification', () => {
        const nonAdminUser = { userId: 'testuser', hash: 'testHash' };
        let nonAdminToken = '';
        beforeAll(async () => {
            nonAdminToken = await createToken(nonAdminUser.userId, 'user');
        });
        const nonAdminTestSet = {
            readAllUsers: 403,
            readUserself: 200,
            readOtherUser: 403,
            readNonExistUser: 404,
            createNewUser: 201,
            createExistUser: 409,
            updateUserself: 200,
            updateOtherUser: 401,
            deleteOtherUser: 401,
            deleteAllUsers: 401,
        };
        userTest(nonAdminUser.userId, nonAdminToken, nonAdminTestSet);
    });

    describe('TEST /users ROUTE with admin identification', () => {
        const adminUser = { userId: 'adminuser', hash: 'adminHash' };
        // const adminToken = await requestHandler('post', '/auth', adminUser);
        let adminToken = '';
        const adminTestSet = {
            readAllUsers: 403,
            readUserself: 200,
            readOtherUser: 403,
            readNonExistUser: 404,
            createNewUser: 201,
            createExistUser: 409,
            updateUserself: 200,
            updateOtherUser: 401,
            deleteOtherUser: 401,
            deleteAllUsers: 401,
        };
        beforeAll(async () => {
            adminToken = await createToken(adminUser.userId, 'admin');
        });
        userTest(adminUser.userId, adminToken, adminTestSet)
    });
});

function userTest(userId, auth, testCodeSet){
    const testMap = {
        readAllUsers: async () => {
            return await requestHandler('get', '/users', undefined, auth);
        },

        readUserself: async () => {
            if (!userId) throw new Error('Invalid userId')
            return await requestHandler('get', `/users/${userId}`, undefined, auth);
        },

        readOtherUser: async () => {
            return await requestHandler('get', '/users/defaultuser', undefined, auth);
        },

        readNonExistUser: async () => {
            return await requestHandler('get', '/users/invisibleman', undefined, auth);
        },

        createNewUser: async () => {
            return await requestHandler('post', '/users', { userId: 'newuser', hash: 'newHash' });
        },

        createExistUser: async () => {
            return await requestHandler('post', '/users', { userId: 'existuser', hash: 'existHash' });
        },

        updateUserself: async () => {
            if (!userId) throw new Error('Invalid userId')
            return await requestHandler('put', `/users/${userId}`, { hash: 'updatedHash' }, auth);
        },

        updateOtherUser: async () => {
            return await requestHandler('put', '/users/defaultuser', { hash: 'updatedHash' }, auth);
        },

        deleteOtherUser: async () => {
            return await requestHandler('delete', '/users/defaultuser', undefined, auth);
        },

        deleteAllUsers: async () => {
            return await requestHandler('delete', '/users', undefined, auth);
        },
    };

    Object.keys(testCodeSet).map((key) => {
        test(key, async () => {
            const res = await testMap[key]();
            expect(res.statusCode).toBe(testCodeSet[key])
        });
    });
}

afterAll(() => {
    mongoose.connection.close();
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

// /**
//  * 
//  * @param {String} testName 
//  * @param {Function} testFn 
//  * @param {Function} assertFn 
//  */
// function testHandler(testName, testFn, assertFn){
//     if (typeof testName !== 'string'){
//         throw new Error('testName should be String');
//     }

//     if (typeof testFn !== 'function'){
//         throw new Error('testFn should be Function');
//     }

//     if (typeof assertFn !== 'function'){
//         throw new Error('assertFn should be Function');
//     }

//     test(testName, async () => {
//         const res = await testFn();

//         assertFn(res);
//     });
// }