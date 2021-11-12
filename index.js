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
        const orderCollection = database.collection('ordersItem');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('review');

        // Products API.

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

        // Get Single Products.
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const singleItem = await productsCollection.findOne(query);
            res.json(singleItem);
        });

        // Post New Added Data/Product.
        app.post('/products', async (req, res) => {
            const newData = req.body;
            const result = await productsCollection.insertOne(newData);
            res.json(result)
        });

        // Delete Products
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        })


        // Order API Options.

        // Post Orders
        app.post('/ordersItem', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result)
        });

        // Get user Orders
        app.get('/ordersItem', async (req, res) => {
            const allOrders = await orderCollection.find({}).toArray();
            res.json(allOrders);
        });

        // Update order Status.
        app.put('/ordersItem/:id', async (req, res) => {
            const id = req.params.id;
            const updateStatus = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: updateStatus.status
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc);
            console.log(id)
            res.send(result);
        });

        // Delete Order
        app.delete('/ordersItem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        });


        // Users API.

        // Post Users
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // UpSert User.
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // Make An User Admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        // Check Admin 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });


        // User Review Api

        // Post New Reviews.
        app.post('/review', async (req, res) => {
            const newData = req.body;
            const result = await reviewsCollection.insertOne(newData);
            res.json(result)
        });

        // Get All Reviews API.
        app.get('/review', async (req, res) => {
            const reviews = await reviewsCollection.find({}).toArray();
            res.json(reviews);
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