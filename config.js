var ENV_AUTH_SECRET = process.env.AUTH_SECRET;
var ENV_NODE_STAGE = process.env.NODE_STAGE; 
var ENV_DB_CONNECTIONSTRING = process.env.DB_CONNECTIONSTRING;
 

if (ENV_NODE_STAGE == "production") {
    module.exports = {
        "secret": ENV_AUTH_SECRET,//"23783350655efe9951cc2104e6a597f1",
        "connectionString": ENV_DB_CONNECTIONSTRING,//"mongodb://tris:Standar123@ds017231.mlab.com:17231/auth",
        "env": process.env
    }
}
else {
    module.exports = {
        "secret": "23783350655efe9951cc2104e6a597f1",
        "connectionString": "mongodb://tris:Standar123@ds017231.mlab.com:17231/auth",
        "env": process.env
    }
}