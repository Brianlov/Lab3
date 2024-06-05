const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
  const uri = "mongodb+srv://brian:20010808@cluster0.ge03xw3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  
  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  module.exports=client