const express = require("express");
const router = express.Router();
const Login = require("../controller/Login");
const Sarana = require("../controller/GetSarana")
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require('../config/db');
const oracledb = require('oracledb');

const diskStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, "./temp"))
    },
    filename: function(req, file, cb) {
        cb(
            null,
            file.originalname
        )
    }
})


router.post(`/kemenkes/get-sarana`, multer({storage: diskStorage}).single('file'), async function(req,res) {
    let file = req.file.path
    var code = []
    // var nie = []
    // var reGet = []
    var connection

    try {
        const list = await new Login().login()
        var data = fs.readFileSync(file)
        var lines = data.toString().split('\r\n').toString()
        var array = lines.split(",")
        var jenisSarana = req.query.jenisSarana
        
        for(i in array) {
            if(array[i].length > 5) {
                code.push(array[i])
            }
        }

        let delay = 0

        code.forEach((kodeSatset) => {
            setTimeout(async () => {
                try{
                    var sarana = await new Sarana().getSarana(list['data']['access_token'], jenisSarana, kodeSatset)

                    // if(sarana['data']['data'][0]['kelurahan']['nama'] === 'null') {
                    //     console.log('1')
                    // } else if(sarana['data']['data'][0]['kelurahan']['nama'] === null) {
                    //     console.log('2')
                    // } else {
                    //     console.log(3)
                    // }

                    let query = `
                        BEGIN
                        INSERT INTO RN.MST_SARANA_KFA(
                            KODE_SATSET,
                            KODE_SARANA,
                            NAMA,
                            JENIS_SARANA,
                            TELP,
                            ALAMAT,
                            PROVINSI,
                            PROVINSI_ID,
                            KABUPATEN_KOTA,
                            KABUPATEN_KOTA_ID,
                            KECAMATAN,
                            KECAMATAN_ID,
                            KELURAHAN,
                            KELURAHAN_ID,
                            STATUS_SARANA,
                            EMAIL,
                            STATUS_AKTIF,
                            UPDATE_DATE
                        ) VALUES (
                            '${sarana['data']['data'][0]['kode_satusehat']}',
                            '${sarana['data']['data'][0]['kode_sarana']}',
                            '${sarana['data']['data'][0]['nama']}',
                            '${sarana['data']['data'][0]['jenis_sarana']['nama']}',
                            '${sarana['data']['data'][0]['telp'] === null ? "" : (sarana['data']['data'][0]['telp'].replace(/[^\w\s]/gi, '') == null ? null : sarana['data']['data'][0]['telp'].replace(/[^\w\s]/gi, ''))}',
                            '${sarana['data']['data'][0]['alamat'] == null ? "" : sarana['data']['data'][0]['alamat']}',
                            '${sarana['data']['data'][0]['provinsi']['nama'] == null ? "" : sarana['data']['data'][0]['provinsi']['nama']}',
                            '${sarana['data']['data'][0]['provinsi']['kode'] == null ? "" : sarana['data']['data'][0]['provinsi']['kode'] }',
                            '${sarana['data']['data'][0]['kabkota']['nama'] == null ? "" : sarana['data']['data'][0]['kabkota']['nama']}',
                            '${sarana['data']['data'][0]['kabkota']['kode'] == null ? "" : sarana['data']['data'][0]['kabkota']['kode']}',
                            '${sarana['data']['data'][0]['kecamatan']['nama'] == null ? "" : sarana['data']['data'][0]['kecamatan']['nama'] }',
                            '${sarana['data']['data'][0]['kecamatan']['kode'] == null ? "" : sarana['data']['data'][0]['kecamatan']['kode']}',
                            '${sarana['data']['data'][0]['kelurahan']['nama'] == null ? "" : sarana['data']['data'][0]['kelurahan']['nama']}',
                            '${sarana['data']['data'][0]['kelurahan']['kode'] == null ? "" : sarana['data']['data'][0]['kelurahan']['kode']}',
                            '${sarana['data']['data'][0]['status_sarana'] == null ? "" : sarana['data']['data'][0]['status_sarana'] }',
                            '${sarana['data']['data'][0]['email'] == null ? "" : sarana['data']['data'][0]['email']}',
                            '${sarana['data']['data'][0]['status_aktif']}',
                            SYSDATE
                        );
                        END;
                    `

                    try {
                        connection = await oracledb.getConnection(db.oracle)
                
                        await connection.execute(query,  [], { outFormat: oracledb.OUT_FORMAT_OBJECT, autoCommit: true})
                
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
                    
                } catch (e) {
                    console.log(e)
                    let query2 = `
                        BEGIN
                        INSERT INTO RN.MST_SARANA_KFA(
                            KODE_SATSET,
                            UPDATE_DATE
                        ) VALUES (
                            '${kodeSatset}',
                            SYSDATE
                        );
                        END;
                    `
                    try {

                        connection = await oracledb.getConnection(db.oracle)
                
                        await connection.execute(query2,  [], { outFormat: oracledb.OUT_FORMAT_OBJECT, autoCommit: true})
                
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
            }, 1000 + delay )
            delay += 1000
        })

        setTimeout( function() {
            fs.unlink(file, (err) => {
                    if (err) throw err
            })
        }, 15000)

        res.status(200).json({
            "message": "ok"
        })
        
    } catch(err) {
        console.log(err)
        res.status(401).json({
            error: "Unauthorized",
        });
    }
});

module.exports = router