const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json());
require('dotenv').config();


app.get('/', async(req, res) => {
    res.send('productbuzz server is running');
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

    const database = client.db("cabana");
    const productsCollection = database.collection("products");

    // APIs ----------------------------------------------------


    // create index
    const indexKeys = {productName: 1};
    const indexOptions = {name: 'searchByName'};
    await productsCollection.createIndex(indexKeys, indexOptions);

    // find by search
    app.get('/searchBy/:text', async(req, res) => {
      const text = req.params.text;
      console.log(text);
      const result = await productsCollection.find({ productName: { $regex : text, $options: 'i'} }).toArray();
      res.send(result)
    })




    // find all data
    app.get('/products/:category', async(req, res) => {
      const tab = req.params.category;
      const query = {category: tab};

      if(tab=='all'){
        const result = await productsCollection.find().limit(20).toArray();
        return res.send(result);
      } 
      else if (tab=='science' || tab=='math' || tab=='engineering' || tab=='others') {
        const result = await productsCollection.find(query).limit(20).toArray();
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
      const result = await productsCollection.findOne(query);
      res.send(result);
    })


    // add one
    app.post('/addProduct', async(req, res) => {
      const product = req.body;
      console.log(product);
      const result = await productsCollection.insertOne(product);
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