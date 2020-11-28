const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');


const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        user: req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

//GET /tasks?completed=true
//GET /tasks?limit=10&skip=10
//GET /tasks?sortBy=createdAt_desc
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split('_');
        sort[parts[0]] = parts[1] == 'desc' ? -1: 1; //set the field name on the sort abject and assign -1 or 1 for the order value  
    }

    try {
        // const tasks = await Task.find({user: req.user._id});
        // await req.user.populate('tasks').execPopulate();
        await req.user.populate({
            path: 'tasks',
            match: match,
            options: {
                limit: parseInt(req.query.limit), //if not provided it will or if its not an int its gonna be ignored by mongoose
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await Task.findOne({ _id: taskId, user: req.user._id });
        if (!task) {
            res.status(404).send();
        }
        res.send(task);
    } catch (error) {
        res.status(500).send(error.message);
    };
});

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete({ _id: req.params.id, user: req.user._id },);
        if (!task) {
            res.status(404).send();
        }
        res.send(task);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {
    const requestFields = Object.keys(req.body);
    const taskFields = ['description', 'completed'];
    const isRequestValid = requestFields.every(requestField => taskFields.includes(requestField))

    if (!isRequestValid) {
        res.status(400).send({ error: 'Request fields not valid' });
    }
    try {
        const taskId = req.params.id;
        //does logic below because we have to explicitly call save for the middleware being called
        const task = await Task.findOne({ _id: taskId, user: req.user._id });

        if (!task) {
            res.status(404).send();
        }

        //set the new fields sent in the request
        requestFields.forEach(requestField => task[requestField] = req.body[requestField]);
        await task.save();
        // const task = await Task.findByIdAndUpdate(taskId, req.body, { new: true, runValidators: true });
        res.send(task);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;