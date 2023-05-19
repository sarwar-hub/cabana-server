const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json());
require('dotenv').config();


app.get('/', async(req, res) => {
    res.send('cubebuzz server is running');
})




console.log(process.env.PASS)


const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.nb3yaqn.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const database = client.db("cubeBuzz");
    const cubesCollection = database.collection("cubes");

    // APIs ----------------------------------------------------


    // create index
    const indexKeys = {cubeName: 1};
    const indexOptions = {name: 'searchByName'};
    await cubesCollection.createIndex(indexKeys, indexOptions);

    // find by search
    app.get('/searchBy/:text', async(req, res) => {
      const text = req.params.text;
      console.log(text);
      const result = await cubesCollection.find({ cubeName: { $regex : text, $options: 'i'} }).toArray();
      res.send(result)
    })




    // find all data
    app.get('/cubes/:category', async(req, res) => {
      const tab = req.params.category;
      const query = {category: tab};

      if(tab=='all'){
        const result = await cubesCollection.find().limit(20).toArray();
        return res.send(result);
      } 
      else if (tab=='4x4' || tab=='3x3' || tab=='2x2') {
        const result = await cubesCollection.find(query).limit(20).toArray();
        return res.send(result);
      } else {
        res.send([]);
      }
      
    })

    // find one
    app.get('/details/:id', async(req, res) =>  {
      const id = req.params.id;
      console.log(id);
      const query = await {_id: new ObjectId(id)};
      const result = await cubesCollection.findOne(query);
      res.send(result);
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









app.listen(port, () => {
    console.log(`running in port: ${port}`);
})