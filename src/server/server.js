const express     = require('express'),
      path        = require('path'),
      morgan      = require('morgan'), // logger
      mongoose    = require('mongoose'),
      bodyParser  = require('body-parser'),
      app         = express(),
      port        = 3000,
      models      = require('./models');
      
class Server {

  constructor() {
      this.initExpressMiddleWare();
      this.startServer();
  }

  startServer() {
    //Connection to database initialization
    mongoose.connect('mongodb://localhost:27017/OrderCartDB');
    var db = mongoose.connection;
    mongoose.Promise = global.Promise;

    console.log('Models connected in connections ' + models);

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
      console.log('Connected to MongoDB');
 
      const orderController = require('./controllers/shoppingcartController');
      const loginController = require('./controllers/loginController');
      app.use("/", orderController);
      app.use("/login", loginController);
      app.use("/signup", loginController);

      // all other routes are handled by Angular
      app.get('/*', function(req, res) {
        res.sendFile(path.join(__dirname,'/../../dist/index.html'));
      });

      app.listen(port, (err) => {
        console.log('Shopping Cart APP listening on port '+ port);
      });
    });
  }

  initExpressMiddleWare() {
    app.use('/', express.static(__dirname + '/../../dist'));
    app.use('/', express.static(__dirname + '/../public'));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(morgan('dev'));

    process.on('uncaughtException', (err) => {
        if (err) console.log(err, err.stack);
    });
  }
}

module.exports = new Server();