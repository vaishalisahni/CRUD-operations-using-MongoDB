const express = require('express');

const mongoose = require('mongoose');
const { type } = require('os');

const port = 8000;
const app = express();

// Connection
mongoose.connect('mongodb://127.0.0.1:27017/youtube-app-1')
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log('MongoDB connection error:', err));

// Schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true, // email should be unique
    },
    jobTitle: {
        type: String,
    },
    gender: {
        type: String,
    },
}, { timestamps: true }); // timestamps will add createdAt and updatedAt fields automatically

// Model
const User = mongoose.model('user', userSchema);

// middleware - plugins
app.use(express.urlencoded({ extended: false })); // to parse form data
app.use(express.json()); // to parse JSON data


// ----------------Routes
// Server side rendering - HTML document render
app.get('/users', async (req, res) => {
    const allDbUsers = await User.find({}); // fetch {}->all users from the database
    const htmlContent = `
   
           <ul>
               ${allDbUsers.map(user => `<li>${user.firstName} ${user.lastName} - ${user.email}</li>`).join('')}
           </ul>
       
   `;
    return res.send(htmlContent);
});

// Rest API
// API endpoint to list all users in JSON format - for frontend/mobile app, alexa
app.get('/api/users', async (req, res) => {
    const allDbUsers = await User.find({});

    return res.json(allDbUsers); // send all users in JSON format
});

app.post('/api/users', async (req, res) => {
    const body = req.body;
    // console.log(body); // to see the data sent from the frontend

    if (!body || !body.first_name || !body.last_name || !body.email || !body.gender || !body.job_title) {
        return res.status(400).json({ status: 'failed', message: 'Please provide all required fields' }); // status 400 - Bad Request
    }

    const result = await User.create({
        firstName: body.first_name,
        lastName: body.last_name,
        email: body.email,
        gender: body.gender,
        jobTitle: body.job_title,
    })

    // console.log(result);

    return res.status(201).json({ status: 'success' }); // status 201 - Created


});


app.route('/api/users/:id')
    .get(async (req, res) => {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ status: 'failed', message: 'User not found' }); // status 404 - Not Found
        }
        return res.json(user);
    })
    .patch(async (req, res) => {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }); // new: true will return the updated document

        return res.status(200).json({ status: 'success update', updatedUser });

    })
    .delete(async (req, res) => {
        await User.findByIdAndDelete(req.params.id);
        return res.status(200).json({ status: 'success delete' });
    });

// -------------------Server listening/using 
app.listen(port, () => {
    console.log(`server is running on port ${port}!`);
});
