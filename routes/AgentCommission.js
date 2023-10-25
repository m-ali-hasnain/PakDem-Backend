const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const JSONbig = require('json-bigint');

const prisma = new PrismaClient();

const jsonSerializer = JSONbig({ storeAsString: true });

var { protect , isAdmin} = require('../middleware/authMiddleware')

router.get('/',protect,isAdmin, async function (req, res, next) {
  try {
    const {agentName} = req.query;
    const mainForms = await prisma.$queryRaw`
      SELECT
        main.ApplicationNo,
        main.FileNo as File_No,
        main.ApplicantName as Applicant_Name,
        main.TotalAmount as Total_Amount,
        main.CommissionPercentage as Commission_Percentage,
		main.GrandTotal as Down_Payment_Commission,
		(main.DownPayment * (CAST(main.GrandTotal AS DECIMAL) / 100)) as Down_Payment_Paid,
        (main.TotalAmount * (CAST(main.CommissionPercentage AS DECIMAL) / 100)) as Total_Commission,
		  (Select Sum(r.CommAmount) from ReceiptTbl r where r.ReceiptNo = main.ApplicationNo) as Amount_Paid
      FROM
        MainAppForm main
      INNER JOIN
        AgentTbl agent ON main.Agent = agent.AgentID
      WHERE
        agent.AgentName = ${agentName}
    `;

const commission = mainForms.map((mainForm) => {

  const totalCommission = parseInt(mainForm.Total_Commission) || 0;
  const amountPaid = parseInt(mainForm.Amount_Paid) || 0;
  const downPaymentPaid = parseInt(mainForm.Down_Payment_Paid) || 0;
  
  const balance = parseInt(totalCommission - downPaymentPaid - amountPaid);

  return {
    ApplicationNo: mainForm.ApplicationNo,
    File_No: mainForm.File_No,
    Applicant_Name: mainForm.Applicant_Name,
    Total_Amount: mainForm.Total_Amount,
    Commission_Percentage: mainForm.Commission_Percentage,
    Total_Commission: totalCommission,
    Down_Payment_Paid: downPaymentPaid,
    Down_Payment_Commission : mainForm.Down_Payment_Commission,
    Amount_Paid: amountPaid,
    Balance: balance
  };
});


    const jsonSerializer = JSONbig({ storeAsString: true });
    const serializedmainForms = jsonSerializer.stringify(commission);
    res.send(serializedmainForms);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
