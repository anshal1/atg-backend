const express = require("express");
const PORT = process.env.PORT || 5000;
const app = express();
const cors = require("cors");
const Connect = require("./Connect_to_database");
app.use(express.json());
app.use(cors({
    origin:"http://localhost:3000"
}));
Connect();
app.use("/", require("./routes/user.js"));
app.use("/", require("./routes/Post.js"));



app.listen(PORT, ()=>{
    console.log(`App Running ON PORT ${PORT}`);
})