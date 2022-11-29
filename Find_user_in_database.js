const jwt = require('jsonwebtoken');
const UserSchema = require("./Schema/UserSchema.js");
require('dotenv').config()
const FetchUser = async (req, res, next) => {
    const header = req.header("token");
    if (!header) {
        return res.status(400).json({
            error: {
                error_type: "Header not included",
                error_msg: "Unauthorized action",
                status_code: 400
            }
        })
    }
    const decoded = jwt.verify(header, process.env.secretkey);
    const find_user = await UserSchema.findById(decoded.token);
    user = find_user;
    next();
}

module.exports = FetchUser