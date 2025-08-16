const jwt = require('jsonwebtoken');

function checkUserRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ message: 'Acceso no autorizado' });
    }
  };
}

function verifyToken (req, res, next) {
    if(!req.headers.authorization) {
        return res.status(401).send(" Unauthorized request ")
    }

    const token = req.headers.authorization.split(' ')[1]
    if (token  === 'null') {
        return res.status(401).send(" Unauthorized request ") 
    } 

    const payload = jwt.verify(token, 'secretKey')
    req.userId = payload._id
    next();
}
module.exports = {
  checkUserRole,
  verifyToken
};