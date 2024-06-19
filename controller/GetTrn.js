const db = require('../config/db')
const oracledb = require('oracledb')
const axios = require('axios')

class GetTrn {
    async getTrn(valdate) {
        let connection
        var result

        let query = `SELECT * FROM TRN_KEMENKES_DEV WHERE VAL_DATE = TO_DATE('${valdate}', 'DD/MM/YYYY')`

        try {
            connection = await oracledb.getConnection(db.oracle)
    
            result = await connection.execute(query)

            return result
        } catch (err) {
            console.error(err.message);
        } finally {
            if (connection) {
                try {
                await connection.close();
                } catch (err) {
                console.error(err.message);
                }
            }
        }
    }

    async postToApidin(token, body){
        try {
            axios.post('http://apidin.jalak.id/v1/ship/notification?server=staging', body, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    'server': 'staging'
                }
            }).then(json => {
                console.log("masuk then json")
                // console.log(json)
            })
        } catch (e) {
            console.log("masuk error")
            // res.status(500).json({e: e})
        }
    }
}

module.exports = GetTrn