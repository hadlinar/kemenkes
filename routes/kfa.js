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
    let connection

    try {
        connection = await oracledb.getConnection(db.oracle)
        const list = await new Login().login()
        var data = fs.readFileSync(file)
        var lines = data.toString().split('\r\n').toString()
        var array = lines.split(",")

        const noReq = array.filter(item => item.length > 5)

        const queries = []

        for(const nie of noReq) {
            try{
                var kfa = await new KFA().getKFA(list['data']['access_token'], nie)
                
                let query=`
                    BEGIN
                        INSERT INTO RN.MST_PROD_KFA (
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
                        )
                        SELECT 
                            '${kfa.data.search_code}',
                            '${kfa.data.result.kfa_code}',
                            '${kfa.data.result.uom.name}',
                            '${kfa.data.result.name}',
                            '${kfa.data.result.farmalkes_type.name}',
                            '${kfa.data.result.manufacturer}',
                            '${kfa.data.result.registrar}',
                            '${kfa.data.result.nama_dagang}',
                            '${kfa.data.result.controlled_drug.name}',
                            SYSDATE
                        FROM DUAL
                        WHERE NOT EXISTS (
                            SELECT 1 FROM RN.MST_PROD_KFA WHERE REG_NO = '${kfa.data.search_code}'
                        );
                    COMMIT;
                    END;
                `

                queries.push(connection.execute(query, []))
                
                if(kfa.data.result.kfa_code) {
                    kfa.data.result.packaging_ids.forEach((pack) => {
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
                                    '${kfa.data.search_code}',
                                    '${kfa.data.result.kfa_code}',
                                    '${pack.uom_id}',
                                    '${kfa.data.result.name}',
                                    '${pack.name}',
                                    '${kfa.data.result.farmalkes_type.name}',
                                    '${kfa.data.result.manufacturer}',
                                    '${kfa.data.result.registrar}',
                                    '${kfa.data.result.nama_dagang}',
                                    '${kfa.data.result.controlled_drug.name}',
                                    SYSDATE,
                                    '${pack.kfa_code}',
                                    '${Number(pack.qty)}'
                                );
                            COMMIT;
                            END;
                        `

                        queries.push(connection.execute(query1, []))
                    })
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
                    COMMIT;
                    END;
                `
                queries.push(connection.execute(query2, []))
            }
        }

        await Promise.all(queries)

        await connection.commit()

        fs.unlink(file, (err) => {
                if (err) throw err
        })

        res.status(200).json({
            "message": "ok"
        })
        
    } catch(err) {
        res.status(500).json({
            error: "Internal Server Error",
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (e) {
                console.error("Error closing DB connection:", e);
            }
        }
    }
});

module.exports = router