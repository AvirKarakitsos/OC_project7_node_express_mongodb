const express = require('express');
const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');
const path = require('path');
const swaggerUi = require('swagger-ui-express')
const yaml = require('js-yaml');
const fs   = require('fs');
require('dotenv').config();

const app = express();

try {
    //Intercept request with a json content-type
    app.use(express.json());

    //Solve CORS problems
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        next();
    });
    
    // Get document, or throw exception on error
    const swaggerDoc = yaml.load(fs.readFileSync('./swagger.yaml', 'utf8'));
    
    //Define routes
    app.use('/api/books',bookRoutes);
    app.use('/api/auth',userRoutes);
    app.use('/images', express.static(path.join(__dirname, 'images')));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

} catch (e) {
    console.log(e);
}

module.exports = app;