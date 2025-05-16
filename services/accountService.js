const Account = require('../models/accountModel');

function checkOwner(owner){
    if (typeof owner !== 'string') throw customError(400, 'Invalid Format');
}

function checkAccountId(accountId){
    if (typeof accountId !== 'string') throw customError(400, 'Invalid Format');
}

function checkFilter(filter, opt = { owner: 1, }){
    if (!filter) throw customError(400, 'Invalid Format');

    const { owner, accountId } = filter;

    if (opt.owner === 1) checkOwner(owner);
    if (opt.accountId === 1) checkAccountId(accountId);
}

function customError(code, msg){
    const err = new Error();

    err.code = code;
    err.msg = msg;

    return err;
}

module.exports = {
    readAll: async (filter = {}, projection = {}) => {
        // req.user의 모든 account를 읽어옴
        // filter.owner에 userId 저장

        checkFilter(filter);

        const accounts = await Account.find(filter, projection).lean();

        return accounts;
    },

    readOne: async (filter = {}, projection = { _id: 1, balance: 1 }) => {
        // filter.accountId에서 account를 읽어옴
        // filter.owner에 userId 저장

        checkFilter(filter, { owner: 1, accountId: 1 });

        const account = await Account.findOne({ owner: filter.owner, _id: filter.accountId, }, projection).lean();

        if (account === null) throw customError(404, `Account ${filter.accountId} not found`);

        return account;
    },

    createOne: async (userId) => {
        // account를 생성할 때 기본적으로 잔액(balance)는 0으로 설정됨
        const res = await Account.create({
            owner: userId,
        });

        return res._id;
    },

    deleteOne: async (filter = {}) => {
        checkFilter(filter, { owner: 1, accountId: 1 });

        const result = await Account.deleteOne({ owner: filter.owner, _id: filter.accountId }).exec();

        if (result.deletedCount === 0){
            throw customError(404, `Account ${filter.accountId} not found`);
        }
    },
};