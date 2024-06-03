require("dotenv").config();
const express = require("express");
const path = require("path");
const compression = require("compression");
const bodyParser = require("body-parser");
const PORT = process.env.API_PORT;
const link = process.env.API_URL;
const Stripe = require('stripe');
const app = express();
const stripeSecretKey = process.env.STRIPE_SECRET;
const frontUrl = process.env.FRONT_URL;

app.use(bodyParser.json());
app.use(function (req, res, next) {
  const url = frontUrl || '*';
  res.header('Access-Control-Allow-Origin', url);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods','OPTIONS,GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  next();
});
app.use(compression());


app.post('/create-checkout-session', async (req, res) => {
  const stripe = Stripe(stripeSecretKey);
  const domain = link;
  //get product data
  const data = req.body;
  try {
      //create stripe session
    const session = await stripe.checkout.sessions.create({
        ...data,
          payment_method_types: ['card'],
          mode: 'payment',
          success_url: `${frontUrl}/payment-success`,
          cancel_url: `${frontUrl}/payment-cancel`,
          expand: ['payment_intent']
      });

      return res.send(session);
  } catch (err) {

    console.log(data);
      console.log('stripe error', err);
  }
});


app.listen(PORT, () => {
  console.log('\x1b[36m%s\x1b[0m', '\nExpress server has been started at the port ', PORT);
  console.log(`\n    Link to the site \x1b[35m${link}\x1b[0m`);
});
