const validateUserAuth = (req, res, next) => {
    if(!req.body.email || !req.body.password) {
        res.status(400).json({
          success: false,
          data: {},
          message: "Something went wrong",
          err: 'Email or passoword missing in the request'
        });
    }
    next();
}

module.exports = {
    validateUserAuth
}