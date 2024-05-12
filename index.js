const express = require('express')
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieparser = require('cookie-parser')
const port = process.env.PORT || 5000;
require('dotenv').config()

// middle wara
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieparser())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.otpbube.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


//won make middleware

const verifytoken = async (req, res, next) => {
  const token = req.cookies?.assestoken;
  if (!token) {
    return res.status(401).send({ 'message': 'not autorize' })
  }
  jwt.verify(token, process.env.ASSES_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ massage: 'unauthorize' })
    }
    req.user = decoded;
    next()
  })

}


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const database = client.db('Jhotpot');
    const servicecollection = database.collection('Service');
    const purchasecollection = database.collection('Purchase');



    app.post('/AddService', verifytoken, async (req, res) => {
      const data = req.body;
      const result = await servicecollection.insertOne(data);
      if (req.user.email !== data.email) {
        res.status(401).send({ massage: 'forbidden acces' })
      }
      res.send(result)
    })

    app.post('/addpurchase', verifytoken, async (req, res) => {
      const doc = req.body;
      const result = await purchasecollection.insertOne(doc);
      res.send(result);
    })

    app.get('/test', verifytoken, async (req, res) => {
      console.log('geted')
      res.send('working')
    })

    app.get('/Services', async (req, res) => {
      const result = await servicecollection.find().toArray();
      res.send(result)
    })

    app.get('/services/:id', verifytoken, async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) };
      const result = await servicecollection.findOne(quary);
      res.send(result)
    })

    app.get('/myservice', verifytoken, async (req, res) => {
      const email = req.query.email;
      const quary = { email: email };
      const result = await servicecollection.find(quary).toArray();
      if (req.user.email !== email) {
        res.status(400).send({ massage: 'forbiddin acces' })
      }
      res.send(result)
    })

    app.delete('/delete/:id', verifytoken, async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) };
      const result = await servicecollection.deleteOne(quary);
      res.send(result)
    })

    app.put('/updateservice/:id', verifytoken, async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) };
      const doc = req.body;
      const option = { upsert: true };
      const updatedoc = {
        $set: {
          name: doc.name,
          price: doc.price,
          detils: doc.detils,
          image: doc.image,
          area: doc.area,
          username: doc.username,
          email: doc.email,
          userimage: doc.userimage,
        }
      }
      const result = await servicecollection.updateOne(quary,updatedoc,option);
      if(req.user.email !== doc.email){
        res.status(400).send({massage: 'unauthorize'})
      }
      console.log(doc.area)
      res.send(result)
    })

    app.get('/bookedservices', verifytoken, async(req,res) => {
      const email = req.query.email;
      console.log(email)
      const quary = {userEMail: email};
      const result = await purchasecollection.find(quary).toArray();
      if(req.user.email !== email){
        res.status(400).send({massage: 'forbidden acces'})
      }
      res.send(result);
    })

    app.get('/servicetodo', verifytoken, async(req,res) => {
      const email = req.query.email;
      const quary = {providerEmail: email};
      const result = await purchasecollection.find(quary).toArray();
      if(req.user.email !== email){
        res.status(400).send({massage: 'forbidden acces'})
      }
      res.send(result);
    })

    app.patch('/updatestatus/:id',verifytoken, async(req,res)=> {
      const doc = req.body;
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result =await purchasecollection.updateOne(query,{$set: doc});
      res.send(result)
    })















    //authreleted api
    app.post('/jwt', async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.ASSES_TOKEN_SECRET, { expiresIn: '1h' })
      res.cookie('assestoken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      }).send({ succes: true, })
    })


    app.post('/logout', async (req, res) => {
      user = req.body;
      res.clearCookie('assestoken', { maxAge: 0, }).send({ succes: true, })
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




app.get('/', (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log('server is running port:', port)
})