const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 8000
const cors = require('cors');
require('dotenv').config()


app.use(cors());
app.use(express.json())



const uri = process.env.MONGODB_URI

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
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");


        const database = client.db("hireloop");
        const jobCollaction = database.collection("alljobs");
        const companyCollaction = database.collection('companis');
        const applyJobCollaction = database.collection('applyjobs')
        const planscollaction = database.collection('plans')
        const subscriptionsCollaction = database.collection('subscriptions')
        const userCollaction = database.collection('user')


        app.post('/api/job', async (req, res) => {
            const doc = req.body
            const newJob = {
                ...doc,
                createdAt: new Date()
            }
            const result = await jobCollaction.insertOne(newJob)
            res.send(result)
        })

        app.get('/api/job', async (req, res) => {
            const query = {}
            if (req.query.companyId) {
                query.companyId = req.query.companyId
            }
            if (req.query.status) {
                query.status = req.query.status
            }

            const result = await jobCollaction.find(query).toArray()
            res.json(result)

        })

        app.get('/api/job/:id', async (req, res) => {
            const id = req.params.id
            const query = {
                _id: new ObjectId(id)
            }
            const result = await jobCollaction.findOne(query)
            res.json(result)
        })


        app.post('/api/company', async (req, res) => {
            const company = req.body
            const makecompany = {
                ...company,
                createdAt: new Date()
            }
            const result = await companyCollaction.insertOne(makecompany)
            res.json(result)
        })


        app.post('/api/application', async (req, res) => {
            const doc = req.body
            const result = await applyJobCollaction.insertOne(doc)
            res.json(result)
        })

        app.get('/api/application', async (req, res) => {
            const query = {}
            if (req.query.applicantId) {
                query.applicantId = req.query.applicantId
            }

            if (req.query.jobId) {
                query.jobId = req.query.jobId
            }

            const cursor = await applyJobCollaction.find(query).toArray()
            res.json(cursor)

        })


        app.get('/api/my/company', async (req, res) => {

            const query = {}

            if (req.query.recruiterId) {
                query.recruiterId = req.query.recruiterId
            }
            const result = await companyCollaction.findOne(query)
            res.json(result || {})

        })

        app.get('/api/plans', async (req, res) => {
            const query = {}

            if (req.query.id) {
                query.id = req.query.id
            }
            const result = await planscollaction.findOne(query)
            res.json(result)
        })



        app.post('/api/subscription', async (req, res) => {
            try {
                const data = req.body;
               
                
                const subInfo = {
                    ...data,
                    createdAt: new Date()
                };


                const submit = await subscriptionsCollaction.insertOne(subInfo);


                const filter = { email: data.email };


                const updateDocument = {
                    $set: {
                        plan: data.planId,
                    },
                };


                const result = await userCollaction.updateOne(filter, updateDocument);


                res.json({ success: true, result });

            } catch (error) {
                console.error("Subscription Error:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });





    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);










app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})