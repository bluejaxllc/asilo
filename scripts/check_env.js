console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('DIRECT_URL:', process.env.DIRECT_URL ? 'SET' : 'NOT SET');
console.log('AUTH_SECRET:', process.env.AUTH_SECRET ? 'SET' : 'NOT SET');

if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL length:', process.env.DATABASE_URL.length);
}
if (process.env.DIRECT_URL) {
    console.log('DIRECT_URL length:', process.env.DIRECT_URL.length);
}
