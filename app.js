//Initialization and declaring of constants
var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://dbUser:CghgFEWbEDlHgKeS@cluster0.mhn21.mongodb.net/MovieReviewDB?authSource=admin&replicaSet=atlas-tm4gnn-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true', {useNewUrlParser: true});
mongoose.Promise = global.Promise;
const reviews = require('./reviews.json');
var cors = require('cors')
const express = require('express')
bodyParser = require('body-parser');
const port = process.env.PORT || 3000

const app = express()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())
app.use(bodyParser.json());

const { report } = require('process');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


//Allow access from everywhere and specify allowed methods

app.all('/*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE");
	next();
});





db.once('open', function (callback) {
    console.log("Database connection established!");

//Create a schema
    var reviewSchema = mongoose.Schema({
        creator: String,
        movie: String,
        title: String,
        content: String,
        rating: String
    }); 
    var Review = mongoose.model('Review', reviewSchema )


   
    app.put('/reviews/:id', async (req, res) =>{
      
      let id = req.params.id;
 //Get the specified item
      const review = await Review.findById(`${id}`)
      res.setHeader('Content-Type','application/json');
   //Update the item with only the sent data so that no property becomes empty
    let bodyArr =[req.body.creator,req.body.movie, req.body.title, req.body.content, req.body.rating]
    let reviewArr =[review.creator,review.movie, review.title, review.content, review.rating]
    let newArr = []
    let obj = new Object
      for(i =0; i<bodyArr.length; i++){
        console.log(bodyArr[i])
        if(bodyArr[i] != undefined){
           newArr.push(bodyArr[i])
        }
        else{
          newArr.push(reviewArr[i])
        }
      }
review.creator = newArr[0]
review.movie = newArr[1]
review.title = newArr[2]
review.content = newArr[3]
review.rating= newArr[4]
 review.save(function(err) {
            if(err) return console.error(err);
        });

  res.json(review);
        console.log('Response =>', review)
       
     })

//Get all of the items
    app.get('/', async (req, res) => {
        const reviews = await Review.find({})
        console.log('Response =>', reviews)
        res.json(reviews)

    })
//Remove a specific item
app.delete('/reviews/:id', async (req, res) =>{
    let id = req.params.id;
 
    const review = await Review.findById(`${id}`)
      console.log('Response =>', review)
      Review.deleteOne(review, function(err, obj) {
        if (err) throw err;
        res.json(`review ${id} deleted`);
     
      })

})
//Get a specific item
    app.get('/reviews/:id', async (req, res) =>{
    
     let id = req.params.id;

     const review = await Review.findById(`${id}`)
       console.log('Response =>', review)
      res.json(review);
    })

//Post an item
     app.post('/reviews', (req, res) => {
      res.setHeader('Content-Type','application/json');
//Create a new object with the sent properties
        var review1 = new Review({ 
      creator: req.body.creator,
      movie: req.body.movie,
      title: req.body.title,
      content: req.body.content, 
      rating: req.body.rating
  });	
    review1.save(function(err) {
        if(err) return console.error(err);
    });
    res.json(reviews)
  })
    


});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})