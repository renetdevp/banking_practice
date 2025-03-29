const mongoose = require('mongoose');

module.exports = () => {
    const { DB_URI, DB_PORT, DB_NAME } = process.env;
    const dbURI = `mongodb://${DB_URI}:${DB_PORT}/${DB_NAME}`;
    const dbOption = {
        autoIndex: false,
    };

    mongoose.connect(dbURI, dbOption);
    const connection = mongoose.connection;

    connection.on('open', () => {
        const now = (new Date()).toString();

        console.log(`DB connected at ${now}`);
    });

    connection.on('error', (err) => {
        const now = (new Date()).toString();

        console.error(`DB error at ${now}`);
        if (process.env.NODE_ENV !== 'production'){
            console.error(err);
        }
    });
};