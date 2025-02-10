const express = require("express");
const router = express.Router();
const Login = require("../controller/Login");
const Sarana = require("../controller/GetSarana")
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require('../config/db');
const oracledb = require('oracledb');
const json2xls = require('json2xls');

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


// router.post(`/kemenkes/get-sarana`, multer({storage: diskStorage}).single('file'), async function(req,res) {
//     let file = req.file.path
//     var code = []
//     // var nie = []
//     // var reGet = []
//     var connection

//     try {
//         const list = await new Login().login()
//         var data = fs.readFileSync(file)
//         var lines = data.toString().split('\r\n').toString()
//         var array = lines.split(",")
//         var jenisSarana = req.query.jenisSarana
        
//         for(i in array) {
//             if(array[i].length > 5) {
//                 code.push(array[i])
//             }
//         }

//         let delay = 0

//         code.forEach((kodeSatset) => {
//             setTimeout(async () => {
//                 try{
//                     var sarana = await new Sarana().getSarana(list['data']['access_token'], jenisSarana, kodeSatset)

//                     // if(sarana['data']['data'][0]['kelurahan']['nama'] === 'null') {
//                     //     console.log('1')
//                     // } else if(sarana['data']['data'][0]['kelurahan']['nama'] === null) {
//                     //     console.log('2')
//                     // } else {
//                     //     console.log(3)
//                     // }

//                     let query = `
//                         BEGIN
//                         INSERT INTO RN.MST_SARANA_KFA(
//                             KODE_SATSET,
//                             KODE_SARANA,
//                             NAMA,
//                             JENIS_SARANA,
//                             TELP,
//                             ALAMAT,
//                             PROVINSI,
//                             PROVINSI_ID,
//                             KABUPATEN_KOTA,
//                             KABUPATEN_KOTA_ID,
//                             KECAMATAN,
//                             KECAMATAN_ID,
//                             KELURAHAN,
//                             KELURAHAN_ID,
//                             STATUS_SARANA,
//                             EMAIL,
//                             STATUS_AKTIF,
//                             UPDATE_DATE
//                         ) VALUES (
//                             '${sarana['data']['data'][0]['kode_satusehat']}',
//                             '${sarana['data']['data'][0]['kode_sarana']}',
//                             '${sarana['data']['data'][0]['nama']}',
//                             '${sarana['data']['data'][0]['jenis_sarana']['nama']}',
//                             '${sarana['data']['data'][0]['telp'] === null ? "" : (sarana['data']['data'][0]['telp'].replace(/[^\w\s]/gi, '') == null ? null : sarana['data']['data'][0]['telp'].replace(/[^\w\s]/gi, ''))}',
//                             '${sarana['data']['data'][0]['alamat'] == null ? "" : sarana['data']['data'][0]['alamat']}',
//                             '${sarana['data']['data'][0]['provinsi']['nama'] == null ? "" : sarana['data']['data'][0]['provinsi']['nama']}',
//                             '${sarana['data']['data'][0]['provinsi']['kode'] == null ? "" : sarana['data']['data'][0]['provinsi']['kode'] }',
//                             '${sarana['data']['data'][0]['kabkota']['nama'] == null ? "" : sarana['data']['data'][0]['kabkota']['nama']}',
//                             '${sarana['data']['data'][0]['kabkota']['kode'] == null ? "" : sarana['data']['data'][0]['kabkota']['kode']}',
//                             '${sarana['data']['data'][0]['kecamatan']['nama'] == null ? "" : sarana['data']['data'][0]['kecamatan']['nama'] }',
//                             '${sarana['data']['data'][0]['kecamatan']['kode'] == null ? "" : sarana['data']['data'][0]['kecamatan']['kode']}',
//                             '${sarana['data']['data'][0]['kelurahan']['nama'] == null ? "" : sarana['data']['data'][0]['kelurahan']['nama']}',
//                             '${sarana['data']['data'][0]['kelurahan']['kode'] == null ? "" : sarana['data']['data'][0]['kelurahan']['kode']}',
//                             '${sarana['data']['data'][0]['status_sarana'] == null ? "" : sarana['data']['data'][0]['status_sarana'] }',
//                             '${sarana['data']['data'][0]['email'] == null ? "" : sarana['data']['data'][0]['email']}',
//                             '${sarana['data']['data'][0]['status_aktif']}',
//                             SYSDATE
//                         );
//                         END;
//                     `

//                     try {
//                         connection = await oracledb.getConnection(db.oracle)
                
//                         await connection.execute(query,  [], { outFormat: oracledb.OUT_FORMAT_OBJECT, autoCommit: true})
                
//                     } catch (err) {
//                         console.error(err.message);
//                     } finally {
//                         if (connection) {
//                             try {
//                             await connection.close();
//                             } catch (err) {
//                             console.error(err.message);
//                             }
//                         }
//                     }
                    
//                 } catch (e) {
//                     console.log(e)
//                     let query2 = `
//                         BEGIN
//                         INSERT INTO RN.MST_SARANA_KFA(
//                             KODE_SATSET,
//                             UPDATE_DATE
//                         ) VALUES (
//                             '${kodeSatset}',
//                             SYSDATE
//                         );
//                         END;
//                     `
//                     try {

//                         connection = await oracledb.getConnection(db.oracle)
                
//                         await connection.execute(query2,  [], { outFormat: oracledb.OUT_FORMAT_OBJECT, autoCommit: true})
                
//                     } catch (err) {
//                         console.error(err.message);
//                     } finally {
//                         if (connection) {
//                             try {
//                             await connection.close();
//                             } catch (err) {
//                             console.error(err.message);
//                             }
//                         }
//                     }
//                 }
//             }, 1000 + delay )
//             delay += 1000
//         })

//         setTimeout( function() {
//             fs.unlink(file, (err) => {
//                     if (err) throw err
//             })
//         }, 15000)

//         res.status(200).json({
//             "message": "ok"
//         })
        
//     } catch(err) {
//         console.log(err)
//         res.status(401).json({
//             error: "Unauthorized",
//         });
//     }
// });

router.post(`/kemenkes/get-sarana`, async function(req,res) {
    let limit = req.query.limit
    let page = req.query.page
    let jenisSarana = req.query.jenisSarana
    var connection

    
    try {
        connection = await oracledb.getConnection(db.oracle)
        
        const list = await new Login().login();

        var sarana = await new Sarana().getSarana(list.data.access_token, jenisSarana, limit, page);

        var query
        
        for (const i of sarana.data.data) {
            try {
                query = `
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
                            NIB,
                            NO_SIO,
                            TANGGAL_SIO_AKHIR,
                            TANGGAL_SIO_MULAI,
                            DATE_UPLOADED,
                            STATUS_AKTIF,
                            WEBSITE,
                            KODE_JENIS_SARANA,
                            SUBJENIS_NAMA,
                            SUBJENIS_KODE,
                            OPERASIONAL,
                            SUBJENIS_KATEGORI,
                            SUB_SUBJENIS_NAMA,
                            SUB_SUBJENIS_KODE,
                            SUB_SUBJENIS_KATEGORI
                        ) 
                        SELECT
                            '${i.kode_satusehat}',
                            '${i.kode_sarana ?? ""}',
                            '${i.nama === null ? "-" : i.nama?.replace(/'/g, "")}',
                            '${i.jenis_sarana.nama === null ? "-" : i.jenis_sarana.nama?.replace(/'/g, "")}',
                            '${i.telp === null ? "-" : i.telp?.replace(/[^\w\s]/gi, "")}',
                            '${i.alamat === null ? "-" : i.alamat.replace(/'/g, "")}',
                            '${i.provinsi.nama === null ? "-" : i.provinsi.nama?.replace(/'/g, "")}',
                            '${i.provinsi.kode === null ? "-" : i.provinsi.kode}',
                            '${i.kabkota.nama === null ? "-" : i.kabkota.nama?.replace(/'/g, "")}',
                            '${i.kabkota.kode === null ? "" : i.kabkota.kode}',
                            '${i.kecamatan.nama === null ? "-" : i.kecamatan?.nama.replace(/'/g, "")}',
                            '${i.kecamatan.kode === null ? "-" : i.kecamatan.kode}',
                            '${i.kelurahan.nama === null ? "-" : i.kelurahan.nama?.replace(/'/g, "")}',
                            '${i.kelurahan.kode === null ? "-" : i.kelurahan.kode}',
                            '${i.status_sarana === null ? "" : i.status_sarana}',
                            '${i.email === null ? "-" : i.email?.replace(/'/g, "")}',
                            '${i.nib === null ? "-" : i.nib}',
                            '${i.sio === null ? "-" : i.sio}',
                            ${i.tgl_sio_akhir === null ? null : `TO_DATE('${i.tgl_sio_akhir}', 'YYYY-MM-DD')`},
                            ${i.tgl_sio_mulai === null ? null : `TO_DATE('${i.tgl_sio_mulai}', 'YYYY-MM-DD')`},
                            SYSDATE,
                            '${i.status_aktif === null ? "-" : i.status_aktif}',
                            '${i.website === null ? "-" : i.website.replace(/'/g, "")}',
                            '${i.jenis_sarana.kode === null ? "-" : i.jenis_sarana.kode}',
                            '${i.subjenis.Nama === null ? "-" : i.subjenis.Nama?.replace(/'/g, "")}',
                            '${i.subjenis.kode === null? "-" : i.subjenis.kode}',
                            '${i.operasional === null ? "-" : i.operasional}',
                            '${i.subjenis.sarana_kategori.nama === null ? "-" : i.subjenis.sarana_kategori.nama?.replace(/'/g, "")}',
                            '${i.sub_subjenis.Nama === null ? "-" : i.sub_subjenis.Nama?.replace(/'/g, "")}',
                            '${i.sub_subjenis.kode === null ? "-" : i.sub_subjenis.kode}',
                            '${i.sub_subjenis.sarana_kategori.nama === null ? "-" : i.sub_subjenis.sarana_kategori.nama?.replace(/'/g, "")}'
                        FROM DUAL
                        WHERE NOT EXISTS (
                            SELECT 1 FROM RN.MST_SARANA_KFA WHERE KODE_SATSET = '${i.kode_satusehat}'
                        );
                        COMMIT;
                    END;
                `
                
                await connection.execute(query, [])
            } catch (e) {
                console.log(query)
            }
        }

        await connection.commit()

        res.status(200).json({
            "message": sarana.data.message,
            "page": sarana.data.page,
            "total_page": sarana.data.total_page
        })
        
    } catch(err) {
        res.status(500).json({
            error: err,
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (e) {
                console.error("Error closing DB connection");
            }
        }
    }
        
});

module.exports = router