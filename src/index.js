const express = require('express');
const { PORT } = require("./config/serverConfig.js");
const apiRoutes = require('./routes/index.js');
// const db = require('./models/index');
const {User, Role} = require('./models/index.js');
const app = express();

const prepareAndStartServer = () => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/api', apiRoutes);

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