const { MongoClient, ObjectID } = require('mongodb');

const connectionUrl = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';


MongoClient.connect(connectionUrl, { useUnifiedTopology: true }, (error, client) => {
    if (error) {
        console.log('Unable to connect to database');
        return;
    }
    const db = client.db(databaseName);

    db.collection('tasks').deleteOne({ description: 'Renew inspection' }).then(result => {
        console.log(result);
    }).catch(error => {
        console.log(error);
    });
    // db.collection('users').deleteMany({ comment: 'blablabla' }).then(result => {
    //     console.log(result);
    // }).catch(error => {
    //     console.log(error);
    // });

    // db.collection('users').updateOne({ _id: new ObjectID('5fbcf80fb3048d2d6c9ff0b6') }, {
    //     $set: {
    //         name: 'John'
    //     }
    // }).then(result => {
    //     console.log(result);
    // }).catch(error => {
    //     console.log(error);
    // });

    // db.collection('tasks').updateMany({ completed: false }, {
    //     $set: {
    //         completed: true
    //     }
    // }).then(result => {
    //     console.log(result.modifiedCount);
    // }).catch(error => {
    //     console.log(error);
    // });
});