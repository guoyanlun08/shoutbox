const User = require('../lib/user');

exports.form = (req, res) => {
  res.render('register', { title: 'Register' });
}

exports.submit = function(eq, res, next) {
  const data = req.body.user;
  User.getByName(data.name, (err, user) => {
    if(err) return next(err);
    if(user.id) {
      res.error('Username already taken');
      res.redirect('back');
    } else {
      user = new User({
        name: data.name,
        pass: data.pass,
      });

      User.save((err) => {
        if(err) return next(err);
        req.session.uid = user.id;
        res.redirect('/')
      })
    }
  })
}