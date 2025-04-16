const authService = require('../services/authService');

module.exports = {
    createAuth: async (req, res, next) => {
        const { userId, hash } = req.body;
        const userAuth = req.user;

        try {
            const userToken = await authService.createAuth(userId, hash);

            res.status(201).json({
                msg: 'Token issued',
                token: userToken,
            });
        }catch (e){
            next(e);
        }
    },
};