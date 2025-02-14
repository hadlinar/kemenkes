const db = require('../config/db')
const oracledb = require('oracledb')
const axios = require('axios')

class GetTrn {
    async getTrn(docNum, lot, dari, sampai) {
        let connection
        var result

        let query

        if( dari !== undefined && sampai !== undefined) {
            console.log(dari, sampai)
            if(docNum === "" && lot !== "") {
                query = `SELECT * FROM TRN_KEMENKES WHERE PENGIRIM_KODE IS NOT NULL AND PENERIMA_KODE IS NOT NULL AND KFA_CODE IS NOT NULL AND FLG_EXPORT = 'N' AND LOT_NO = '${lot} AND VAL_DATE BETWEEN TO_DATE('${dari}', 'YYYY-MM-DD') AND TO_DATE('${sampai}', 'YYYY-MM-DD')`
            } if (lot === "" && docNum !== "") {
                query = `SELECT * FROM TRN_KEMENKES WHERE PENGIRIM_KODE IS NOT NULL AND PENERIMA_KODE IS NOT NULL AND KFA_CODE IS NOT NULL AND FLG_EXPORT = 'N' AND DOC_NUM = '${docNum}' AND VAL_DATE BETWEEN TO_DATE('${dari}', 'YYYY-MM-DD') AND TO_DATE('${sampai}', 'YYYY-MM-DD') ORDER BY DOC_NUM `
            } if (lot === "" && docNum === "") {
                query = `SELECT * FROM TRN_KEMENKES WHERE PENGIRIM_KODE IS NOT NULL AND PENERIMA_KODE IS NOT NULL AND KFA_CODE IS NOT NULL AND FLG_EXPORT = 'N' AND VAL_DATE BETWEEN TO_DATE('${dari}', 'YYYY-MM-DD') AND TO_DATE('${sampai}', 'YYYY-MM-DD') ORDER BY DOC_NUM`
            } if (lot !== "" && docNum !== "") {
                query = `SELECT * FROM TRN_KEMENKES WHERE PENGIRIM_KODE IS NOT NULL AND PENERIMA_KODE IS NOT NULL AND KFA_CODE IS NOT NULL AND FLG_EXPORT = 'N' AND LOT_NO = '${lot} AND DOC_NUM = '${docNum}' AND VAL_DATE BETWEEN TO_DATE('${dari}', 'YYYY-MM-DD') AND TO_DATE('${sampai}', 'YYYY-MM-DD') `
            }
        } else {
            if(docNum === "" && lot !== "") {
                query = `SELECT * FROM TRN_KEMENKES WHERE PENGIRIM_KODE IS NOT NULL AND PENERIMA_KODE IS NOT NULL AND KFA_CODE IS NOT NULL AND FLG_EXPORT = 'N' AND LOT_NO = '${lot}`
            } if (lot === "" && docNum !== "") {
                query = `SELECT * FROM TRN_KEMENKES WHERE PENGIRIM_KODE IS NOT NULL AND PENERIMA_KODE IS NOT NULL AND KFA_CODE IS NOT NULL AND FLG_EXPORT = 'N' AND DOC_NUM = '${docNum}' ORDER BY DOC_NUM `
            } if (lot === "" && docNum === "") {
                query = `SELECT * FROM TRN_KEMENKES WHERE PENGIRIM_KODE IS NOT NULL AND PENERIMA_KODE IS NOT NULL AND KFA_CODE IS NOT NULL AND FLG_EXPORT = 'N' AND VAL_DATE = TRUNC(SYSDATE - 2) ORDER BY DOC_NUM`
            } if (lot !== "" && docNum !== "") {
                query = `SELECT * FROM TRN_KEMENKES WHERE PENGIRIM_KODE IS NOT NULL AND PENERIMA_KODE IS NOT NULL AND KFA_CODE IS NOT NULL AND FLG_EXPORT = 'N' AND LOT_NO = '${lot} AND DOC_NUM = '${docNum}'`
            }
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

    async updateDB(docNum, status, message) {
        let connection
        var result

        let query = `UPDATE TRN_KEMENKES SET FLG_EXPORT = ${status === '201' || status === '207' ? `'Y'` : `'N'`}, 
                     EXPORT_STATUS = '${status}',
                     EXPORT_MESSAGE = '${message}',
                     EXPORT_DATE = SYSDATE
                     WHERE DOC_NUM = '${docNum}'`

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
                timeout: 60000
            }).then(json => {
                console.log(json)
            })
        } catch (e) {
            res.status(500).json({e: e})
        }
    }
}

module.exports = GetTrn