const express = require("express");
const router = express.Router();
const Login = require("../controller/Login");
const KFA = require("../controller/GetKFA");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { parse } = require("csv-parse");
const db = require('../config/db');
const oracledb = require('oracledb')

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
    try {
        const list = await new Login().login()

        fs.createReadStream(file)
        .pipe(parse({delimiter: ",", "from_line": 2}))
        .on("data", async function(row) {
            try{
                var kfa = await new KFA().getKFA(list['data']['access_token'], row[0])

                let connection

                let query = `
                    BEGIN
                    INSERT INTO RN.MST_PROD_KFA(
                        REG_NO,
                        KFA_NO,
                        UOM,
                        NAME,
                        TYPE,
                        MANUFACTURER,
                        REGISTRAR,
                        TRADE_NAME,
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
                                KFA_NO,
                                UOM,
                                NAME,
                                UOM_KFA,
                                TYPE,
                                MANUFACTURER,
                                REGISTRAR,
                                TRADE_NAME,
                                DATE_UPLOADED
                            ) VALUES (
                                '${kfa['data']['search_code']}',
                                '${kfa['data']['result']['packaging_ids'][i]['kfa_code']}',
                                '${kfa['data']['result']['packaging_ids'][i]['uom_id']}',
                                '${kfa['data']['result']['name']}',
                                '${kfa['data']['result']['packaging_ids'][i]['name']}',
                                '${kfa['data']['result']['farmalkes_type']['name']}',
                                '${kfa['data']['result']['manufacturer']}',
                                '${kfa['data']['result']['registrar']}',
                                '${kfa['data']['result']['nama_dagang']}',
                                SYSDATE
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
                console.log(e)
            }
        })

        setTimeout( function() {
            fs.unlink(file, (err) => {
                    if (err) throw err
            })
        }, 10000)

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