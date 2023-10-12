const express = require('express');
const router = express.Router();

const { saveMatchResults, addTeamToDB, getTeamsByTournaments } = require('../models/teams')



router.post('/add-match-result', async (req, res) => {
    try {
        let data = req.body;
        let response = await saveMatchResults(data);
        return res.status(200).send({ success:true, data: response });
    } catch (error) {
        res.status(500).send({ error });
    }

});

router.post('/add-teams', async (req, res) => {
    try {
        let data = req.body;
        let response = await addTeamToDB(data);
        return res.status(200).send({ success: true, data: response });
    } catch (error) {
        res.status(500).send({ error });
    }
});

router.post('/get-teams', async (req, res) => {
    try {
        let data = req.body;
        let response = await getTeamsByTournaments(data);
        return res.status(200).send({ success: true, data: response });
    } catch (error) {
        res.status(500).send({ error });
    }
});



module.exports = router;