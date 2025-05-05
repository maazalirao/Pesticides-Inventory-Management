const jwt = require("jsonwebtoken");
const generateToken = (id) => {
const JWT_SECRET = "roadsidecoder123"; 
//Give some value to your JWT_SECRET.
return jwt.sign({ id }, , {
expiresIn: "30d",
});
};

module.exports = generateToken;