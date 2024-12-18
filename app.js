const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const spaRoutes = require('./routes/spa');
const errorController = require('./controllers/error');
const sequelize = require('./utils/database');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
require('./models/associations');
const logsRoutes = require('./routes/logs');

const app = express();

// Konfiguracja silnika widoków
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({ secret: 'DupaDupa_321', resave: false, saveUninitialized: false}));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')))
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/select2', express.static(path.join(__dirname, 'node_modules/select2/dist')));
app.use('/select2-bootstrap-5-theme', express.static(path.join(__dirname, 'node_modules/select2-bootstrap-5-theme')));

const eventsApiRoutes = require('./routes/eventsAPI');
const cardRoutes = require('./routes/card');
const employeeRoutes = require('./routes/employee');
const authRoutes = require('./routes/auth');
const operatorRoutes = require('./routes/operator');
const machineRoutes = require('./routes/machine');
const areaRoutes = require('./routes/area');
const worksheetAPIRoutes = require('./routes/worksheetAPI');
const accountRoutes = require('./routes/account');
const companyRoutes = require('./routes/company');
const allEventsRoutes = require('./routes/allEvents');

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', eventsApiRoutes);
app.use(spaRoutes);
app.use(cardRoutes);
app.use(employeeRoutes);
app.use(authRoutes);
app.use(operatorRoutes);
app.use(machineRoutes);
app.use(areaRoutes);
app.use(accountRoutes);
app.use(companyRoutes);
app.use(allEventsRoutes);
app.use('/api/worksheet', worksheetAPIRoutes);
app.use(logsRoutes);

app.use(errorController.get404);
sequelize.sync()
.then(result => {
    //console.log(result);
    // Uruchomienie serwera na porcie 3000
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running on port ${port} in ${process.env.NODE_ENV} mode`);
    });
})
.catch(err => {
    console.log(err);
});
