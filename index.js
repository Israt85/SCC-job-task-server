const express = require('express')
const cors = require("cors")
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


console.log(process.env.DB_USER);



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rqq4klv.mongodb.net/?retryWrites=true&w=majority`;

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
    const database= client.db('TaskDB')
    const taskCollection = database.collection('taskCollection')
    const userCollection = database.collection('userCollection')


    app.post('/users', async(req,res)=>{
      const user = req.body
      const query = {email: user.email}
      const existingUser = await userCollection.findOne(query)
      if (existingUser) {
          return res.send({ message: 'user already in', insertedId: null })
      }
      const result = await userCollection.insertOne(user)
      res.send(result)
    })

    app.get('/task', async(req,res)=>{
      const result = await taskCollection.find().toArray()
      res.send(result)
  })
   
    app.post('/task', async(req,res)=>{
        const user = req.body
        const result = await taskCollection.insertOne(user)
        res.send(result)

    })
    app.put('/task/:id', async (req, res) => {
      try {
        const id = req.params.id;
        console.log('req',req.params);
        console.log("Task ID:", id);
        
        const updatedTask = req.body;
        console.log("Updated Task:", updatedTask);
        
        const filter = { _id: new ObjectId(id) };
        const update = {
          $set: {
            ...updatedTask
          }
        };
    
        const result = await taskCollection.updateOne(filter, update, {
          upsert: true
        });
    
        console.log("Update Result:", result);
    
        res.send(result);
      } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    
  //   app.put('/task/:id', async(req,res)=>{
  //     const id = req.params.id
  //     console.log("id", id);
  //     const updatedTask = req.body
  //     console.log(updatedTask);
  //      const filter = {_id : new ObjectId(id)}
  //      const update= {
  //         $set:{
  //             ...updatedTask
  //         }
  //      }
  //      const result = await taskCollection.updateOne(filter,update,{
  //         upsert: true
  //      })
  //      res.send(result)
  
  // })
    app.delete('/task/:id', async(req,res)=>{
        const id = req.params.id
        const query = {_id : new ObjectId(id)}
        const result = await taskCollection.deleteOne(query)
        res.send(result)
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

app.get('/', (req,res)=>{
    res.send("scc job task ongoing")
})


app.listen(port, ()=>{
    console.log(`port is running on ${port}`);
})