const express = require('express');
const router = express.Router();

const { userLogin } = require('../models/login')

router.post('/user', async (req, res) => {
    try {
        // get username and password from request
        // get the username data from firebase and match the password
        // password encryption can be done later
        let data = req.body;
        const userName = data.userName;
        const password = data.password;
        let response = await userLogin(userName, password);
        return res.status(200).send({ success: true, data: response });
        // get from firebase for this username;
    } catch (error) {
        res.status(500).send({ error });
    }

});



router.post('/add-team', async (req, res) => {
    try {
        // get username and password from request
        // get the username data from firebase and match the password
        // password encryption can be done later
        let data = req.body;

        return res.status(200).send({ data: response });
        // get from firebase for this username;
    } catch (error) {
        res.status(500).send({ error });
    }

});



module.exports = router;