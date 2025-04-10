const jwt = require('jsonwebtoken');

const jwtSecret = process.env.jwtSecret || 'thisisjwtsecret';
const jwtOption = {
    algorithm: 'HS512',
    expiresIn: '1h',
};

function checkValidToken(token){
    if (typeof token !== 'string'){
        throw createErrorResponse(401, 'Unauthorized');
    }

    if (!token.trim()){
        throw createErrorResponse(401, 'Unauthorized');
    }
}

function createErrorResponse(code, msg){
    const err = new Error();

    err.code = code;
    err.msg = msg;

    return err;
}

module.exports = {
    createToken: (userId, role) => {
        return new Promise((resolve, reject) => {
            jwt.sign({ userId, role }, jwtSecret, jwtOption, (err, token) => {
                if (err){
                    reject(createErrorResponse(400, 'Failed to create Token'));
                }

                resolve(token);
            });
        });
    },

    verifyToken: (userToken) => {
        return new Promise((resolve, reject) => {
            checkValidToken(userToken);

            jwt.verify(userToken, jwtSecret, (err, decoded) => {
                if (err){
                    reject(createErrorResponse(400, 'Failed to verify Token'));
                }

                resolve(decoded);
            });
        });
    },
};