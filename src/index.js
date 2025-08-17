const express = require('express');
const { PORT } = require("./config/serverConfig.js");
const apiRoutes = require('./routes/index.js');
const app = express();

const prepareAndStartServer = () => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/api', apiRoutes);

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

prepareAndStartServer();