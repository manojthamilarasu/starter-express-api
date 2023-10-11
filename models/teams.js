let { addTeam } = require('../database/firebase')

async function saveTeam(data) {
    await addTeam(data)
    return { created: true }
}

module.exports = {
    saveTeam
}