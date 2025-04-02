const { verifyToken } = require('../services/JWTService');

function checkValidUserAuth(userAuth){
    if (typeof userAuth !== 'string'){
        throw createErrorResponse(401, 'Unauthorized');
    }

    if (!userAuth.startsWith('Bearer ')){
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
    verifyAuth: async (req, res, next) => {
        const userAuth = req.headers.authorization;

        try {
            checkValidUserAuth(userAuth);

            const token = userAuth.split('Bearer ')[1];

            const decodedUser = await verifyToken(token);

            req.user = decodedUser;

            next();
        }catch (e){
            res.status(e.code).json({
                msg: e.msg,
            });
        }
    },

    checkAdmin: (req, res, next) => {
        const { role } = req.user;

        if (role !== 'admin'){
            return res.status(403).json({
                msg: 'Forbidden',
            });
        }

        next();
    },
}