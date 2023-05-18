/** @format */

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Toys server is running...");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dlbjtks.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toysCollection = client.db("toyCollection").collection("toys");

    app.get("/toys", async (req, res) => {
      const result = await toysCollection.find().toArray();
      res.send(result);
    });

    //get data by email
    app.get("/toys/:email", async (req, res) => {
      const email = req.params.email;
      // console.log(email);
      const query = { sellerEmail: email };
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });

    //get data by id
    app.get("/toys/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });

    //update data by id
    app.put("/toys/toy/:id", async (req, res) => {
      const id = req.params.id;
      const newToys = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToys = {
        $set: {
          ...newToys,
        },
      };

      const result = await toysCollection.updateOne(
        query,
        updatedToys,
        options
      );
      res.send(result);
    });

    app.post("/toys", async (req, res) => {
      const toys = req.body;
      // console.log(toys);
      const result = await toysCollection.insertOne(toys);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
