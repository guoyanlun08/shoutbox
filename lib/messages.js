const express = require('express');
const res = express.response;

res.message = function(msg, typeParam) {
    const type = typeParam || 'info';
    const sess = this.req.session;
    sess.messages = sess.messages || [];
    sess.messages.push({ type, string: msg });
}

res.error = function(msg) {
    return this.message(msg, 'error');
}

module.exports = function(req, res, next) {
    res.locals.messages = req.session.messages || [];
    res.locals.removeMessages = () => {
        req.session.messages = [];
    };
    next();
}