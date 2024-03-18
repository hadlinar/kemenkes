const express = require("express")
const app = express()
const cors = require("cors")
const kfaRouter = require('./routes/kfa');

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({
    extended:true
}));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTION, PUT, PATCH, DELETE, HEAD"
    )
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
})

app.use(kfaRouter);

var port = 8083

app.listen(8083, () => {
  console.log(`Server running at on port ${port}`);
})