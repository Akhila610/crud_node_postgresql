const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 8080;
const cors = require('cors'); // Import the cors package
const db = require('./database-controllers.js')
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

// Enable CORS for all routes
app.use(cors());

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

passport.use('local', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true //passback entire req to call back
} , (request, username, password, done) => {
      console.log(username+' = '+ password);
      if(!username || !password ) { return done(null, false, request.flash('message','All fields are required.')); }
      const pro = db.login(username,password);
      pro.then((rows) => {
        console.log(`result:*************************** ${JSON.stringify(rows)}`);
        if(!rows.length){ return done(null, false,{ message: 'Incorrect username.' });}
        request.session.user = rows[0];
        return done(null, rows[0]);
      })
      .catch((error) => {
        return done(null, false, { message: 'Incorrect password.' });
      })
    }
));
passport.serializeUser((user, done) => {
  done(null, user.id);
});


passport.deserializeUser((id, done) => {
  console.log("deserializeUser:id is " + id);
   db.getUserWithID(id)
    .then((rows) => {
      console.log(`deserializeUser:rows: ${JSON.stringify(rows)}`);
        if(rows && rows.length > 0) {
          // done(err, rows[0]);
          console.log(" deserialse user "+ rows[0])
          console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
          done(null, rows[0])
        }
    })
    .catch((error) => {
      console.log(error);
    })
});

/*(app.post('/login',
  passport.authenticate('local',{
                                  successRedirect: '/success',
                                  failureRedirect: '/login?failed=true'}
                        )
);*/

app.post('/login', (req, res, next) => {
  const resultJs = {};
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // Authentication failed
      const result = {
        message: 'Authentication failed',
        data:null
      }
      return res.status(401).json(result);

    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.session.user = user;
      console.log(" user detaisl "+ JSON.stringify(user))

        const result = {
          message: 'Login successfully',
          userid: user.id,
          username:user.username,
          role:user.role
           // Assuming req.user contains user data
        };
        res.json(result);
        //return res.send(resultJs)
      
      //return res.json({ success: true, message: 'Authentication successful' });

    });
  })(req, res, next);
});
const router = express.Router();

/*/ Login route
/router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard', // Redirect to a protected page on success
  failureRedirect: '/login',    // Redirect to the login page on failure
  failureFlash: true,
}));

// Logout route
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});
module.exports = router;*/
app.get('/', (request, response) => {
    response.send("test backend url")
  })
  app.get('/getusers', db.getUsers)
  app.get('/users/:id', db.getUserById)
  app.post('/register', db.createUser)
  app.post('/insert-fetch', db.insertfetch)
  //app.post('/login', db.loginUser)
  app.put('/users/:id', db.updateUser)
  app.delete('/users/:id', db.deleteUser)
  
  app.listen(port, () => {
    console.log(`App running on port ${port}.`)
  })