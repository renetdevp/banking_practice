const { randomBytes, pbkdf2 } = require('node:crypto');

const User = require('../models/userModel');
const { verifyToken } = require('./JWTService');

function checkUserIdFormat(userId){
    if (typeof userId !== 'string'){
        throw createErrorResponse(400, 'Invalid userId');
    }
}

function checkHashFormat(hash){
    if (typeof hash !== 'string'){
        throw createErrorResponse(400, 'Invalid hash');
    }
}

function checkUserFormat(userId, hash){
    // todo: joi를 써서 좀 더 다양한 validation 시도

    checkUserIdFormat(userId);
    checkHashFormat(hash);
}

function encryptPassword(password, salt=undefined){
    return new Promise((resolve, reject) => {
        const localSalt = !!salt ? salt : randomBytes(16).toString('hex');
        const encryptAlgorithm = process.env.encryptAlgorithm || 'sha512';

        pbkdf2(password, localSalt, 310000, 32, encryptAlgorithm, (err, derivedKey) => {
            if (err){
                return reject({
                    code: 500,
                    msg: 'Failed to encrypt password',
                });
            }

            resolve({
                salt: localSalt,
                encrypted: derivedKey.toString('hex'),
            });
        });
    });
}

async function conformUser(modification){
    let result = {};

    if (!modification){
        return;
    }

    const { userId, hash } = modification;

    if (typeof userId !== 'string'){
        result.userId = userId;
    }

    if (typeof hash !== 'string'){
        const { salt, encrypted } = await encryptPassword(hash);

        result.salt = salt;
        result.hash = encrypted;
    }

    if (Object.keys(result).length === 0){
        return;
    }

    return result;
}

function checkUserAuth(userId, userAuth){
    if (userId === userAuth.userId || userAuth.role !== 'admin'){
        throw createErrorResponse(403, 'Forbidden');
    }
}

function createErrorResponse(code, msg){
    const err = new Error();

    err.code = code;
    err.msg = msg;

    return err;
}

module.exports = {
    readAll: async (filter = {}, projection = { userId: 1, role: 1 }) => {
        const users = await User.find(filter, projection).lean();

        return users;
    },

    readOne: async (filter = {}, projection = { userId: 1, role: 1 }, userAuth) => {
        // userId가 unique한 속성이고 user를 구분하기 위해 사용되므로 filter 내에 반드시 존재해야 함
        const { userId } = filter;
        checkUserIdFormat(userId);
        checkUserAuth(userId, userAuth);

        const user = await User.findOne(filter, projection).lean();

        if (user === null){
            throw createErrorResponse(404, `User ${userId} not found`);
        }

        return user;
    },

    createOne: async (userId, hash) => {
        checkUserFormat(userId, hash);

        const exists = await User.exists({ userId });
        if (!!exists){
            throw createErrorResponse(409, `User ${userId} already exists`);
        }

        const { salt, encrypted } = await encryptPassword(hash);

        await User.create({ userId: userId, hash: encrypted, salt: salt });
    },

    updateOne: async (userId, changes, userAuth) => {
        checkUserIdFormat(userId);
        checkUserAuth(userId, userAuth);

        const conformedUser = await conformUser(changes);

        if (!conformedUser){
            throw createErrorResponse(400, 'Invalid changes format');
        }

        const result = await User.findOne({ userId }, conformedUser);

        if (result.modifiedCount === 0){
            throw createErrorResponse(404, `User ${userId} not found`);
        }
    },

    deleteAll: async (filter = {}) => {
        await User.deleteMany(filter).exec();
    },

    deleteOne: async (userId, userAuth) => {
        checkUserIdFormat(userId);
        checkUserAuth(userId, userAuth);

        const result = await User.deleteOne({ userId }).exec();

        if (result.deletedCount === 0){
            throw createErrorResponse(404, `User ${userId} not found`);
        }
    },

    readVerifyInfo: async (filter = {}) => {
        const { userId } = filter;
        checkUserIdFormat(userId);

        const verifyInfo = await User.findOne(filter, { hash: 1, salt: 1, role: 1 });
        if (verifyInfo === null){
            throw createErrorResponse(404, `User ${filter.userId} not found`);
        }

        return verifyInfo;
    },

    encryptPassword,
    checkUserFormat,
};