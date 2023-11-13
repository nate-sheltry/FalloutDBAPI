const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.port || 3000;
const host = process.env.HOST

const routes = require('./routes');
const urlsToRequest = [
    `${host}/Resources/Ammo/`,
    `${host}/Resources/Armor/`
]

const performGetRequests = async () => {
    for (const url of urlsToRequest) {
      try {
        const response = await fetch(url).then(data => data.json());
        console.log(`GET request to ${url} successful.`);
      } catch (error) {
        console.error(`Error performing GET request to ${url}:`);
      }
    }
  };
app.use(cors());
app.use(express.json());
app.use('/', routes);

app.listen(port, ()=>{
    console.log(`Server is listening at http://localhost:${port}`);
})

performGetRequests();
setInterval(performGetRequests, 3600000)
