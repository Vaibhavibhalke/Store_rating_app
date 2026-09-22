const crypto = require('crypto');

// Generate a secure random JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('Generated JWT Secret:');
console.log(jwtSecret);
console.log('\nCopy this and paste it into your .env file as JWT_SECRET');
