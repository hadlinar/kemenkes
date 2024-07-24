const db = require('../config/db')
const oracledb = require('oracledb')
const axios = require('axios')

class GetTrn {
    async getTrn(docNum, lot) {
        let connection
        var result

        let query

        if(docNum === "" && lot !== "") {
            query = `SELECT * FROM TRN_KEMENKES WHERE PENGIRIM_KODE IS NOT NULL AND PENERIMA_KODE IS NOT NULL AND KFA_CODE IS NOT NULL AND FLG_EXPORT = 'N' AND LOT_NO = '${lot}`
        } if (lot === "" && docNum !== "") {
            query = `SELECT * FROM TRN_KEMENKES WHERE PENGIRIM_KODE IS NOT NULL AND PENERIMA_KODE IS NOT NULL AND KFA_CODE IS NOT NULL AND FLG_EXPORT = 'N' AND DOC_NUM = '${docNum}'`
        } if (lot === "" && docNum === "") {
            query = `SELECT * FROM TRN_KEMENKES WHERE PENGIRIM_KODE IS NOT NULL AND PENERIMA_KODE IS NOT NULL AND KFA_CODE IS NOT NULL AND FLG_EXPORT = 'N'`
        } if (lot !== "" && docNum !== "") {
            query = `SELECT * FROM TRN_KEMENKES WHERE PENGIRIM_KODE IS NOT NULL AND PENERIMA_KODE IS NOT NULL AND KFA_CODE IS NOT NULL AND FLG_EXPORT = 'N' AND DOC_NUM = '${docNum}' AND LOT_NO = '${lot}'}`
        }
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

    async updateDB(docNum) {
        let connection
        var result

        let query = `UPDATE TRN_KEMENKES SET FLG_EXPORT = 'Y'
                     WHERE doc_num = '${docNum}'`

        try {
            connection = await oracledb.getConnection(db.oracle)

            result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT, autoCommit: true})
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