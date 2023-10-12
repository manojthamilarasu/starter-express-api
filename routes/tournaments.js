const express = require('express');
const router = express.Router();

const { getTournaments, getTournamentMatches } = require('../models/tournaments')



router.get('/all', async (req, res) => {
    try {
        // get username and password from request
        // get the username data from firebase and match the password
        // password encryption can be done later
        let response = await getTournaments();
        return res.status(200).send({ success:true, data: response });
        // get from firebase for this username;
    } catch (error) {
        res.status(500).send({ error });
    }
});

router.get('/all-matches', async (req, res) => {
    try {
        // get username and password from request
        // get the username data from firebase and match the password
        // password encryption can be done later
        let body = req.body
        let response = await getTournamentMatches(body.tournamentId);
        return res.status(200).send({ success: true, data: response });
        // get from firebase for this username;
    } catch (error) {
        console.log(error)
        res.status(500).send({ error });
    }
});



module.exports = router;