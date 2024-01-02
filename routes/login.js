const User = require('../lib/user');

exports.form = function (req, res){
  res.render('login', { title: 'Login' });
}

exports.submit = function(req, res, next) {
  const data = req.body.user;
  
  User.authenticate(data.name, data.pass, (err, user) => {
    if(err) return next(err);
    if(user) {
      req.session.uid = user.id;
      res.redirect('/');
    } else {
      res.error('Sorry! invalid credentials.');
      res.redirect('error');
    }
  })
}

exports.logout = function(req, res) {
  req.session.destory((err) => {
    if(err) throw err;
    res.redirect('/');
  })
}