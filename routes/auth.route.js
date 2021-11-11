const {
  githubAuth,
  checkUser,
  logout,
} = require('../controller/authController');
const checkAuth = require('../middleware/checkAuth');
const router = require('express').Router();

router.get('/checkuser', checkAuth, checkUser);
router.get('/github', githubAuth);
router.get('/logout', logout);

module.exports = router;
