const express = require('express');
const app = express();

const bodyParser = require('body-parser');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const catSchema = new Schema({
  name: String,
  age: Number,
  gender: {type: String, enum: ['male', 'female']},
  color: String,
  weight: Number
});

const Cat = mongoose.model('cat', catSchema);

app.enable('trust proxy');

// Add a handler to inspect the req.secure flag (see 
// http://expressjs.com/api#req.secure). This allows us 
// to know whether the request was via http or https.
// https://github.com/aerwin/https-redirect-demo/blob/master/server.js
app.use (function (req, res, next) {
     if (req.secure) {
                 // request was via https, so do no special handling
                             next();
                                 } else {
                                             // request was via http, so redirect to https
                                                         res.redirect('https://' + req.headers.host + req.url);
                                                             }
                                                             });

mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/cat`).then(() => {
  console.log('Connected successfully.');
  app.listen(process.env.APP_PORT);
}, err => {
  console.log('Connection to db failed :( ' + err);
});

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/cat', (req, res) => {
  Cat.find()
    .where('age').gt(10)
    .where('weight').gt(10)
    .exec().then(
      d => {
      console.log(d);
      res.send(d);
    },
    err => {
      res.send('Error: ' + err);
    });
});

app.post('/cat', 
  bodyParser.urlencoded({extended: true}), 
  (req, res) => {
    console.log(req.body);
    Cat.create({
      name: req.body.name, 
      age: req.body.age, 
      gender: req.body.gender, 
      color: req.body.color,
      weight: req.body.weight
    }).then(c => {
      res.send('Cat created: ' + c.id);
    }, err => {
      res.send('Error: ' + err);
    });
  });
