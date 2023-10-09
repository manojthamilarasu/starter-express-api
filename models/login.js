
const { getUserCredentials} = require('../database/firebase')

async function userLogin(userName, password) {
    try {
        let data = await getUserCredentials(userName);
        if (data.password === password) {
            return true;
        }
        return false;
    } catch (error) {
        throw error;
    }

}


module.exports = {
    userLogin
}