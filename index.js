const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;
const app = express();

// Middleware.
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zqb2d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('bd-bikes');
        const productsCollection = database.collection('products');

        // Get Home Products API.
        app.get('/homeProducts', async (req, res) => {
            const services = await productsCollection.find({}).limit(6).toArray();
            res.json(services);
        });

        // Get All Products API.
        app.get('/products', async (req, res) => {
            const services = await productsCollection.find({}).toArray();
            res.json(services);
        });

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running BD-Bikes server')
});

app.listen(port, () => {
    console.log('server running on port:', port)
});