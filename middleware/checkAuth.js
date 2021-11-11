const jwt = require('jsonwebtoken');
const getDBCollection = require('../util/getDBCollection');

async function checkAuth(req, res, next) {
  const cookie = req.cookies.jwt_secret;
  const DB = getDBCollection(req);
  try {
    const decodedString = jwt.verify(cookie, process.env.JWT_SECRET);

    // check the user in the database if user exist then set a local in req as userEmail else throw error

    const checkEmail = await DB.findOne({ email: decodedString });
    console.log(checkEmail);

    if (!checkEmail) {
      throw new Error('user not found');
    }

    req.userEmail = decodedString;
    next();
  } catch (error) {
    console.log(error.message);
    res.send({
      status: error.status || 500,
      message: error.message,
    });
  }
}

module.exports = checkAuth;
