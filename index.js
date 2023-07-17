const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
require('dotenv').config();
// const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const http = require('http');
const server = http.createServer(app);

app.use(cors());
app.use(express.json())
app.use(express.urlencoded())
const wss = new WebSocket.Server({ server });

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kos6m2u.mongodb.net/?retryWrites=true&w=majority`;
 const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try { 
    // await client.connect();
    const usersCollection = client.db('blood-care').collection('users');
    const testCollection = client.db('blood-care').collection('tests');
    
    app.post('/users', async(req, res)=>{
      const userInfo = req.body;
      const result = await usersCollection.insertOne(userInfo);
      res.send(result);
    })
    app.get('/users', async(req, res)=>{
      let search = {}     
      if(req?.query.group){
        const searchInput = decodeURIComponent(req.query.group);
      const searchInputUp = searchInput.toLocaleUpperCase();
        search = {
          group : searchInputUp
        }
      }
        const result = await usersCollection.find(search).toArray();
        res.send(result)
    })
    app.post('/tests', async(req, res)=>{
      const testInfo = req.body;
      const result = await  testCollection.insertOne(testInfo);
      res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res)=>{
    res.send('Blood care is exchanging')
})
  

wss.on('connection', (ws) => {
  // console.log(ws)
  // console.log('WebSocket client connected.');
  //  ws.send('Welcome new user!')
  ws.on('message', (message) => {
    console.log('Received message:', message);
    ws.send('' + message)

    // Send a response back to the WebSocket client
    // ws.send('send');
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected.');
  });
});
 
server.listen(process.env.PORT || 5000, () => {
  console.log(`Blood care server running on port ${process.env.PORT || 5000}`);
});