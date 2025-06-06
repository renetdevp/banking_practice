const userService = require('../services/userService');

module.exports = {
    readAll: async (req, res, next) => {
        try {
            const users = await userService.readAll();

            res.status(200).json({
                users: users,
            });
        }catch (e){
            next(e);
        }
    },

    readOne: async (req, res, next) => {
        const userId = req.params.id;

        try {
            const user = await userService.readOne({ userId }, { userId: 1, role: 1 });

            res.status(200).json({
                user: user,
            });
        }catch (e){
            next(e);
        }
    },

    createOne: async (req, res, next) => {
        const { userId, hash } = req.body;

        try {
            await userService.createOne(userId, hash);

            res.status(201).json({
                msg: `User ${userId} created`,
            });
        }catch (e){
            next(e);
        }
    },

    updateOne: async (req, res, next) => {
        const userId = req.params.id;
        const changes = req.body;

        try {
            await userService.updateOne(userId, changes);

            res.status(200).json({
                msg: `User ${userId} changed`,
            });
        }catch (e){
            next(e);
        }
    },

    deleteAll: async (req, res, next) => {
        try {
            await userService.deleteAll();

            res.status(200).json({
                msg: 'All Users deleted',
            });
        }catch (e){
            next(e);
        }
    },

    deleteOne: async (req, res, next) => {
        const userId = req.params.id;

        try {
            await userService.deleteOne(userId);

            res.status(200).json({
                msg: `User ${userId} deleted`,
            });
        }catch (e){
            next(e);
        }
    },
};