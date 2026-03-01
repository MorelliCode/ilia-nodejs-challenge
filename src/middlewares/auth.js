const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_PRIVATE_KEY

// Middleware to authenticate tokens
const authenticateToken = (request, response, next) => {
    const authHeader = request.headers['authorization'];

    let token;
    if (authHeader) {
        token = authHeader.split(' ')[1];
    };

    if (!token) {
        return response.status(401).json({ error: 'Access token is missing or invalid' });
    };

    jwt.verify(token, SECRET, (err) => {
        if (err) {return response.status(401).json({ error: 'Access token is missing or invalid' })};
        next();
    })
}

module.exports = { authenticateToken };