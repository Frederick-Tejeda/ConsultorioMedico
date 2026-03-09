const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const app = express();

app.set("PORT", process.env.PORT);
app.set("STAGE", process.env.STAGE);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.status(200).json({"message": "Server is up!", "success": true}));
app.use('/users', require('./Routes/user'));

app.use((req, res) => {
    res.status(404).send({ 
        message: 'Not Found', 
        path: req.originalUrl 
    });
});

module.exports = app;