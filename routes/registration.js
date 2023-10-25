var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const JSONbig = require('json-bigint');

const prisma = new PrismaClient();
const jsonSerializer = JSONbig({ storeAsString: true });
var {isAdmin, protect } = require('../middleware/authMiddleware');
const { all } = require('./PlotPrice');

router.get('/',protect, async function (req, res, next) {
  try {
    const allregistrations = await prisma.registrationTbl.findMany({
      where :{
        RegistrationAs : 2
      }
    });
    const jsonSerializer = JSONbig({ storeAsString: true });

    const registrations = allregistrations.map((reg) => {
      return {
        RegisterationID : reg.RegisterationID,
        Registration_Date : reg.RegistrationDate?.toISOString().split('T')[0],
        Name : reg.Name,
        Company_Name : reg.CompanyName,
        Company_Address : reg.CompanyAddress,
        Office_No : reg.OfficeNo,
        Contact_No : reg.ContactNo,
        Email: reg.Email


      }
    })

    // Serialize the BigInt values using json-bigint
    const serializedregistrations = jsonSerializer.stringify(registrations);

    res.send(serializedregistrations);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//Get 1 Registered Investor
router.get('/details', protect,isAdmin,async function (req, res, next) {
  try {

    const { RegisterationID  } =  req.query

    const allAgents = await prisma.registrationTbl.findFirst({
      where : {
        RegisterationID  : parseInt(RegisterationID )
      }
    });

    const investor = {
      Registeration_ID   :allAgents ? allAgents.RegisterationID    :"Not Found",
      Name: allAgents.Name,
      Registration_Date : allAgents.RegistrationDate?.toISOString().split('T')[0],
      CNIC_No : allAgents.CNICNo,
      Spouse_Name : allAgents.SpouseName,
      Company_Name: allAgents.CompanyName,
      Company_Address : allAgents.CompanyAddress,
      Office_Phone_No: allAgents.OfficeNo ,
      Contact_No : allAgents.ContactNo,
      Email : allAgents.Email,
      User_Name : allAgents.UserName,


    }

    const jsonSerializer = JSONbig({ storeAsString: true });

    // Serialize the BigInt values using json-bigint
    const serializedallAgents = jsonSerializer.stringify(investor);

    res.send(serializedallAgents);

  } catch (error) {
    console.error(error);
    next(error);
  }
});

//create
router.post('/createRegistration', protect,isAdmin,async function (req, res, next) {
  try {
    const {
      RegistrationDate,
      Name,
      CNICNo,
      SpouseName,
      CompanyName,
      CompanyAddress,
      OfficeNo,
      ContactNo,
      Email,
      RegistrationAs,
      UserName,
      Password,
    } = req.body;

    const data = {
      RegistrationDate : RegistrationDate ? new Date(RegistrationDate) : new Date(),
      Name,
      CNICNo,
      SpouseName,
      CompanyName,
      CompanyAddress,
      OfficeNo,
      ContactNo,
      Email,
      RegistrationAs : RegistrationAs ? parseInt(RegistrationAs) : 2,
      UserName,
      Password,
    };

    console.log(data);

    const newRegistration = await prisma.registrationTbl.create({
      data: data,
    });

    console.log(newRegistration);
    const serializedNewRegistration = jsonSerializer.stringify(newRegistration);

    res.status(200).json(serializedNewRegistration);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


router.put('/updateRegistration', protect , isAdmin, async function (req, res, next) {
  try {
    const {
      RegisterationID,
      RegistrationDate,
      Name,
      CNICNo,
      SpouseName,
      CompanyName,
      CompanyAddress,
      OfficeNo,
      ContactNo,
      Email,
      RegistrationAs,
      UserName,
      Password,
    } = req.body;

    const data = {
      RegistrationDate : new Date(RegistrationDate),
      Name,
      CNICNo,
      SpouseName,
      CompanyName,
      CompanyAddress,
      OfficeNo,
      ContactNo,
      Email,
      RegistrationAs,
      UserName,
      Password,
    };

    console.log(data);

    const updateRegistration = await prisma.registrationTbl.update({

      where:{
        RegisterationID : parseInt(RegisterationID),
      } ,
      data: data,
    });

    console.log(updateRegistration);
    const serializedupdateRegistration = jsonSerializer.stringify(updateRegistration);

    res.status(200).json(serializedupdateRegistration);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

//Delete 
router.delete('/delete', protect,isAdmin, async function (req, res, next) {
  try {

    const  { RegisterationID  } = req.body

    const allregisteration = await prisma.registrationTbl.delete({
      where:{
        RegisterationID : parseInt(RegisterationID),
      }
    });
    res.status(200).json({
      success: true,
      message: `Registeration of Investor with RegisterationID ${RegisterationID} has been deleted successfully.`
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});


module.exports = router;
