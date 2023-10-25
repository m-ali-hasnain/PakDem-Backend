const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const JSONbig = require('json-bigint');

const jsonSerializer = JSONbig({ storeAsString: true });

const prisma = new PrismaClient();

var {isAdmin, protect } = require('../middleware/authMiddleware')

router.get('/',protect,isAdmin, async function (req, res, next) {
  try {
    const {agentName} = req.query;

    const mainForms = await prisma.$queryRaw`
      SELECT 
        m.ApplicationNo,
        m.Date,
        m.FileNo,
        m.Area,
        m.PlotNo,
        m.TotalAmount,
        m.DownPayment,
        m.ApplicantName,
        (SELECT SUM(r.ReceivedAmount) FROM ReceiptTbl r WHERE r.ReceiptNo = m.ApplicationNo) AS Received_Amount
        FROM
            MainAppForm m
        JOIN
            AgentTbl a ON m.Agent = a.AgentID
        WHERE
            a.AgentName = ${agentName};
    `;


    const records = mainForms.map((mainForm) => {
      return {
        ApplicationNo: mainForm.ApplicationNo,
        Date: mainForm.Date?.toISOString().split('T')[0],
        File: mainForm.FileNo,
        Applicant_Name: mainForm.ApplicantName,
        Plot_Size: mainForm.Area,
        Plot: mainForm.PlotNo,
        Total_Amount: mainForm.TotalAmount,
        Down_Payment: mainForm.DownPayment,
        Received_Amount : mainForm.Received_Amount,
        Balance_Due   : (parseInt(mainForm.TotalAmount) - parseInt(mainForm.Received_Amount))

        
      }
    })
    const jsonSerializer = JSONbig({ storeAsString: true });
    const serializedmainForms = jsonSerializer.stringify(records);
    res.send(serializedmainForms);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
