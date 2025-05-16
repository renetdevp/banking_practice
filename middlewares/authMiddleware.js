const { verifyToken } = require('../services/JWTService');
const accountService = require('../services/accountService');

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
            next(e);
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

    checkSelfOrAdmin: (req, res, next) => {
        const userId = req.params.id;
        const { role } = req.user;

        if (role === 'admin') return next();
        if (userId === req.user.userId) return next();

        return res.status(403).json({
            msg: 'Forbidden',
        });
    },

    checkOwnerOrAdmin: async (req, res, next) => {
        const { accountId } = req.params;
        const { userId } = req.user;
        const { role } = req.user;

        try {
            const { owner } = await accountService.readOne({
                accountId, owner: userId,
            }, { _id: 0, owner: 1, });

            if (role === 'admin') return next();
            if (owner === userId) return next();

            return res.status(403).json({
                msg: 'Forbidden',
            });
        } catch (e){
            next(e);
        }
    },
}