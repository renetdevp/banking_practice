const { timingSafeEqual } = require('node:crypto');

const { readOne, encryptPassword, checkUserFormat } = require('./userService');
const { createToken } = require('./JWTService');

/**
 * 
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function comparePassword(a, b){
    if (typeof a !== 'string' || typeof b !== 'string'){
        return false;
    }

    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function createErrorResponse(code, msg){
    const err = new Error();

    err.code = code;
    err.msg = msg;

    return err;
}

module.exports = {
    createAuth: async (userId, userHash) => {
        checkUserFormat(userId, userHash);

        const { hash, salt, role } = await readOne({ userId }, { hash: 1, salt: 1, role: 1 });
        const { encrypted } = await encryptPassword(userHash, salt);

        if (!comparePassword(hash, encrypted)){
            throw createErrorResponse(403, `Unauthorized`);
        }

        const token = await createToken(userId, role);

        return token;
    },
}