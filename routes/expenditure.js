const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const JSONbig = require('json-bigint');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

const prisma = new PrismaClient();
var { isAdmin ,ExpenditureAuthorization , protect } = require('../middleware/authMiddleware');

const jsonSerializer = JSONbig({ storeAsString: true });

// expenditure Report with date range filter
router.get('/',protect,ExpenditureAuthorization, async function (req, res, next) {
  try {
    const {startDate , endDate} = req.query

    if (!startDate || !endDate) {
      var startDateObj = new Date()
      var endDateObj = new Date()
    }
    else{
    var startDateObj = new Date(startDate);
    var endDateObj = new Date(endDate);
    }

    // Prisma query to retrieve expenditure records within the specified date range
    const allreceipt = await prisma.expenditureTbl.findMany({
      where: {
        ExpDate: {
          gte: startDateObj, // 'gte' means greater than or equal to the start date
          lte: endDateObj,   // 'lte' means less than or equal to the end date
        },
      },
      select: {
        ExpenseHeadsTbls: {
          select: {
            ExpenseID: true,
            ExpenseSubHead: true,
            ExpenseNature: true,
          },
        },
        ExpenditureID: true,
        ExpDate: true,
        Amount: true,
        Remarks: true,
        ExpenditureNature: true,
        PVNo: true,
        ModeOfPayment: true,
        ToPayee: true,
      },
    });

    const combinedData = allreceipt.map(item => {
      if (item.ExpenseHeadsTbls !== null) {
        const { ExpenseSubHead, ExpenseNature } = item.ExpenseHeadsTbls;
        return {
          id: item.ExpenditureID,
          Expense_Sub_Head : ExpenseSubHead,
          Expense_Nature : ExpenseNature, 
          Exp_Date: item.ExpDate.toISOString().split('T')[0],
          Amount: item.Amount,
          Remarks: item.Remarks,
          Expenditure_Nature: item.ExpenditureNature,
          PV_No: item.PVNo,
          Mode_Of_Payment: item.ModeOfPayment,
          To_Payee: item.ToPayee,
          
        };
      }
      else {
        return {
          id: item.ExpenditureID, 
          Exp_Date: item.ExpDate.toISOString().split('T')[0],
          Amount: item.Amount,
          Remarks: item.Remarks,
          Expenditure_Nature: item.ExpenditureNature,
          PV_No: item.PVNo,
          Mode_Of_Payment: item.ModeOfPayment,
          To_Payee: item.ToPayee,
        };
      }
    
    });
    

    
    console.log(combinedData)
    const serializedallreceipt = jsonSerializer.stringify(combinedData);

    

    res.send(serializedallreceipt);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


//Create Expenditure
router.post('/createExpenditure',protect,ExpenditureAuthorization, async function (req, res, next) {
  try {
    const {
      ExpenseMainHead,
      ExpenseSubHead,
      ExpenseNature,
      ExpDate,
      Amount,
      Remarks,
      ExpenditureNature,
      PVNo,
      ModeOfPayment,
      ToPayee,
      PayeeCNICNo,
      MobileNo,
    } = req.body;

    // First, create the ExpenseHeadsTbls record
    const newExpenseHead = await prisma.expenseHeadsTbls.create({
      data: {
        ExpenseMainHead,
        ExpenseSubHead,
        ExpenseNature,
      },
    });

    // Get the ID of the newly created expense head
    const ExpenseID = newExpenseHead.ExpenseID;

    // Now, create the ExpenditureTbl record with the ExpenseID
    const newExpenditure = await prisma.expenditureTbl.create({
      data: {
        ExpDate : ExpDate ?  new Date(ExpDate) : new Date(),
        Amount : parseInt(Amount),
        Remarks,
        ExpenditureNature,
        PVNo,
        ModeOfPayment,
        ToPayee,
        PayeeCNICNo,
        MobileNo,
        ExpenseID : parseInt(ExpenseID),
      },
    });

    console.log(newExpenditure);
    const serializednewExpenditure = jsonSerializer.stringify(newExpenditure);

    res.status(200).json(serializednewExpenditure);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


//Get 1 expenditure record
router.get('/details',protect,ExpenditureAuthorization, async function (req, res, next) {
  try {
    
    const {ExpenditureID} = req.query

    // Prisma query to retrieve expenditure records within the specified date range
    const receipt = await prisma.expenditureTbl.findFirst({
      where: {
        ExpenditureID:  parseInt(ExpenditureID),
      },
      select: {
        ExpenseHeadsTbls: {
          select: {
            ExpenseID: true,
            ExpenseSubHead: true,
            ExpenseNature: true,
            ExpenseMainHead : true
          },
        },
        ExpenditureID: true,
        ExpDate: true,
        Amount: true,
        Remarks: true,
        ExpenditureNature: true,
        PVNo: true,
        ModeOfPayment: true,
        ToPayee: true,
      },
    });

    const expenditure = {
      Expenditure_ID: receipt.ExpenditureID,
      Exp_Date: receipt.ExpDate.toISOString().split('T')[0],
      Amount: receipt.Amount,
      Remarks: receipt.Remarks,
      Expenditure_Nature: receipt.ExpenditureNature,
      PV_No: receipt.PVNo,
      Mode_Of_Payment: receipt.ModeOfPayment,
      To_Payee: receipt.ToPayee,
      // Conditional check to include properties from ExpenseHeadsTbls only if it's not null
      ...(receipt.ExpenseHeadsTbls !== null ? receipt.ExpenseHeadsTbls : {}),
    };
    

    const serializedallreceipt = jsonSerializer.stringify(expenditure);

    res.send(serializedallreceipt);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


//Update expenditure
router.put('/update',protect,isAdmin , async function (req, res, next) {
    try {
      const {
        ExpenseID,
        ExpenditureID,
        ExpenseMainHead,
        ExpenseSubHead,
        ExpenseNature,
        ExpDate,
        Amount,
        Remarks,
        ExpenditureNature,
        PVNo,
        ModeOfPayment,
        ToPayee,
        PayeeCNICNo,
        MobileNo,
        
      } = req.body;
  
      // Check if both ExpenseID and ExpenditureID are provided
      if (!ExpenseID || !ExpenditureID) {
        return res.status(400).json({
          success: false,
          message: 'Both ExpenseID and ExpenditureID are required in the request body.',
        });
      }
  
      // Update the ExpenditureTbl record with the provided data
      const updatedExpenditure = await prisma.expenditureTbl.update({
        where: {
          ExpenditureID: parseInt(ExpenditureID),
        },
        data: {
          ExpDate: new Date(ExpDate),
          Amount,
          Remarks,
          ExpenditureNature,
          PVNo,
          ModeOfPayment,
          ToPayee,
          PayeeCNICNo,
          MobileNo,
          ExpenseID: parseInt(ExpenseID)
        },
      });
  
      
      
      const updatedExpenseHead = await prisma.expenseHeadsTbls.update({
        where: {
          ExpenseID: parseInt(ExpenseID),
        },
        data: {
          ExpenseMainHead,
          ExpenseSubHead,
          ExpenseNature,
        },
      });

      console.log(updatedExpenditure);
      const serializedUpdatedExpenditure = jsonSerializer.stringify(updatedExpenditure);

      res.status(200).json(serializedUpdatedExpenditure);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  


module.exports = router;
