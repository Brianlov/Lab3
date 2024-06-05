const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const { ObjectId } = require('mongodb');
const client=require('./database')
const db=client.db('lab3')
const collection = db.collection('restful api')

app.use(express.json())



app.get('/', async(req, res) => {
   res.send('Welcome to Restful API')

})

app.post('/register',async(req,res)=>{
    const {username,email,password}=req.body
    const user=await collection.findOne({username:username,email:email})
    if(user)
        {
            res.send('User already exists')

        }
    else if(!username||!password||!email)
        {
            res.send('Please enter all fields')
        }
    else{
        await collection.insertOne(
            {username:req.body.username,
            email:req.body.email,
            password:req.body.password
        }
        )
        res.send('User registered')
    }
})

app.patch('/renewpassword',async(req,res)=>{
    const {email,password,newpassword}=req.body
    const user=await collection.findOne({email:email})
    if(!user){
        res.send('email not found')
    }
    else if(user.password==password)
        {
            await collection.updateOne(
                {email:email},
                {$set:
                    {password:newpassword}
        })

            res.send('password renewed')
        }
})

app.post('/getid',async(req,res)=>
{
    const{username,email,password}=req.body
    
    if(!username||!password||!email)
        {
            res.send('Please enter all fields')
        }
        else{
            const user=await collection.findOne({username:username,email:email})
            if(!user)
                {
                    res.send('User does not exist')
        
                }
            else if(password==user.password)
                    {
                        
                        res.json(user)
                    }
                    else{
                        res.send('Password incorrect')
                    
                    }
        }
    
})
app.delete('/delete',async(req,res)=>{
    const {id}=req.body
    const user=await collection.findOne({_id:new ObjectId(id)})
    if(!user){
        res.send('User not found')
    
    }
    else{
        await collection.deleteOne({_id:id})
        res.send('User deleted')
    }

})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
  
  


  
  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      //await client.close();
    }
  }
  run().catch(console.dir);
  