const express = require("express");
const router = express.Router();
const passport = require("passport");

//Sessions Controller
const SessionsController = require('../controller/sessionsController.js');
const sessionsController = new SessionsController();

//Logout (cerrar session)
router.get('/logout', sessionsController.logout)
router.get('/logoutFront', sessionsController.logoutFront)

/////PASSPORT/////////
//local
router.post('/login', passport.authenticate('login', {failureRedirect : '/api/sessions/failLogin'}), sessionsController.login)
router.get('/failLogin', sessionsController.failLogin)
router.post('/loginFront', passport.authenticate('login'), sessionsController.loginFront)

//github
router.get('/github', passport.authenticate('github', {scope : ['user:email']}), sessionsController.github)
router.get('/githubcallback', passport.authenticate('github', {failureRedirect : '/loginForm'}), sessionsController.githubcallback)

module.exports = router;