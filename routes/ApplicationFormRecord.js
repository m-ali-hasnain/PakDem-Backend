var express = require('express');
var router = express.Router();
const { PrismaClient, Prisma } = require('@prisma/client');
const JSONbig = require('json-bigint');

const prisma = new PrismaClient();

const jsonSerializer = JSONbig({ storeAsString: true });

var { isAdmin ,protect } = require('../middleware/authMiddleware')

router.get('/', protect,async function (req, res, next) {
  try {
    const {fileNo} = req.query;
    

    const result = await prisma.$queryRaw`
    SELECT
        m.Date,
        m.FileNo,
        m.Area,
        m.PlotNo,
        m.TotalAmount,
        m.DownPayment,
        a.AgentName,
        m.ApplicantName,
        SUM(r.ReceivedAmount) as ReceivedAmountSum
    FROM
        MainAppForm m
    LEFT JOIN
        AgentTbl a ON m.Agent = a.AgentID
    LEFT JOIN
        ReceiptTbl r ON m.FileNo = r.FileNo
    WHERE
        m.FileNo = ${fileNo}
    GROUP BY
        m.Date,
        m.FileNo,
        m.Area,
        m.PlotNo,
        m.TotalAmount,
        m.DownPayment,
        a.AgentName,
        m.ApplicantName;
    `;


  ApplicationRecord = result.map((r)=>{
    return {
      Date: r.Date.toISOString().split('T')[0],
      File: r.FileNo,
      Area: r.Area,
      Plot: r.PlotNo,
      Total_Amount: r.TotalAmount,
      Down_Payment: r.DownPayment,
      Agent: r.AgentName,
      Applicant_Name: r.ApplicantName,
      Received_Amount: r.ReceivedAmountSum ? r.ReceivedAmountSum : 0,
      Balance : parseInt(parseInt(r.TotalAmount) - parseInt(r.ReceivedAmountSum ? r.ReceivedAmountSum : 0))
    }
  })

    // Serialize the response using json-bigint
    const jsonSerializer = JSONbig({ storeAsString: true });
    const serializedResponse = jsonSerializer.stringify(ApplicationRecord);
    res.send(serializedResponse);
    
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
