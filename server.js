//node modules you'll need
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var graph = require('fbgraph');
var HashMap = require('hashmap');
var WordPos = require('wordpos');

var app = express();

app.use(bodyParser.json());

wordpos = new WordPos();

// this should really be in a config file!
var conf = {
    client_id:      '1343885155686997'
  , client_secret:  '30f48b68cb9d44d9c3d67f5861a82167'
  , scope:          'user_posts'
  // You have to set http://localhost:3000/ as your website
  // using Settings -> Add platform -> Website
  , redirect_uri:   'http://localhost:8080/auth'
};

app.use(express.static(__dirname + '/views'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//just render the index!
app.get('/', function(req, res) {
	res.render('index.html');
});

app.get('/auth', function(req, res) {

  // we don't have a code yet
  // so we'll redirect to the oauth dialog
  if (!req.query.code) {
    console.log("Performing oauth for some user right now.");

    var authUrl = graph.getOauthUrl({
        "client_id":     conf.client_id
      , "redirect_uri":  conf.redirect_uri
      , "client_secret": conf.client_secret
      , "scope":         conf.scope
    });

    if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
      res.redirect(authUrl);
    } else {  //req.query.error == 'access_denied'
      res.send('access denied');
    }
  }
  // If this branch executes user is already being redirected back with
  // code (whatever that is)
  else {
    console.log("Oauth successful, the code (whatever it is) is: ", req.query.code);
    // code is set
    // we'll send that and get the access token
    graph.authorize({
        "client_id":      conf.client_id
      , "redirect_uri":   conf.redirect_uri
      , "client_secret":  conf.client_secret
      , "code":           req.query.code
    }, function (err, facebookRes) {
      console.log(facebookRes);
      graph.setAccessToken(facebookRes.access_token);
      res.redirect('/getStatuses');
    });
  }
});


// grab facebook posts from user
app.get('/getStatuses', function(req, res) {
  getStatuses();
  res.render('adlibs.html');
});

app.get('/getAdLibs', function(req, res) {
  res.send(formAdLib());
});

app.post('/addWord', function(req, res) {
  categorizeWords([req.body.word]);
  res.sendStatus(200);
});

//listen at localhost 8080!
var server = http.createServer(app).listen(8080)

// Functions for creating dictionary + ad libs
var nouns = [];
var verbs = [];
var adjectives = [];
var adverbs = [];

function getStatuses() {
  graph.get('me', function(err, res) {
    userID = res.id.toString();
    graph.get('me/feed?fields=id,message,from&limit=500', function(err, res) {
      for (data of res.data) {
        messageID = data.id.toString().split("_")[0];
        if (data.message && messageID == userID) {
          var words = data.message.split(" "); // split string on spaces
          words.forEach(function(word, index, theArray){
            theArray[index] = word.replace(/\b[-.,:()&$#!\[\]{}"']+\B|\B[-.,()&$#!\[\]{}"']+\b/g, ""); // replace all beginning/ending special chars with white space
          });
          categorizeWords(words);
        }
      }
    });
  });
}

function categorizeWords(words) {
  var sentence = "";
  for (word of words) {
    word = word.toLowerCase();
    if (/^[a-z]+$/i.test(word)) {
      sentence = sentence.concat(" " + word);
    }
  }
  wordpos.getPOS(sentence, function(result) {
    for (noun of result.nouns) {
      nouns.indexOf(noun) === -1 ? nouns.push(noun) : console.log(noun + " is already mapped");
    }
    for (verb of result.verbs) {
      verbs.indexOf(verb) === -1 ? verbs.push(verb) : console.log(verb + " is already mapped");
    }
    for (adjective of result.adjectives) {
      adjectives.indexOf(adjective) === -1 ? adjectives.push(adjective) : console.log(adjective + " is already mapped");
    }
    for (adverb of result.adverbs) {
      adverbs.indexOf(adverb) === -1 ? adverbs.push(adverb) : console.log(adverb + " is already mapped");
    }
  });
}

function getWord(type) {
  switch(type) {
    case 'noun':
      return nouns[Math.floor(Math.random() * nouns.length)];
    case 'verb':
      return verbs[Math.floor(Math.random() * verbs.length)];
    case 'adjective':
      return adjectives[Math.floor(Math.random() * adjectives.length)];
    case 'adverb':
      return adverbs[Math.floor(Math.random() * adverbs.length)];
  }
}

function formAdLib() {
  var randNum = Math.floor(Math.random() * (6)) + 1;
  var adlib = "";
  switch(randNum) {
    case 0:
      verb = getWord('verb');
      adlib = adlib.concat(verb);
      break;
    case 1:
      noun = getWord('noun');
      verb = getWord('verb');
      adlib = adlib.concat(noun + " " + verb);
      break;
    case 2:
      noun1 = getWord('noun');
      verb = getWord('verb');
      noun2 = getWord('noun');
      adlib = adlib.concat(noun1 + " " + verb + " " + noun2);
      break;
    case 3:
      noun1 = getWord('noun');
      verb = getWord('verb');
      adjective = getWord('adjective');
      noun2 = getWord('noun');
      adlib = adlib.concat(noun1 + " " + verb + " " + adjective + " " + noun2);
      break;
    case 4:
      noun1 = getWord('noun');
      adverb = getWord('adverb');
      verb = getWord('verb');
      noun2 = getWord('noun');
      adlib = adlib.concat(noun1 + " " + adverb + " " + verb + " " + noun2);
      break;
    case 5:
      noun1 = getWord('noun');
      adverb = getWord('adverb');
      verb = getWord('verb');
      adjective = getWord('adjective');
      noun2 = getWord('noun');
      adlib = adlib.concat(noun1 + " " + adverb + " " + verb + " " + adjective + " " + noun2);
      break;
    case 6:
      noun = getWord('noun');
      adlib = adlib.concat(noun);
  }
  return adlib;
}
