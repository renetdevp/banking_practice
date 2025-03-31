const jwt = require('jsonwebtoken');

const jwtSecret = process.env.jwtSecret || 'thisisjwtsecret';
const jwtOption = {
    algorithm: 'HS512',
    expiresIn: '1h',
};

module.exports = {
    createToken: async (userId) => {
        return new Promise((resolve, reject) => {
            jwt.sign({ suerId: userId }, jwtSecret, jwtOption, (err, token) => {
                if (err){
                    reject({ code: 400, msg: 'Failed to create Token' });
                }

                resolve(token);
            });
        });
    },

    verifyToken: (userAuth) => {
        return new Promise((resolve, reject) => {
            jwt.verify(userAuth, jwtSecret, jwtOption, (err, decoded) => {
                if (err){
                    reject({ code: 400, msg: 'Failed to verify Token' });
                }

                resolve(decoded.userId);
            });
        });
    },
};