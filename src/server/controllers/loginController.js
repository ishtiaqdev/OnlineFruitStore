const express = require('express'),
      router  = express.Router(),
      jwt     = require('jsonwebtoken');

// Models
var Users = require('../models/user.model.js');

// // POST request for authenticating of user.
router.post('/auth', (req, res) => {
    // authenticate - public
    Users.find({ username: req.body.username, password: req.body.password }, (err, user) => {
        if(user.length > 0)
        {
            let token = jwt.sign({userID: user[0].id, username: user[0].username}, 'fruit-store-secret', {expiresIn: '2h'});
            return res.json({
                id: user[0].id,
                username: user[0].username,
                firstName: user[0].firstName,
                lastName: user[0].lastName,
                token: token
            });
        }
        else {
            return res.json('Username or password is incorrect');
        }
    });
});

router.post('/signup', signUpUser);

async function signUpUser(req, res) {
    try {
        let maxUserId = await getMaxUserIdAsync();
        let userid = 0;
        Users.find({ username: req.body.username }, (err, userDoc) => {
            if(!err) {
                if(userDoc) {
                    if(userDoc.length == 0)
                    {
                        if(maxUserId != null && maxUserId != undefined)
                        userid = (!isNaN(parseInt(maxUserId)) ? parseInt(maxUserId) : 0);
                        let user = new Users({ 
                            id: (userid != 0 ? ++userid : 1),
                            firstName: req.body.firstname, 
                            lastName: req.body.lastname, 
                            username: req.body.username, 
                            password: req.body.password 
                        });
                        user.save((err, docs) => {
                            if (err){
                                console.log('There is an error while creating new user: ' + err);
                                return res.json('There is an error while creating new user.');
                            } else {
                                console.log("User created successfully.");
                                return res.json('User created successfully.');
                            }
                        });    
                    }
                    else {
                        return res.json('There is an error while creating new user. Username ' + req.body.username + ' already exist in database.' );
                    }
                }
                else {
                    return res.json('There is an error while creating new user. Username ' + req.body.username + ' already exist in database.' );
                }
            }
        });
    }
    catch(e) {
        console.log('There is an exception while adding new user: ' + e);
        return res.json('There is an exception while creating new user.');
    }
}

async function getMaxUserIdAsync() {
    let maxUserData = await Users.aggregate([
        {
            "$group": {
                _id: "$userId" ,
                "maxUserId": { $max: "$id" },
            }
        }
    ]);
    let maxUserId = (maxUserData.length > 0 ? maxUserData[0].maxUserId : 0);
    return maxUserId;
}

module.exports = router;