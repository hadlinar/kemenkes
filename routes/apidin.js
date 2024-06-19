const express = require("express")
const router = express.Router()
const Login = require("../controller/Login")
const TRN = require("../controller/GetTrn")
const moment = require('moment-timezone')
const GetTrn = require("../controller/GetTrn")
const axios = require('axios')

router.post('/kemenkes/transaksi/:valdate', async (req,res) => {
    let valdate = req.params.valdate

    try {
        const token = await new Login().loginAPIDIN()
        const data = await new TRN().getTrn(valdate)
        var objData
        var listObj = []
        let delay = 0

        

        data.rows.forEach((e) => {

            objData = {
                "doc_num": e[0],
                "ref_num": e[1].toString().toLowerCase(),
                "code": e[2],
                "line": e[3].toString().toLowerCase(),
                "line_ref": e[4].toString().toLowerCase(),
                "sumber_dana": e[5].toString().toLowerCase(),
                "biaya_transport": e[6],
                "total_transaksi": e[7],
                "pengirim": {
                    "type": e[8].toString().toLowerCase(),
                    "kode": e[9],
                    "nama": e[10],
                    "alamat": e[11],
                    "kodepos": e[12] ?? "",
                    "provinsi": e[13] ?? "",
                    "provinsi_id": e[14] ?? "",
                    "kabkota": e[15] ?? "",
                    "kabkota_id": e[16] ?? "",
                    "kecamatan": e[17] ?? "",
                    "kecamatan_id": e[18] ?? "",
                    "kelurahan": e[19] ?? "",
                    "kelurahan_id": e[20] ?? "",
                },
                "penerima": {
                    "type": e[21].toString().toLowerCase(),
                    "kode": e[22],
                    "nama": e[23],
                    "alamat": e[24],
                    "kodepos": e[25] ?? "",
                    "provinsi": e[26] ?? "",
                    "provinsi_id": e[27] ?? "",
                    "kabkota": e[28] ?? "",
                    "kabkota_id": e[29] ?? "",
                    "kecamatan": e[30] ?? "",
                    "kecamatan_id": e[31] ?? "",
                    "kelurahan": e[32] ?? "",
                    "kelurahan_id": e[33] ?? "",
                },
                "note": e[34],
                "created_by": e[35],
                "updated_by": e[36],
                "created_at": moment.utc(e[37], "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ").tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
                "updated_at": moment.utc(e[38], "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ").tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
                "data": [
                    {
                        "lot_no": e[39],
                        "tgl_kadaluarsa": moment.utc(e[40], "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ").tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
                        "tgl_produksi": moment.utc(e[41], "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ").tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
                        "product_name": e[42],
                        "kfa_code": e[43] ?? "",
                        "qty": e[44],
                        "unit": e[45],
                        "unit_price": e[46],
                        "total_price": e[47],
                        "note": e[48] ?? null,
                    }
                ]
            }

            listObj.push(objData)
        })

        listObj.forEach((e) => {
            // console.log(JSON.stringify(e))
            setTimeout(async () => {
            //     // new GetTrn().postToApidin(token['data']['access_token'], e)
            //     try {
                // console.log(JSON.stringify(e))
                    // axios.post('http://apidin.jalak.id/v1/ship/notification?server=staging', JSON.stringify(e), {
                    //     headers: {
                    //         'Authorization': `Bearer ${token['data']['access_token']}`,
                    //         'Content-Type': 'application/json'
                    //     },
                    //     params: {
                    //         'server': 'staging'
                    //     }
                    // })
            //     } catch (e) {
            //         // console.log(e)
            //         res.status(500).json({"error": e})
            //     }
            }, 1000 + delay)
            delay += 1000
        })

        
    } catch(e) {
        
        console.log("apa masuk sini")
        // console.log(e)
    }

})

module.exports = router