// utils/cpanel.js
const axios = require("axios");
const mysql = require("mysql2/promise");

const CPANEL_HOST = process.env.CPANEL_HOST;
const CPANEL_USER = process.env.CPANEL_USER;
const CPANEL_PASS = process.env.CPANEL_PASS;

// Generic cPanel API call function
async function callCpanelAPI(module, functionName, params = {}) {
    const urlParams = new URLSearchParams(params).toString();

    try {
        const response = await axios.get(
            `${CPANEL_HOST}/execute/${module}/${functionName}?${urlParams}`,
            {
                auth: {
                    username: CPANEL_USER,
                    password: CPANEL_PASS,
                },
            }
        );

        if (response.data.status !== 1) {
            throw new Error(response.data.errors?.join(", ") || "cPanel API failed");
        }

        return response.data;
    } catch (err) {
        throw new Error(
            err.response?.data?.errors?.join(", ") || err.message || "cPanel API error"
        );
    }
}

// Create MySQL Database
async function createDatabase(dbName) {
    const fullDBName = `${CPANEL_USER}_${dbName}`;
    const dbUser = `${fullDBName}`; // or any user naming convention
    const dbPass = 'StrongPass#123';     // must meet cPanel password requirements

    // 1️⃣ Create database
    await callCpanelAPI("Mysql", "create_database", { name: fullDBName });

    // 2️⃣ Create user
    await callCpanelAPI("Mysql", "create_user", { name: dbUser, password: dbPass });

    // 3️⃣ Set privileges
    await callCpanelAPI("Mysql", "set_privileges_on_database", {
    user: dbUser,
    database: fullDBName,
    privileges: "ALL PRIVILEGES",
    allow_whm_access: 1
});

}




// Run SQL Query inside a database using direct MySQL connection
async function runSQLQuery(database, user, password, query) {
    const connection = await mysql.createConnection({
        host: 'localhost',  
        port: '3306',  
        user,
        password,
        database
    });

    console.log(connection)
    
    const [results] = await connection.execute(query);
    await connection.end();
    return results;
}




module.exports = {
    createDatabase,
    runSQLQuery
};
