const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const client=require('./database')
const { ObjectId } = require('mongodb');
const db=client.db('lab3')
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const collection = db.collection('restful api')

app.use(express.json())


//Restful API
app.get('/', async(req, res) => {
   res.send('Welcome to Restful API')

})

app.post('/register',async(req,res)=>{
    //receive the username,email,password from the user
    const {username,email,password}=req.body
    //find the username and email whether is exist in database or not
    const user=await collection.findOne({username:username,email:email})
    if(!req.body.username || !req.body.password || !req.body.email) {
        //to prevent the user from not entering the field
        res.send('Please enter all fields')
    } else if(user) {
        //to prevent the user from registering the same username and email
        res.send('User already exists')
    } else {
        //registeration
        const hash=bcrypt.hashSync(password,10)
        await collection.insertOne(
            {
                username:req.body.username,
                email:req.body.email,
                password:hash
            }
        )
        res.send('User registered')
    }
})

app.post('/login', async (req, res) => {
//step #1 check if the user (username/email) exists in the database
    let result= await collection.findOne({ //findOne is a function that finds one data in the database
   
      username: req.body.username
    
    })
    if(result){ //result/user exists
    //step #2 check if the password is correct
    if (bcrypt.compareSync(req.body.password, result.password) == true){ //compare the password with the hashed password in the database
      var token = jwt.sign({ _id: result._id, username: result.username, }, 'nogizaka46password', { expiresIn: 60 * 60 });
      res.send(token)
    }
    else { //password is incorrect
      res.status(401).send('password incorrect')
    }
  }
    else { //not found
      res.send('user not found')
    }
})


app.patch('/renewpassword',verifyToken,async(req,res)=>{
    const {username,email,password,newpassword}=req.body
    const user=await collection.findOne({username:username})
    if(!username||!email || !password || !newpassword) {
        //ensure the user enter all field
        res.send('Please enter all fields');
    } else if(!user) {
        //find whether the email is valid or not
        res.send('email not found');
    } else if(bcrypt.compareSync(password, user.password) == false) {
        //ensure the password enter is correct
        res.send('Password incorrect');
    } else if(bcrypt.compareSync(password, user.password) == true) {
        const hash2 = bcrypt.hashSync(newpassword,10);
        //if the password enter is correct, renew the password
        await collection.updateOne(
            {username:username,email:email},
            {$set: {password:hash2}}
        );
        //notice the user that password is renewed
        res.send('password renewed');
    }
    
})

app.post('/getid',async(req,res)=>
{
    const{username,email,password}=req.body
    //ensure the user enter all field
     if(!username || !password || !email)
        {
            res.send('Please enter all fields')
        }
        else{
            //find the user in the database
            const user=await collection.findOne({username:username,email:email})
            if(!user)
                {
                    res.send('User does not exist')
        
                }
            else if(password==user.password)
                    {
                        //send the json file to the user
                        res.json(user)
                    }
                    else{
                        //the password is incorrect
                        res.send('Password incorrect')
                    
                    }
        }
    
})


app.delete('/user/:id', verifyToken, async (req, res) => {
    let result = await collection.deleteOne(
      {
        _id: new ObjectId(req.params.id)
      }
    )
    res.send(result)
  })


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })


  function verifyToken(req,res,next)
{
  const authHeader=req.headers.authorization
  const token=authHeader&&authHeader.split(' ')[1]
  if(token==null)
  {
    return res.status(401).send('Token missing');
  }
  jwt.verify(token,'nogizaka46password',(err,decoded)=>{
    console.log(err)
    if(err)
    {
        console.error(err);
        return res.status(403).send('Invalid token');
    }
    req.identify=decoded
    next()
  })
}

  
  


  
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

  

  
  