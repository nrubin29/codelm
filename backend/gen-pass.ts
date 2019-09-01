import crypto = require('crypto');

process.stdin.once('data', data => {
  const password = data.toString().trim();
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, new Buffer(salt), 1000, 64, 'sha512').toString('hex');

  console.log(`Salt: ${salt}`);
  console.log(`Hash: ${hash}`);
});