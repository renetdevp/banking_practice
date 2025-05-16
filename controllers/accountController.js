const accountService = require('../services/accountService');

module.exports = {
    readAll: async (req, res, next) => {
        const { userId } = req.user;

        try {
            const accounts = await accountService.readAll({ owner: userId, });

            res.status(200).json({
                accounts,
            });
        }catch (e){
            next(e);
        }
    },

    readOne: async (req, res, next) => {
        const { userId } = req.user;
        const { accountId } = req.params;

        try {
            const account = await accountService.readOne({ owner: userId, accountId, });

            res.status(200).json({
                account,
            });
        }catch (e){
            next(e);
        }
    },

    createOne: async (req, res, next) => {
        const { userId } = req.user;

        try {
            const accountId = await accountService.createOne(userId);

            res.status(201).json({
                accountId,
            });
        }catch (e){
            next(e);
        }
    },

    deleteOne: async (req, res, next) => {
        const { userId } = req.user;
        const { accountId } = req.params;

        try {
            await accountService.deleteOne({ owner: userId, accountId, });;

            res.status(200).json({
                msg: `Account ${accountId} deleted`
            });
        }catch (e){
            next(e);
        }
    },
};