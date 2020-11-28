const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate: value => {
                if (!validator.isEmail(value)) {
                    throw Error('Email is invalid');
                }
            }

        },

        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 7,
            validate: value => {
                if (value.toLowerCase().includes('password')) {
                    throw Error('Password must not contain "password"');
                }
            }
        },
        age: {
            type: Number,
            default: 0,
            validate: value => {
                if (value < 0) {
                    throw Error('Age must be a positive number');
                }
            }
        },
        avatar: {
            type: Buffer
        },
        tokens: [{
            token: {
                type: String,
                required: true,
            }
        }]
    },
    {
        timestamps: true
    }
);

userSchema.virtual('tasks', {
    'ref': 'Task',
    'foreignField': 'user',
    'localField': '_id'
});

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
}

//toJSON gets called automatically when the user object is sent in the response 
//Once JSON.stringify is called on background whenever we send a response
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    //delete the password and tokens from the user object that will be sent to the user in the response
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to login');
    }

    return user;
}

//Needs to be a normal function since arrow functions don't bind "this"
//For the pre function parameter it's important to have "this" as the function itself
userSchema.pre('save', async function (next) {
    const user = this;
    //Hash the plain text password 
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    //Callback to be called after the logic is done  so mongoose knows it's done
    //This is necessary once this function is asynchronous
    next();
});

//Delete tasks of the user before deleting the user
userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({ user: user._id });
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;