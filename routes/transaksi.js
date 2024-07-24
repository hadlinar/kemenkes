const express = require("express")
const router = express.Router()
const Login = require("../controller/Login")
const TRN = require("../controller/GetTrn")
const moment = require('moment-timezone')
const GetTrn = require("../controller/GetTrn")
const axios = require('axios')
const { stringify } = require("qs")

router.post('/kemenkes/transaksi', async (req,res) => {
    let docNum = req.query.docNum
    let lot = req.query.lot

    try {
        const token = await new Login().login()
        const data = await new TRN().getTrn(docNum, lot)
        const temp = []
        var objData
        var listObj = []
        let delay = 0
        let isUpdated = false

        data.rows.forEach((e) => {
            objData = {
                "doc_num": e[0],
                "ref_num": e[1].toString().toLowerCase(),
                "code": e[2],
                "line": e[3].toString().toLowerCase(),
                "line_ref": e[4].toString().toLowerCase(),
                "sumber_dana": e[5].toString().toLowerCase(),
                "biaya_transport": e[6] ?? 0,
                "total_transaksi": e[7] ?? 0,
                "pengirim": {
                    "type": e[8].toString().toLowerCase() ?? "",
                    "kode": e[9] ?? "",
                    "nama": e[10] ?? "",
                    "alamat": e[11] ?? "",
                    "kodepos": e[12] ?? "",
                    "provinsi": e[13] ?? "",
                    "provinsi_code": e[14] ?? "",
                    "kabkota": e[15] ?? "",
                    "kabkota_code": e[16] ?? "",
                    "kecamatan": e[17] ?? "",
                    "kecamatan_code": e[18] ?? "",
                    "kelurahan": e[19] ?? "",
                    "kelurahan_code": e[20] ?? "",
                },
                "penerima": {
                    "type": e[21].toString().toLowerCase() ?? "",
                    "kode": e[22] ?? "",
                    "nama": e[23] ?? "",
                    "alamat": e[24] ?? "",
                    "kodepos": e[25] ?? "",
                    "provinsi": e[26] ?? "",
                    "provinsi_code": e[27] ?? "",
                    "kabkota": e[28] ?? "",
                    "kabkota_code": e[29] ?? "",
                    "kecamatan": e[30] ?? "",
                    "kecamatan_code": e[31] ?? "",
                    "kelurahan": e[32] ?? "",
                    "kelurahan_code": e[33] ?? "",
                },
                "note": e[34] ?? "",
                "created_by": e[35] ?? "",
                "updated_by": e[36] ?? "",
                "tanggal_transaksi": moment.utc(e[37], "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ").tz("Asia/Jakarta").format("YYYY-MM-DD") ?? "",
                "updated_at": moment.utc(e[38], "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ").tz("Asia/Jakarta").format("YYYY-MM-DD") ?? "",
                "data": [
                    {
                        "lot_no": e[39],
                        "tgl_kadaluarsa": moment.utc(e[40], "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ").tz("Asia/Jakarta").format("YYYY-MM-DD") ?? "",
                        "tgl_produksi": moment.utc(e[41], "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ").tz("Asia/Jakarta").format("YYYY-MM-DD") ?? "",
                        "product_name": e[42] ?? "",
                        "kfa_code": e[43] ?? "",
                        "qty": e[44] ?? 0,
                        "unit": e[45] ?? "",
                        "unit_price": e[46] ?? 0,
                        "total_price": e[47] ?? 0,
                        "note": e[48] ?? "",
                    }
                ]
            }
            listObj.push(objData)
        })

        const processAndUpdate = async () => {
            const mergedData = listObj.reduce((acc, item) => {
                const key = item.doc_num
                if (!acc[key]) {
                    acc[key] = {
                        ...item,
                        data: [...item.data]
                    }
                } else {
                    acc[key].data = [...acc[key].data, ...item.data]
                }
                return acc
            }, {})
        
            const firstDocNum = Object.values(mergedData)[0]?.doc_num
            if (firstDocNum) {
                await new TRN().updateDB(firstDocNum)
                // console.log(Object.values(mergedData)[0])
        
                axios.post('https://api-satusehat-stg.dto.kemkes.go.id/ssl/v1/ssl/din/ship/notification', JSON.stringify(Object.values(mergedData)[0]), {
                    headers: {
                        'Authorization': `Bearer ${token['data']['access_token']}`,
                        'Content-Type': 'application/json'
                    },
                })
                .then(res => {
                    console.log(res.data)
                })
                .catch(e => {
                    console.log(e)
                })
        
                isUpdated = true
            }
        }
        
        listObj.forEach((e, index) => {
            if (!isUpdated) {
                setTimeout(async () => {
                    if (!isUpdated) { 
                        await processAndUpdate()
                    }
                }, 1000 + delay)
                delay += 1000
            }
        })

        
    } catch(e) {
        console.log(e)
    }

})

module.exports = router