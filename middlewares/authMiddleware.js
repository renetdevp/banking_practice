const { verifyToken } = require('../services/JWTService');

function checkValidUserAuth(userAuth){
    if (typeof userAuth !== 'string'){
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
        const userAuth = req.headers.authorization.split('Bearer ')[1];

        try {
            checkValidUserAuth(userAuth);

            const decodedUserId = await verifyToken(userAuth);

            req.user = decodedUserId;

            next();
        }catch (e){
            res.status(e.code).json({
                msg: e.msg,
            });
        }
    },
}