const redis = require('redis');
const bcrypt = require('bcrypt');
const db = redis.createClient();

function User(obj) {
  for(const key in obj) {
    this[key] = obj[key];
  }
}

User.prototype.update = function(fn) {
  const { id } = this;
  db.set(`user:id:${this.name}`, id, (err) => {
    if(err) return fn(err);
    db.hmset(`user:${id}`, this, (err) => {
      fn(err);
    });
  });
};

User.prototype.hashPassword = function(fn) {
  bcrypt.genSalt(12, (err, salt) => {
    if(err) return fn(err);
    this.salt = salt;
    bcrypt.hash(this.pass, salt, (err, hash) => {
      if(err) return fn(err);
      this.pass = hash;
      fn();
    })
  })
}

User.prototype.save = function (fn) {
  if(this.id) {
    this.update(fn)
  } else {
    db.incr('user:ids', (err, id) => {
      if(err) return fn(err);
      this.id = id;
      this.hashPassword((err) => {
        if(err) return fn(err);
        this.update(fn);
      })
    })
  }
}

User.getByName = function(name, fn) {
  User.getId(name, (err, id) => {
    if(err) return fn(err);
    User.get(id, fn);
  })
}

User.getId = function(name, fn) {
  db.get(`user:id:${name}`, fn);
}

User.get = function(id, fn) {
  db.hgetall(`user:${id}`, (err, user) => {
    if(err) return fn(err);
    fn(null, new User(user));
  })
}

User.authenticate = function(name, pass, fn) {
  User.getByName(name, (err, user) => {
    if(err) return fn(err);
    if(!user.id) return fn();
    bcrypt.hash(pass, user.salt, (err, hash) => {
      if(err) return fn(err);
      if(hash == user.pass) return fn(null, user);
      fn();
    })
  })
}

module.exports = User;
