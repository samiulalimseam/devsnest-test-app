// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import mongoose from "mongoose";
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv'
dotenv.config()





import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
app.use(express.json())



// MongoDb Configuration----------------------------------------------------------
const uri = `mongodb+srv://globaldesk:tc7YtS0wudIHdUAK@cluster0.flmxcne.mongodb.net/?retryWrites=true&w=majority`;
mongoose
  .connect(uri)
  .then(() => console.log('db connected'))
  .catch(() => console.log('error not connected'))

//user schema---
const usersSchema = new mongoose.Schema({
  username: String,
  age: Number

})

const User = mongoose.model('User', usersSchema)


async function run() {
  try {
    // Retrieve all users from the database
    app.get('/api/getuser', async (_req, res) => {
      
      
      const response = await User.find({});
      res.send(response)
    })

// insert user into Db
    app.post('/api/createuser', async (req, res)=> {
      
      const user = new User(req.body);
      const result = await user.save();
      
      res.send(result);
    })

// delete user by objectID
app.post('/api/deleteuser', async(req,res)=> {
  const userId =(req.body);
 
  const result = await User.deleteOne({_id: new ObjectId(userId)})
  console.log(userId);
  res.send(result)
  
  
})

  }
  finally {

  }

}
run().catch(error=> console.log(error));







//-------------------------------------------------------------








// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());



app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
