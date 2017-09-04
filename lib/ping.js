function ping(args, done) {
  done(null, { status: 'ok' });
}

module.exports = ping;
