const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const db = require('./config/config').get(process.env.NODE_ENV);
const User = require('./models/user');
const QuestionAnswer = require('./models/quest-ans');
const {
    auth
} = require('./middlewares/auth');


const app = express();
// app use
app.use(bodyparser.urlencoded({
    extended: false
}));
app.use(bodyparser.json());
app.use(cookieParser());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.origin ? req.headers.origin : "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if (req.method == "OPTIONS") {
        res.status(204).end();
    } else {
        next();
    }
});

// database connection
mongoose.Promise = global.Promise;
mongoose.connect(db.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function (err) {
    if (err) console.log(err);
    console.log("Database is connected");
});


app.get('/', function (req, res) {
    res.status(200).send(`Welcome to login , sign-up api`);
});

// adding new user (sign-up route)
app.post('/api/register', function (req, res) {
    // taking a user
    const newuser = new User(req.body);

    if (newuser.password != newuser.confirmPassword) return res.status(400).json({
        message: "password not match"
    });

    User.findOne({
        email: newuser.email
    }, function (err, user) {
        if (user) return res.status(400).json({
            auth: false,
            message: "Email already Exist"
        });

        newuser.save((err, doc) => {
            if (err) {
                console.log(err);
                return res.status(400).json({
                    success: false
                });
            }
            res.status(200).json({
                success: true,
                user: doc
            });
        });
    });
});

// login user
app.post('/api/login', function (req, res) {
    let token = req.cookies.auth;
    User.findByToken(token, (err, user) => {
        if (err) return res(err);
        if (err) return res.status(400).json({
            error: true,
            message: "Invalid Session. Logout first before you Proceed",
            logoutNeeded: true
        });

        else {
            User.findOne({
                'email': req.body.email
            }, function (err, user) {
                if (!user) return res.json({
                    isAuth: false,
                    message: ' Auth failed ,email not found'
                });

                user.comparepassword(req.body.password, (err, isMatch) => {
                    if (!isMatch) return res.json({
                        isAuth: false,
                        message: "password doesn't match"
                    });

                    user.generateToken((err, user) => {
                        if (err) return res.status(400).send(err);
                        res.cookie('auth', user.token).json({
                            isAuth: true,
                            id: user._id,
                            email: user.email,
                            isAdmin: user.isAdmin,
                        });
                    });
                });
            });
        }
    });
});

// get logged in user
app.get('/api/ownProfile', auth, function (req, res) {
    res.json({
        isAuth: true,
        id: req.user._id,
        email: req.user.email,
        userName: req.user.userName,
        phone: req.user.phone,
        dob: req.user.dob,
        role: req.user.role === 1 ? 'Admin' : req.user.role ===2 ? 'Teacher' : req.user.role===3 ? 'Student' : '-'
    })
});

//logout user
app.get('/api/logout', auth, function (req, res) {
    req.user.deleteToken(req.token, (err, user) => {
        if (err) res.status(400).json({
            err:err,
            "status" : false
        });
        res.status(200).json({
            "message" : "Successfully Logged Out.",
            "status" : true
        });
    });

});

app.post('/api/uploadRecord', function (req, res) {
    const dataToUpload = new QuestionAnswer(req.body);
    dataToUpload.save(function (err, response) {
        if (err) return cb(err);
        if (response) return res.status(200).json({
            message: 'Successfully Uploaded the record.',
            successID: response._id
        })
        cb(null, res);
    })
})
// app.get('/api/getAllRecord', function (req, res) {
//     QuestionAnswer.find(function (err, response) {
//         if (err) return res.status(200).json({
//             message: 'Error in fetching the records.'
//         });
//         if (response) return res.status(200).json({
//             message: 'Successfully Fetched the record.',
//             successData: response
//         })
//     })
// })
app.get('/api/getAllRecord',auth, function (req, res) {
    if(!req.user.isAdmin) {
        return res.status(200).json({
            message: 'Please Login as Admin to get All records',
            allow : false
        });
    }
    User.find(function (err, response) {
        if (err) return res.status(200).json({
            message: 'Error in fetching the records.'
        });
        if (response) return res.status(200).json({
            message: 'Successfully Fetched the record.',
            successData: response
        })
    })
})
app.post('/api/deleteARecord',auth, function (req, res) {
    if(!req.user.isAdmin) {
        return res.status(200).json({
            message: 'Please Login as Admin to Delete the record',
            allow : false
        });
    }
    var payload = {_id : req.body._id}
    User.deleteOne(payload,function (err, response) {
        if (err) return res.status(200).json({
            message: 'Error in deleting the record.'
        });
        if (response) return res.status(200).json({
            message: 'Successfully Deleted the record.',
            successData: response
        })
    })
})
app.post('/api/updateARecord',auth, function (req, res) {
    if(!req.user.isAdmin) {
        return res.status(200).json({
            message: 'Please Login as Admin to update the record',
            allow : false
        });
    }
    var payload = {
        _id: req.body._id
    }
    var newAnswer = {
        $set: {
            userName: req.body.userName,
            email: req.body.email,
            phone: req.body.phone,
            dob: req.body.dob,
            role: req.body.role,
            isAdmin: req.body.role==1 ? true : false,
        }
    };
    User.updateOne(payload, newAnswer, function (err, response) {
        if (err) return res.status(200).json({
            message: 'Error in updating the record.',
            error: err,
        });
        if (response) {
            if (response.n > 0 ) {
                return res.status(200).json({
                    message: 'Successfully updated the record.',
                    successData: response
                })
            } else if (response.n == 0 ) {
                return res.status(200).json({
                    message: 'Record not found.',
                    successData: response
                })
            }
        }

    })
})

// listening port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`app is live at ${PORT}`);
});