const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const JSONbig = require('json-bigint');

const prisma = new PrismaClient();

var { protect } = require('../middleware/authMiddleware')

const jsonSerializer = JSONbig({ storeAsString: true });

router.get('/', protect, async function (req, res, next) {
  try {
    const { startDate } = req.query;

    if (startDate) {
      const sdate = new Date(startDate);

      var payments = await prisma.$queryRaw`
          SELECT 
              rt."Id" ,
              mf."ApplicationNo" as Application_No,
              rt."Date",
              mf."FileNo" as File_No,  
              mf."ApplicantName" as Applicant_Name,
              rt."ModeOfPayment" as Mode_Of_Payment,
              rt."ReceivedAmount" as Received_Amount,
              mf."PlotNo" as Plot_No,
              mf."Agent"
          FROM "MainAppForm" AS mf
          JOIN "ReceiptTbl" AS rt
              ON mf.ApplicationNo = rt.ReceiptNo
          WHERE rt."ModeOfPayment" = 'CA'
          and rt.Date = ${sdate}
      `;

    } else {
      var payments = await prisma.$queryRaw`
        SELECT 
            rt."Id" ,
            mf."ApplicationNo" as Application_No,
            rt."Date",
            mf."FileNo" as File_No,  
            mf."ApplicantName" as Applicant_Name,
            rt."ModeOfPayment" as Mode_Of_Payment,
            rt."ReceivedAmount" as Received_Amount,
            mf."PlotNo" as Plot_No,
            mf."Agent"
        FROM "MainAppForm" AS mf
        JOIN "ReceiptTbl" AS rt
            ON mf.ApplicationNo = rt.ReceiptNo
        WHERE rt."ModeOfPayment" = 'CA'
      `;
    }

    const agentMap = new Map();
    const agents = await prisma.agentTbl.findMany();
    agents.forEach(agent => {
      agentMap.set(agent.AgentID, agent.AgentName);
    });

    const CApayments = payments.map(item => ({
      ...item,
      Date: item.Date.toISOString().split('T')[0],
      Agent_Name: agentMap.get(item.Agent) || null,
    }));

    CApayments.forEach(payment => {
      delete payment.Agent; 
    });

    const jsonSerializer = JSONbig({ storeAsString: true });
    const serializedPayments = jsonSerializer.stringify(CApayments);
    res.send(serializedPayments);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
