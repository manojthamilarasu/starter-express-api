const express = require('express');
const app = express();
const port = 4000;
const cookieParser = require('cookie-parser');
const loginRoutes = require('./routes/login')

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use('/login', loginRoutes);

app.get('/health-check', (req, res) => {
  res.send('LeaderBoard Backend is fine');
});

app.listen(port, () => {
  console.log(` App listening at ${port}`);
});
