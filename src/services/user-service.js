const UserRepository = require("../repository/user-repository.js");
const { JWT_KEY } = require("../config/serverConfig.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async create(data) {
    try {
      const user = await this.userRepository.create(data);
      return user;
    } catch (error) {
      console.log("Error in create in user service", error);
      throw error;
    }
  }

    async signIn(email, plainPassword) {
      try {
        const user = await this.userRepository.getByEmail(email);
        const passwordMatch = this.checkPassword(plainPassword, user.password);
        if(!passwordMatch) {
            console.log("Password doesn't match");
            throw {error: 'Incorrect Password'};
        }
        const newJWT = this.createToken({email: user.email, id:user.id});
        return newJWT;
        
      } catch (error) {
        console.log("Error in signIn in user service", error);
        throw error;
      }
    }

  createToken(user) {
    try {
      const result = jwt.sign(user, JWT_KEY, { expiresIn: "1h" });
      return result;
    } catch (error) {
      console.log("Error in create token in token creation", error);
      throw error;
    }
  }

  verifyToken(token) {
    try {
      const response = jwt.verify(token, JWT_KEY);
      return response;
    } catch (error) {
      console.log("Error in verifying token in user service", error);
      throw error;
    }
  }

  checkPassword(userInputPlainPassword, encryptedPassword) {
    try {
      return bcrypt.compareSync(userInputPlainPassword, encryptedPassword);
    } catch (error) {
      console.log("Error in checking password in user service", error);
      throw error;
    }
  }

  async isAuthenticated(token) {
    try {
      const response = this.verifyToken(token);
      if(!response) {
        throw {error: 'Invalid token'}
      }

      const user = await this.userRepository.getById(response.id);
      if(!user) {
        throw {error: 'No user with the corresponding token exists'}
      }
    } catch (error) {
      console.log("Error in checking authenticated user in user service", error);
      throw error;
    }
  } 
}

module.exports = UserService;
