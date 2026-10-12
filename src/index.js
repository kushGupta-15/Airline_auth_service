const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { PORT } = require("./config/serverConfig.js");
const apiRoutes = require('./routes/index.js');
const db = require('./models/index.js');
const {User, Role} = require('./models/index.js');
const app = express();

const prepareAndStartServer = () => {
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/api', apiRoutes);

    app.get('/health', async (req, res) => {
        try {
            await db.sequelize.authenticate();
            return res.status(200).json({
                service: 'Airline_auth_service',
                status: 'UP',
                database: 'CONNECTED',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            return res.status(503).json({
                service: 'Airline_auth_service',
                status: 'DEGRADED',
                database: 'DISCONNECTED',
                error: error.message
            });
        }
    });

    app.listen(PORT, async () => {
        console.log(`Server is running on port ${PORT}`);
        // if(process.env.DB_SYNC) {
        //     db.sequelize.sync({alter: true});
        // }

        // const u1 = await User.findByPk(2);
        // const r1 = await Role.findByPk(1);
        // u1.addRole(r1);
    });
}

prepareAndStartServer();