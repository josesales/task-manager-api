const mongoose = require('mongoose');

const connectionUrl = process.env.DB_URL;

mongoose.connect(connectionUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
});