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

module.exports = User;
