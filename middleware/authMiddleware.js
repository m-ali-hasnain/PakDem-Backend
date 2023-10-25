var jwt = require('jsonwebtoken')
require('dotenv').config();
const {SECRET_KEY} = process.env

var asyncHandler = require('express-async-handler')


const protect = asyncHandler(async (req, res, next) => {
  let token
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]
      
      const decoded = await jwt.verify(token, SECRET_KEY)


      return next()
    } catch (error) {
      console.error(error)
      return res.status(401)
      throw new Error('Not authorized, token failed')
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: `Not Authorized No Token.`
    });
  }
})


const isAdmin = asyncHandler(async (req, res, next) => {
  let token;
  

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token =  req.headers.authorization.split(' ')[1];
      
      const decoded = await jwt.verify(token, SECRET_KEY);

   
      
      if (decoded.RoleId === 1 || decoded.RoleId === 4) {
        // Check if the roleid is 1 (Admin)
        return next();
      } else {
        return res.status(401).json({
          success: false,
          message: `UnAuthorized Token.`
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        success: false,
        message: `Not Authorized or Token Failed.`
      });
    }
  }

  if (!token) {
   return res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const ExpenditureAuthorization = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, SECRET_KEY);

      
      if (  
            decoded.RoleId === 1 ||
            decoded.RoleId === 4 || 
            decoded.RoleId === 3  
          ) 
        {
        next();
        } else {
        res.status(401).json({
          success: false,
          message: `UnAuthorized Token.`
        });
      }
    } catch (error) {
      console.error(error);
      res.status(401).json({
        success: false,
        message: `Not Authorized or Token Failed.`
      });
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});




module.exports = { protect ,isAdmin ,ExpenditureAuthorization }
