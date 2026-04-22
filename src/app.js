const express = require("express");
// const cors = require("cors");
const helmet = require("helmet");
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // Handle preflight (OPTIONS) requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// const corsOptions = {
//   origin: 'https://interfaz-core.vercel.app/', 
//   methods: ['GET', 'POST', 'PUT'],           
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,                         
// };

app.set("PORT", process.env.PORT);
app.set("STAGE", process.env.STAGE);

// app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());

// Permite procesar datos enviados desde formularios tradicionales (URL-encoded)
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.status(200).json({"message": "Server is up!", "success": true}));

// app.use((req, res, next) => {
//     console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
//     return next();
// });

// Ruteo
app.use('/usuarios', require('./Routes/usuario'));
app.use('/seguros', require('./Routes/seguro'));
app.use('/doctores', require('./Routes/doctor'));
app.use('/consultas', require('./Routes/consulta'));
app.use('/facturas', require('./Routes/factura'));

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).send({ 
        message: 'Not Found', 
        path: req.originalUrl 
    });
});

module.exports = app;