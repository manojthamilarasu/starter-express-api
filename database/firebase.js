const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, getDoc } =  require('firebase/firestore/lite')

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

module.exports = {
    getUserCredentials
}