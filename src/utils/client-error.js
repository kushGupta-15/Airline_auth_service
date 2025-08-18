const AppError = require('./error-handler.js');

class ClientError extends AppError {
    constructor(name, message, explanation, StatusCode) {
        super(name,message,explanation,StatusCode )
    }
}

module.exports = ClientError;