const bcrypt = require('bcryptjs');

const password = 'Admin@123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
  } else {
    console.log('Password hash for Admin@123:');
    console.log(hash);
    console.log('\nUse this hash in your database schema.sql file');
  }
});
