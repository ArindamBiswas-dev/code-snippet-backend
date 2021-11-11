const cookieParser = require('cookie-parser');
const express = require('express');
const createError = require('http-errors');
const morgan = require('morgan');
var cors = require('cors');
const { MongoClient } = require('mongodb');
const checkAuth = require('./middleware/checkAuth');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

const MONGODB_CONNECTION_URI = process.env.MONGODB_CONNECTION_URI;
const client = new MongoClient(MONGODB_CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/api', checkAuth, require('./routes/api.route'));
app.use('/auth', require('./routes/auth.route'));

// page not found
app.use((req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
  });
});

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await client.connect();
    app.locals.db = client.db('code-snippet');
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
  } catch (error) {
    console.log(error);
    client.close();
  }
}
start();
