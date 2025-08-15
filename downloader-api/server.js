const express = require('express')
const cors = require('cors');
const morgan = require('morgan')
const path = require('path');
require('dotenv').config()

const router = require('./src/router/youtube-router')

const app = express();
const port = process.env.PORT || 5000;

app.disable('x-powered-by')
app.use(cors());
app.use(express.json());
app.use(morgan('dev'))

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/view-download', 'dist')));
} 

app.use('/api/v1', router) // Use the router for API endpoints 
app.use((req, res) => {
  return res.status(404).json({
    path: `Path url not found ${req.originalUrl}`
  })
})


app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});


