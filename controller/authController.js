const { default: axios } = require('axios');
const jwt = require('jsonwebtoken');
const getDBCollection = require('../util/getDBCollection');
require('dotenv').config();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

const getGithubUserEmail = async (code) => {
  const githubToken = await axios.post(
    `https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`
  );

  const params = new URLSearchParams(githubToken.data);
  const accessToken = params.get('access_token');

  try {
    const githubUserEmail = await axios.get(
      `https://api.github.com/user/emails`,
      {
        headers: { Authorization: `bearer ${accessToken}` },
      }
    );
    return githubUserEmail.data;
  } catch (error) {
    console.log(error.message);
  }
};

const githubAuth = async (req, res, next) => {
  const { path, code } = req.query;
  const DB = getDBCollection(req);

  if (!path || !code) {
    throw new Error('Missing query params');
  }

  // get the github user
  const userEmails = await getGithubUserEmail(code);
  const userEmail = userEmails.find((email) => email.primary).email;

  // check the db for the user, if not exist then create a new user
  try {
    await DB.updateOne(
      { email: userEmail },
      { $set: { email: userEmail } },
      { upsert: true }
    );

    // set the cookie with jwt token
    const token = jwt.sign(userEmail, JWT_SECRET);
    res.cookie('jwt_secret', token, {
      httpOnly: true,
      domain: 'localhost',
    });
  } catch (error) {
    console.log(error.message);
  } finally {
    res.redirect(`http://localhost:3000${path}`);
  }
};

const checkUser = async (req, res, next) => {
  const userEmail = req.userEmail;
  res.json({ userEmail });
};

const logout = async (req, res, next) => {
  console.log('logout backend');
  res.clearCookie('jwt_secret');
  res.json({ message: 'logout success' });
};

module.exports = { githubAuth, checkUser, logout };
