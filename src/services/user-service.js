const UserRepository = require('../repository/user-repository.js')
const {JWT_KEY} = require('../config/serverConfig.js');

class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    async create(data) {
        try {
            const user = await this.userRepository.create(data);
            return user;
        } catch (error) {
            console.log("Error in create in user service");
            throw error;
        }
    }

    async getById(userId) {
        try {
            const user = await this.userRepository.getById(userId);
            return user;
        } catch (error) {
            console.log("Error in getById in user service");
            throw error;
        }
    }

    createToken(user) {
        try {
            const result = JWT_KEY.sign(user, JWT_KEY, {expiresIn: '1h'});
            return result;
        } catch (error) {
            console.log("Error in create token in token creation");
            throw error;
        }
    }

    verifyToken(token) {
        try {
            const response = jwt.verify(token, JWT_KEY);
            return response;
        } catch (error) {
            console.log("Error in verigying token in user service");
            throw error;
        }
    }
}

module.exports = UserService;