var express = require('express');
var router = express.Router();
var passport = require('passport');
require('../config/passport')(passport);

router.get('/', ensureAuthenticated, function(req, res)
{
  if(req.user)
  {
    console.log(req.user);
    res.render('index',
  {
    title: 'Memeski',
    user: user
  });
  }
});

function ensureAuthenticated(req, res, next) {

    if (req.isAuthenticated())
        return next();
    else{
        res.redirect('/auth/google')
    }
}

module.exports = router;
