const express = require('express');
const app = express();
const port = 8081;
const cookieParser = require('cookie-parser');
const loginRoutes = require('./routes/login')
const teamRoutes = require('./routes/teams')
const tournaments = require('./routes/tournaments')
const cors = require('cors');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use('/login', loginRoutes);
app.use('/team', teamRoutes);
app.use('/tournament', tournaments);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/health-check', (req, res) => {
  res.send('LeaderBoard Backend is fine');
});

app.listen(port, () => {
  console.log(` App listening at ${port}`);
});
