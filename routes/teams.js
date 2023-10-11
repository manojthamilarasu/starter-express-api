const express = require('express');
const router = express.Router();

const { saveTeam } = require('../models/teams')



router.post('/add-match-result', async (req, res) => {
    try {
        // get username and password from request
        // get the username data from firebase and match the password
        // password encryption can be done later
        let data = req.body;
        let response = await saveTeam(data);
        return res.status(200).send({ sucess:true, data: response });
        // get from firebase for this username;
    } catch (error) {
        res.status(500).send({ error });
    }

});



module.exports = router;