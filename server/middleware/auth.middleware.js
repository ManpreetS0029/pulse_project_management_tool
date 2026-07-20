const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
  const authHeader =
    req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ message: 'Invalid or expired access token' });
    }

    req.user = decoded.user;

    next();
  });
};

module.exports = verifyJWT;
