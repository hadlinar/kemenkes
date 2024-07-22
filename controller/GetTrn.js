const db = require('../config/db')
const oracledb = require('oracledb')
const axios = require('axios')

class GetTrn {
    async getTrn(docNum, lot) {
        let connection
        var result

        let query

        if(docNum === "" && lot !== "") {
            query = `SELECT * FROM TRN_KEMENKES_DEV WHERE PENGIRIM_KODE IS NOT NULL AND PENERIMA_KODE IS NOT NULL AND KFA_CODE IS NOT NULL AND LOT_NO = '${lot}`
        } if (lot === "" && docNum !== "") {
            console.log("test")
            query = `SELECT * FROM TRN_KEMENKES_DEV WHERE PENGIRIM_KODE IS NOT NULL AND PENERIMA_KODE IS NOT NULL AND KFA_CODE IS NOT NULL AND DOC_NUM = '${docNum}'`
        } if (lot === "" && docNum === "") {
            query = `SELECT * FROM TRN_KEMENKES_DEV WHERE PENGIRIM_KODE IS NOT NULL AND PENERIMA_KODE IS NOT NULL AND KFA_CODE IS NOT NULL`
        } if (lot !== "" && docNum !== "") {
            query = `SELECT * FROM TRN_KEMENKES_DEV WHERE PENGIRIM_KODE IS NOT NULL AND PENERIMA_KODE IS NOT NULL AND KFA_CODE IS NOT NULL AND DOC_NUM = '${docNum}' AND LOT_NO = '${lot}'}`
        }
        console.log(query)
        try {
            connection = await oracledb.getConnection(db.oracle)

            result = await connection.execute(query)
            console.log(result)
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

    async postTransaksi(token, body){
        try {
            axios.post('https://api-satusehat-stg.dto.kemkes.go.id/ssl/v1/ssl/din/ship/notification', body, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            }).then(json => {
                // console.log("masuk then json")
                console.log(json)
            })
        } catch (e) {
            res.status(500).json({e: e})
        }
    }
}

module.exports = GetTrn