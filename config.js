var ENV_AUTH_SECRET = process.env.AUTH_SECRET;
var ENV_DB_CONNECTIONSTRING = process.env.DB_CONNECTIONSTRING;

module.exports = {
    "secret": ENV_AUTH_SECRET,
    "connectionString": ENV_DB_CONNECTIONSTRING,
    "env": process.env
} 