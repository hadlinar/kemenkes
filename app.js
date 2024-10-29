process.env.TZ = 'Asia/Jakarta';

const express = require("express")
const app = express()
const cors = require("cors")
const kfaRouter = require('./routes/kfa')
const transaksiRouter = require('./routes/transaksi')
const saranaRouter = require('./routes/sarana')
const cron = require("node-cron")
const axios = require('axios')

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({
    extended:true
}))
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTION, PUT, PATCH, DELETE, HEAD"
    )
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    )
    next()
})

app.use(kfaRouter)
app.use(transaksiRouter)
app.use(saranaRouter)
app.use('/kemenkes/transaksi', transaksiRouter)

cron.schedule('30 1,2 * * *', async () => {
    try {
        await axios.post('http://localhost:8250/kemenkes/transaksi?docNum=&lot');
    } catch (error) {
    }
});

var port = 8250

app.listen(8250, () => {
  console.log(`Server running at on port ${port}`);
})