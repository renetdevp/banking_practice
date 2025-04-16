const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../app');
const User = require('../models/userModel');

const { encryptPassword } = require('../services/userService');

const initDB = async () => {
    // initialize DB
    await User.deleteMany();

    const existUser = { userId: 'existuser', hash: 'existHash' };
    const defaultUser = { userId: 'defaultuser', hash: 'defaultUser' };

    await requestHandler('post', '/users', existUser);
    await requestHandler('post', '/users', defaultUser);
};

describe('TEST /users ROUTE', () => {
    describe('TEST /users ROUTE without identification', () => {
        beforeAll(initDB);

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

        Object.keys(anonymousTestSet).map((key) => {
            test(key, async () => {
                const res = await testMap[key](undefined, undefined);
                expect(res.statusCode).toBe(anonymousTestSet[key]);
            });
        });
    });

    describe('TEST /users ROUTE with non-admin identification', () => {
        const nonAdminUser = { userId: 'testuser', hash: 'testHash' };
        let nonAdminToken = '';

        beforeAll(async () => {
            await initDB();
            await requestHandler('post', '/users', nonAdminUser);
            const res = await requestHandler('post', '/auth', nonAdminUser);
            nonAdminToken = res.body.token;
        });

        const nonAdminTestSet = {
            readAllUsers: 403,
            readUserself: 200,
            readOtherUser: 403,
            readNonExistUser: 403,
            createNewUser: 201,
            createExistUser: 409,
            updateUserself: 200,
            updateOtherUser: 403,
            deleteOtherUser: 403,
            deleteAllUsers: 403,
        };

        Object.keys(nonAdminTestSet).map((key) => {
            test(key, async () => {
                const res = await testMap[key](nonAdminUser.userId, nonAdminToken);
                expect(res.statusCode).toBe(nonAdminTestSet[key]);
            });
        });
    });

    describe('TEST /users ROUTE with admin identification', () => {
        const adminUser = { userId: 'adminuser', hash: 'adminHash' };
        let adminToken = '';

        beforeAll(async () => {
            await initDB();

            // POST /users 는 기본적으로 role을 user로 지정하므로, role: admin인 사용자를 만들기 위해 직접 model.create를 호출함
            const { salt, encrypted } = await encryptPassword(adminUser.hash);
            await User.create({
                userId: adminUser.userId,
                hash: encrypted,
                salt: salt,
                role: 'admin',
            });
            const res = await requestHandler('post', '/auth', adminUser);
            adminToken = res.body.token;
        });

        const adminTestSet = {
            readAllUsers: 200,
            readUserself: 200,
            readOtherUser: 200,
            readNonExistUser: 404,
            createNewUser: 201,
            createExistUser: 409,
            updateUserself: 200,
            updateOtherUser: 200,
            deleteOtherUser: 200,
            deleteAllUsers: 200,
        };

        Object.keys(adminTestSet).map((key) => {
            test(key, async () => {
                const res = await testMap[key](adminUser.userId, adminToken);
                expect(res.statusCode).toBe(adminTestSet[key]);
            });
        });
    });
});

const testMap = {
    readAllUsers: async (userId, auth) => {
        return await requestHandler('get', '/users', undefined, auth);
    },

    readUserself: async (userId, auth) => {
        if (!userId) throw new Error('Invalid userId');
        return await requestHandler('get', `/users/${userId}`, undefined, auth);
    },

    readOtherUser: async (userId, auth) => {
        return await requestHandler('get', '/users/defaultuser', undefined, auth);
    },

    readNonExistUser: async (userId, auth) => {
        return await requestHandler('get', '/users/invisibleman', undefined, auth);
    },

    createNewUser: async (userId, auth) => {
        return await requestHandler('post', '/users', { userId: 'newuser', hash: 'newHash' });
    },

    createExistUser: async (userId, auth) => {
        return await requestHandler('post', '/users', { userId: 'existuser', hash: 'existHash' });
    },

    updateUserself: async (userId, auth) => {
        if (!userId) throw new Error('Invalid userId');
        return await requestHandler('put', `/users/${userId}`, { hash: 'updatedHash' }, auth);
    },

    updateOtherUser: async (userId, auth) => {
        return await requestHandler('put', '/users/defaultuser', { hash: 'updatedHash' }, auth);
    },

    deleteOtherUser: async (userId, auth) => {
        return await requestHandler('delete', '/users/defaultuser', undefined, auth);
    },

    deleteAllUsers: async (userId, auth) => {
        return await requestHandler('delete', '/users', undefined, auth);
    },
};

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