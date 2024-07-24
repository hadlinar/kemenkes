const express = require("express");
const router = express.Router();
const Login = require("../controller/Login");
const KFA = require("../controller/GetKFA");
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


router.post(`/kemenkes/get-kfa`, multer({storage: diskStorage}).single('file'), async (req,res) => {
    let file = req.file.path
    var noReq = []
    var nie = []
    var reGet = []
    var connection

    try {
        const list = await new Login().login()
        var data = fs.readFileSync(file)
        var lines = data.toString().split('\r\n').toString()
        var array = lines.split(",")

        for(i in array) {
            if(array[i].length > 5) {
                noReq.push(array[i])
            }
        }

        let delay = 0

        noReq.forEach((nie) => {
            setTimeout(async () => {
                try{
                    var kfa = await new KFA().getKFA(list['data']['access_token'], nie)
                    
                    let query = `
                        BEGIN
                        INSERT INTO RN.MST_PROD_KFA(
                            REG_NO,
                            KFA_NO_93,
                            UOM,
                            NAME,
                            TYPE,
                            MANUFACTURER,
                            REGISTRAR,
                            TRADE_NAME,
                            DRUG_CLASS,
                            DATE_UPLOADED
                        ) VALUES (
                            '${kfa['data']['search_code']}',
                            '${kfa['data']['result']['kfa_code']}',
                            '${kfa['data']['result']['uom']['name']}',
                            '${kfa['data']['result']['name']}',
                            '${kfa['data']['result']['farmalkes_type']['name']}',
                            '${kfa['data']['result']['manufacturer']}',
                            '${kfa['data']['result']['registrar']}',
                            '${kfa['data']['result']['nama_dagang']}',
                            '${kfa['data']['result']['controlled_drug']['name']}',
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
                    if(kfa['data']['result']['kfa_code'] != false) {
                        for(let i=0; i < kfa['data']['result']['packaging_ids'].length; i++){
                            let query1 = `
                                BEGIN
                                INSERT INTO RN.MST_PROD_KFA(
                                    REG_NO,
                                    KFA_NO_93,
                                    UOM,
                                    NAME,
                                    UOM_KFA,
                                    TYPE,
                                    MANUFACTURER,
                                    REGISTRAR,
                                    TRADE_NAME,
                                    DRUG_CLASS,
                                    DATE_UPLOADED,
                                    KFA_NO_94,
                                    QTY_CONTAINED
                                ) VALUES (
                                    '${kfa['data']['search_code']}',
                                    '${kfa['data']['result']['kfa_code']}',
                                    '${kfa['data']['result']['packaging_ids'][i]['uom_id']}',
                                    '${kfa['data']['result']['name']}',
                                    '${kfa['data']['result']['packaging_ids'][i]['name']}',
                                    '${kfa['data']['result']['farmalkes_type']['name']}',
                                    '${kfa['data']['result']['manufacturer']}',
                                    '${kfa['data']['result']['registrar']}',
                                    '${kfa['data']['result']['nama_dagang']}',
                                    '${kfa['data']['result']['controlled_drug']['name']}',
                                    SYSDATE,
                                    '${kfa['data']['result']['packaging_ids'][i]['kfa_code']}',
                                    '${Number(kfa['data']['result']['packaging_ids'][i]['qty'])}'
                                );
                                END;
                            `

                            try {

                                connection = await oracledb.getConnection(db.oracle)
                        
                                await connection.execute(query1,  [], { outFormat: oracledb.OUT_FORMAT_OBJECT, autoCommit: true})
                        
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
                    } 

                } catch (e) {
                    let query2 = `
                        BEGIN
                        INSERT INTO RN.MST_PROD_KFA(
                            REG_NO,
                            DATE_UPLOADED
                        ) VALUES (
                            '${nie}',
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