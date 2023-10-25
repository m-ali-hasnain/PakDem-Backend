var express = require('express');
var router = express.Router();
var generateToken = require('../utils/generateToken')

const { PrismaClient } = require('@prisma/client');
const JSONbig = require('json-bigint');

const prisma = new PrismaClient();

const jsonSerializer = JSONbig({ storeAsString: true });

var { isAdmin,protect } = require('../middleware/authMiddleware')



router.post('/createUser',protect,isAdmin,async function (req, res, next) {
  try {
    const { UserName, Password, RolesID } = req.body;

    const newUser = await prisma.usersTbl.create({
      data: {
        UserName,
        Password,
        RolesID : parseInt(RolesID),
      },
    });

    res.status(200).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
})

router.post('/login', async function (req, res, next) {
  try {
    const { UserName, Password } = req.body;

    const user = await prisma.usersTbl.findFirst({
      where: {
        UserName,
      },
    });

    // If user not found, return error for incorrect username
    if (!user) {
      return res.status(401).json({ message: 'Incorrect username' });
    }

    // Compare the provided password with the password in the database
    if (user.Password !== Password) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // If user is found and password matches, return success response
    return res.status(200).json({
      user: user,
      token: generateToken(user.RolesID),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/mainFormActivities',protect,isAdmin, async function (req, res, next) {
  try {
    let result = await  prisma.$queryRaw
    `SELECT [id]
      ,[Date]
      ,[UsersTbl].UserName As Name
      ,[Applicant_Name] As Action
      ,[File_No]
      ,[Agent] as ID
      
    FROM [pakdempk].[dbo].[testtable]
    Join [pakdempk].[dbo].UsersTbl
    on testtable.Agent = UsersTbl.UserID
    where Receivied_Amount = 0
    `;
    

    const jsonSerializer = JSONbig({ storeAsString: true });

    const activities = result.map((res) => {
      return {
        id : res.id,
        date : res.Date?.toISOString().split('T')[0],
        Name : res.Name ,
        Action : res.Action,
        File_Number : res.File_No,
        Id : parseInt(res.ID ),
      };
      
    })

    // Serialize the BigInt values using json-bigint
    const serializedregistrations = jsonSerializer.stringify(activities);

    return res.send(serializedregistrations);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/receiptActivities',protect,isAdmin, async function (req, res, next) {
  try {
    let result = await  prisma.$queryRaw
    `SELECT [id]
      ,[Date]
      ,[UsersTbl].UserName As Name
      ,[Applicant_Name] As Action
      ,[File_No]
      ,[Agent] as ID
      
    FROM [pakdempk].[dbo].[testtable]
    Join [pakdempk].[dbo].UsersTbl
    on testtable.Agent = UsersTbl.UserID
    where Receivied_Amount = 1
    `;
    

    const jsonSerializer = JSONbig({ storeAsString: true });

    const activities = result.map((res) => {
      return {
        id : res.id,
        date : res.Date?.toISOString().split('T')[0],
        Name : res.Name ,
        Action : res.Action,
        File_Number : res.File_No,
        Id : parseInt(res.ID ),
      };
      
    })

    // Serialize the BigInt values using json-bigint
    const serializedregistrations = jsonSerializer.stringify(activities);

    return res.send(serializedregistrations);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/Receipts',protect,isAdmin, async function (req, res, next) {
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


module.exports = router;
