const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.loo5igw.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    client.connect();

    const database = client.db("toyVerseEmpireDB");
    const sliderCollection = database.collection("bannerSlider");
    const toysCollection = database.collection("toys");
    const galleryCollection = database.collection("gallery");
    const stationImgCollection = database.collection("stationImg");
    const gameCollection = database.collection("games");

    // Creating Index Key
    const indexKey = { toyName: 1 };

    // Index Option
    const indexOption = { name: "toyName" };

    // Creating Index
    const result = await toysCollection.createIndex(indexKey, indexOption);

    // Delete toy Api
    app.delete("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    // Games Section data api
    app.get("/games", async (req, res) => {
      const cursor = gameCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Gallery Data api
    app.get("/gallery", async (req, res) => {
      const cursor = galleryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Station Section data api
    app.get("/station-img", async (req, res) => {
      const cursor = stationImgCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Add New Toy
    app.post("/toy", async (req, res) => {
      const data = req.body;
      const result = await toysCollection.insertOne(data);
      res.send(result);
    });

    // Update Toy Data
    app.patch("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          toyName: data.toyName,
          category: data.category,
          price: data.price,
          quantity: data.quantity,
          description: data.description,
        },
      };
      const result = await toysCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // Slider Data
    app.get("/slider-data", async (req, res) => {
      const cursor = sliderCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Toys Filter By category api
    app.get("/toys", async (req, res) => {
      const category = req.query.category;
      let query = {};
      if (category) {
        query = { category: category };
      }
      const cursor = toysCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // All toys with search function
    app.get("/all-toys", async (req, res) => {
      const page = Number(req.query.page) || 0;
      const limit = Number(req.query.limit) || 20;
      const searchTxt = req.query.search;

      const cursor = toysCollection
        .find({ toyName: { $regex: searchTxt, $options: "i" } })
        .limit(limit);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/my-toys", async (req, res) => {
      const page = Number(req.query.page) || 0;
      const limit = Number(req.query.limit) || 20;
      const email = req.query.email;
      const sort = Number(req.query.sort) || 1;
      const emailQuery = { sellerEmail: email };
      const cursor = toysCollection
        .find(emailQuery)
        .limit(limit)
        .sort({ price: sort });
      const result = await cursor.toArray();
      res.send(result);
    });

    // Single Toy Data
    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
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

app.get("/", (req, res) => {
  res.send(
    "ToyVerseEmpire server is soaring through the galaxies, sprinkling joy and magic across the universe!"
  );
});

app.listen(port, () => {
  console.log(
    `Behold the whimsical wonders of ToyVerseEmpire! Our enchanted server has gracefully awakened, joyfully twinkling on port ${port}`
  );
});
