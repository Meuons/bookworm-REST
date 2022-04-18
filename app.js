//Initialization and declaring of constants
var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://dbUser:CghgFEWbEDlHgKeS@cluster0.mhn21.mongodb.net/webshop?authSource=admin&replicaSet=atlas-tm4gnn-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true', {useNewUrlParser: true});
mongoose.Promise = global.Promise;

const products = require('./products.json');
const orderResponse = require('./orderResponse.json');
var cors = require('cors')
const express = require('express')
bodyParser = require('body-parser');
const port = process.env.PORT || 3000
const request = require('request');
const app = express()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())
app.use(bodyParser.json());

const { report } = require('process');
const { application } = require('express');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


//Allow access from everywhere and specify allowed methods

app.all('/*', function(req, res, next) {
  res.header("Set-Cookie: cross-site-cookie=whatever; SameSite=None; Secure");
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE");
	next();
});





db.once('open', function (callback) {
    console.log("Database connection established!");

//Create a schema
    var productSchema = mongoose.Schema({
        title: String,
        price: Number,
        image: String,
        author: String,
        description: String,
    }); 
    const product = mongoose.model('product', productSchema )


   
    app.put('/products/:id', async (req, res) =>{
      
      let id = req.params.id;
 //Get the specified item
      const thisProduct = await product.findById(`${id}`)
      res.setHeader('description-Type','application/json');
   //Update the item with only the sent data so that no property becomes empty
    let bodyArr =[req.body.price,req.body.image, req.body.title, req.body.description, req.body.author]
    let productArr =[thisProduct .price,thisProduct.image, thisProduct .title, thisProduct.description, thisProduct .author]
    let newArr = []
    let obj = new Object
      for(i =0; i<bodyArr.length; i++){
        console.log(bodyArr[i])
        if(bodyArr[i] != undefined){
           newArr.push(bodyArr[i])
        }
        else{
          newArr.push(productArr[i])
        }
      }
      thisProduct.price = newArr[0]
      thisProduct.image = newArr[1]
      thisProduct.title = newArr[2]
      thisProduct.description = newArr[3]
      thisProduct.author = newArr[4]
      thisProduct.save(function(err) {
            if(err) return console.error(err);
        });

  res.json(thisProduct);
        console.log('Response =>', product)
       
     })

//Get all of the items
    app.get('/', async (req, res) => {
        const products = await product.find({})
        console.log('Response =>', products)
        res.json(products)
    })

    
//Remove a specific item
app.delete('/products/:id', async (req, res) =>{
    let id = req.params.id;
 
    const thisProduct = await product.findById(`${id}`)
      console.log('Response =>', thisProduct )
      product.deleteOne(thisProduct, function(err, obj) {
        if (err) throw err;
        res.json(`product ${id} deleted`);
     
      })

})
//Get a specific item
    app.get('/products/:id', async (req, res) =>{
    
     let id = req.params.id;

     const products = await product.findById(`${id}`)
       console.log('Response =>', products)
      res.json(products);
    })

//Post an item
     app.post('/products', (req, res) => {
      res.setHeader('description-Type','application/json');
//Create a new object with the sent properties
        var product1 = new product({ 
      price: req.body.price,
      image: req.body.image,
      title: req.body.title,
      description: req.body.description, 
      author: req.body.author, 
  });	
    product1.save(function(err) {
        if(err) return console.error(err);
    });
    res.json(products)
  })
    


});



app.post('/checkout', (req, res) => {
    let body = JSON.stringify(req.body);
    const info = JSON.parse(body);
    console.log(info)
  const request = require('request');
  const options = {
    body: body,
    method: 'post',
    url: 'https://api.playground.klarna.com/checkout/v3/orders',
    headers: {
      'Authorization': 'Basic ' + 'UEs1Mjg4N180MGIyZjE3NWU1ZDM6VWJXbmM2RVhvQk1JQUNZZw==' ,
      'Content-type' : 'application/json'
    }
  };

//body = `{"purchase_country":"GB","purchase_currency":"GBP","locale":"en-GB","order_amount":50000,"order_tax_amount":4545,"order_lines":[{"type":"physical","reference":"19-402-USA","name":"Red T-Shirt","quantity":5,"quantity_unit":"pcs","unit_price":10000,"tax_rate":1000,"total_amount":50000,"total_discount_amount":0,"total_tax_amount":4545}],"merchant_urls":{"terms":"https://www.example.com/terms.html","checkout":"https://www.example.com/checkout.html?order_id={checkout.order.id}","confirmation":"https://www.example.com/confirmation.html?order_id={checkout.order.id}","push":"https://www.example.com/api/push?order_id={checkout.order.id}"}}`
  function callback(error, response, body) {
  
    if (!error && response.statusCode == 201) {
      const info = JSON.parse(body);
      let htmlSnippet =
        info.html_snippet
      
      res.json(info)
      console.log(info.stargazers_count + " Stars");
      console.log(info.forks_count + " Forks");
    }
    else{  


     console.log( 'code' + response.statusCode)
     console.log( 'body' + body)
      /* console.log( 'response' + response)
      console.log('error' + error)
      */
    }
  }
  request(options, callback);
  
  
});
app.get('/confirmation/:id', async (req, res) =>{
    
  let id = req.params.id;


const request = require('request');
const options = {
  method: 'get',
  url: 'https://api.playground.klarna.com/checkout/v3/orders/' + id,
  headers: {
    'Authorization': 'Basic ' + 'UEs1Mjg4N180MGIyZjE3NWU1ZDM6VWJXbmM2RVhvQk1JQUNZZw==' ,
    'Content-type' : 'application/json'
  }
};
function callback(error, response, body) {
  
  if (!error && response.statusCode == 200) {
    const info = JSON.parse(body);
  
    res.json(info)
    console.log(info.stargazers_count + " Stars");
    console.log(info.forks_count + " Forks");
  }
  else{  


   console.log( 'code' + response.statusCode)
   console.log( 'body' + body)
    /* console.log( 'response' + response)
    console.log('error' + error)
    */
  }
}
request(options, callback);
 })
 
 app.post('/KlarnaCheckout', (req, res) => {
  let body = JSON.stringify(req.body);
  const info = JSON.parse(body);
  console.log(info)
  const request = require('request');
  const options = {
      body: body,
      method: 'post',
      url: 'https://api.playground.klarna.com/checkout/v3/orders',
      headers: {
          'Authorization': 'Basic ' + 'UEs1Mjg4N180MGIyZjE3NWU1ZDM6VWJXbmM2RVhvQk1JQUNZZw==',
          'Content-type': 'application/json'
      }
  };


  function callback(error, response, body) {

      if (!error && response.statusCode == 201) {
          const info = JSON.parse(body);
          let htmlSnippet =
              info.html_snippet

          res.json(info)
          console.log(info.stargazers_count + " Stars");
          console.log(info.forks_count + " Forks");
      } else {


          console.log('code' + response.statusCode)
          console.log('body' + body)
      }
  }
  request(options, callback);


});

function getBearer(){
  

  
  const request = require('request');
  let token = 'error';
  const options = {
    method: 'get',
    body: new URLSearchParams({
      'grant_type': 'client_credentials'
  }),
    url: "https://api.sandbox.paypal.com/v1/oauth2/token",
    headers: {
      'Authorization': 'Basic ' + 'QVR3SkRuSGdPcm9tXzdiOU1SSnRDQXVaR2FEZWxHVWxQb3U3ajcxTnpOLV82cEo0M2t5TmJnYm94eTRIYTBJMHNtNFNURmRQZDlFUUozc0o6RUE3NWhIQUZyT2ZFWms4VV9PMng2MXE4NW4zTThlOVM1cnk0YmRBcVdKUWpubFZvNGRqOVBmYWhDWmZ5Q0I0cHpnRVgxczhFVVFEYjFOQW0=',
    }
  };
  function callback(error, response, body) {
    console.log(response.statusCode)
    console.log(body)
    console.log(error)
    
    if (!error && response.statusCode == 200) {
      const info = JSON.parse(body);
      token = 'tokenbody:' + body;
    }
    else{  
  
  
     console.log( 'code' + response.statusCode)
     console.log( 'body' + body)
     token = response.statusCode + body
      /* console.log( 'response' + response)
      console.log('error' + error)
      */
    }
  };
  request(options, callback);
  console.log(token)
  return token;
   
}

app.post('/paypalcreateorder', (req, res) => {
let body = JSON.stringify(req.body);
const info = JSON.parse(body);

const request = require('request');
const options = {
    body: body,
    method: 'post',
    url: 'https://api-m.sandbox.paypal.com/v2/checkout/orders',
    headers: {
        'Authorization': 'Bearer ' + 'A21AAI2ve7yq3c1JRFrQlKlaIJgQvSXlgN8_X6IOMNcbzA2m42WMXRSVkoEsG4zAVMNsDf9pH11GlE_gB5CIA-QMQ2Aqr7yxw',
        'Content-type': 'application/json'
    }
};


function callback(error, response, body) {

    if (!error && response.statusCode == 201) {
        const info = JSON.parse(body);
       

        res.json(info)
        console.log(info.stargazers_count + " Stars");
        console.log(info.forks_count + " Forks");
    } else {


        console.log('code' + response.statusCode)
        console.log('body' + body)
    }
}
request(options, callback);


});
app.post('/paypalapproveorder', (req,res) =>{
  let body = JSON.stringify(req.body);
let data = JSON.parse(body)
const options = {
  method: 'get',
  url: data.links[1].href,
  headers: {
      'Authorization': 'Bearer ' + 'A21AAI2ve7yq3c1JRFrQlKlaIJgQvSXlgN8_X6IOMNcbzA2m42WMXRSVkoEsG4zAVMNsDf9pH11GlE_gB5CIA-QMQ2Aqr7yxw',
      'Content-type': 'application/json'
  }
};

function callback(error, response, body) {

  if (!error && response.statusCode == 200) {

     

      res.json(body)

  } else {


      console.log('code' + response.statusCode)
      console.log('body' + body)
  }
}
request(options, callback);
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})