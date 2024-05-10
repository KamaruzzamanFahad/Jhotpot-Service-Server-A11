const express = require('express')
const app = express()
const cors = require('cors');
const cookieparser = require('cookie-parser')
const port = process.env.PORT|| 5000;
require('dotenv').config()

// middle wara
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieparser())

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.otpbube.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const database = client.db('Jhotpot');
    const servicecollection = database.collection('Service');



    app.post('/AddService', async(req,res)=>{
      const data = req.body;
      const result = await servicecollection.insertOne(data);
      res.send(result)
    })












    //authreleted api
    app.post('/jwt', async(req,res) => {
      const email = req.body;
      const token = jwt.sign(email,process.env.ASSES_TOKEN_SECRET,{expiresIn: '1h'})
      res.cookie('assestoken',token,{
          httpOnly: true,
          secure: false,
          sameSite: 'none',
      }).send({succes: true,})
     })

     














    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/',(req,res) =>{
    res.send('server is running')
})

app.listen(port, ()=>{
    console.log('server is running port:',port)
})