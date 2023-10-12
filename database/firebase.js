const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, getDoc, doc, setDoc, refEqual } = require('firebase/firestore')
const { v4: uuidv4 } = require('uuid');

const firebaseConfig = {
    apiKey: "AIzaSyDqT4k-JYWf_USPqIZkblHN5GL67HmR_rU",
    authDomain: "awesome-project-ba184.firebaseapp.com",
    projectId: "awesome-project-ba184",
    storageBucket: "awesome-project-ba184.appspot.com",
    messagingSenderId: "878156257038",
    appId: "1:878156257038:web:025d655c6e4a8252e2e95f",
    measurementId: "G-SV6F7WR1YT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


async function getUserCredentials(userName) {
    const users = collection(db, 'user_credentials');
    const q = query(users, where("username", "==", userName));
    const userVal = await getDocs(q);
    const userlist = userVal.docs.map(doc => doc.data());
    console.log(userlist);
    if (userlist.length > 0) {
        return userlist[0];
    }

}

async function addMatchResults(data) {
    try {
        const id = uuidv4()
        const teams = doc(db, "match_results", id);
        await setDoc(teams, data);
    } catch (err) {
        throw err
    }
}

async function getAllTournaments() {
    try {
        const tournaments = collection(db, 'tournaments');
        const allTournaments = await getDocs(tournaments);
        const list = allTournaments.docs.map(doc => doc.data());
        if (list.length > 0) {
            return list
        }
        return [];
    } catch (err) {
        throw err;
    }
}

async function addTeam(data) {
    try {
        const id = uuidv4()
        const teams = doc(db, "teams", id);
        data.id = id;
        await setDoc(teams, data);
    } catch (error) {
        throw error;
    }
}

async function getAllTeamsByTournament(tournamentId) {
    try {
        const users = collection(db, 'teams');
        const q = query(users, where("tournamentId", "==", tournamentId));
        const teamVal = await getDocs(q);
        const teamList = teamVal.docs.map(doc => doc.data());
        console.log(teamList);
        if (teamList.length > 0) {
            return teamList;
        }
        return []
        
    } catch (error) {
        throw error
    }
}

module.exports = {
    getUserCredentials,
    addMatchResults,
    getAllTournaments,
    addTeam,
    getAllTeamsByTournament
}