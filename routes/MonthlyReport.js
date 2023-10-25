const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const JSONbig = require('json-bigint');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
var { ExpenditureAuthorization, protect } = require('../middleware/authMiddleware')
const prisma = new PrismaClient();
const jsonSerializer = JSONbig({ storeAsString: true });

// Month wise Report
router.get('/', protect,ExpenditureAuthorization, async function (req, res, next) {
  try {

    const { startDate, endDate } = req.query;


    if (!startDate || !endDate) {
      return res.status(400).send('Both start date and end date are required.');
    }

    // Convert the start and end dates to JavaScript Date objects
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Month Wise
    const monthWiseReportQuery = await prisma.$queryRaw`
    SELECT [Date] As ID , [Date], [Total_Received_Amount], [Office_Expence], [Net_Amount]
    FROM [pakdempk].[dbo].[MonthWiseReport]
    WHERE [Date] >= ${startDateObj} AND [Date] <= ${endDateObj};
    `;

    //mode of Payment sum data
    const totalReceivedAmountQuery = await prisma.$queryRaw`
    SELECT [ModeOfPayment], SUM([ReceivedAmount]) AS TotalReceivedAmount
    FROM [pakdempk].[dbo].[ReceiptTbl]
    WHERE [Date] >= ${startDateObj} AND [Date] <= ${endDateObj}
    GROUP BY [ModeOfPayment];
    `;

    //Administration Expense
    const totalExpenditureQuery = await prisma.$queryRaw`
    SELECT SUM(ET.[Amount]) AS TotalExpenditure
    FROM [pakdempk].[dbo].[ExpenditureTbl] AS ET
    JOIN [pakdempk].[dbo].[ExpenseHeadsTbls] AS EH ON ET.[ExpenseID] = EH.[ExpenseID]
    WHERE EH.[ExpenseSubHead] = 'Administration Expenditures'
        AND ET.[ExpDate] >= ${startDateObj} AND ET.[ExpDate] <= ${endDateObj};
    `;

    const CostOfLand = await prisma.$queryRaw`
    SELECT SUM(ET.[Amount]) AS TotalCostOfLand
    FROM [pakdempk].[dbo].[ExpenditureTbl] AS ET
    JOIN [pakdempk].[dbo].[ExpenseHeadsTbls] AS EH ON ET.[ExpenseID] = EH.[ExpenseID]
    WHERE EH.[ExpenseNature] = 'Cost of Land' AND ET.ExpDate >= ${startDateObj} AND ET.ExpDate <= ${endDateObj};
    `;

    const SiteDevelopmentCost = await prisma.$queryRaw`
    SELECT SUM(ET.[Amount]) AS SiteDevelopmentCost
    FROM [pakdempk].[dbo].[ExpenditureTbl] AS ET
    JOIN [pakdempk].[dbo].[ExpenseHeadsTbls] AS EH ON ET.[ExpenseID] = EH.[ExpenseID]
    WHERE EH.[ExpenseNature] = 'Development Expense' AND ET.ExpDate >= ${startDateObj} AND ET.ExpDate <= ${endDateObj};
    `;


    const MonthlyR = monthWiseReportQuery.map(item => ({
      ...item,
      Date: item.Date.toISOString().split('T')[0],
    }));


    const result = {

    monthWiseReport: MonthlyR
                        ? MonthlyR : 0,

    totalReceivedAmount: totalReceivedAmountQuery
                        ? totalReceivedAmountQuery : 0,

    AdministrationExpense: totalExpenditureQuery[0].TotalExpenditure
                        ? totalExpenditureQuery[0].TotalExpenditure : 0,

    CostOfLand : CostOfLand[0].TotalCostOfLand 
                        ? CostOfLand[0].TotalCostOfLand : 0 ,

    SiteDevelopmentCost : SiteDevelopmentCost[0].SiteDevelopmentCost  
                        ? SiteDevelopmentCost[0].SiteDevelopmentCost  : 0
    };


  
    const serializedallresult = jsonSerializer.stringify(result);

    res.send(serializedallresult);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/Create', protect,ExpenditureAuthorization, async function (req, res, next) {
  try {

    const {
      date,
      Total_Received_Amount,
      Office_Expence
    } = req.body

    const data = {
      Date : date ? new Date(date) : new Date() ,
      Office_Expence : parseInt(Office_Expence),
      Net_Amount : parseInt(Total_Received_Amount) - parseInt(Office_Expence),
      Total_Received_Amount : parseInt(Total_Received_Amount) ,
    }

    const monthReport = await prisma.monthWiseReport.create({
      data : data
    })

    return res.status(200).send('Created')

  } catch (error) {

    return res.status(500).send('Internal Server Error');
  }
});


module.exports = router;