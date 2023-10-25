const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const JSONbig = require('json-bigint');

const prisma = new PrismaClient();

var { isAdmin,protect , ExpenditureAuthorization } = require('../middleware/authMiddleware')

const jsonSerializer = JSONbig({ storeAsString: true });

router.get('/', protect, async function (req, res, next) {
  try {
    // will be from user
    const { startDate, endDate } = req.query;

    const mainForms = await prisma.mainAppForm.findMany({
      select: {
        ApplicationNo: true,
        ApplicantName: true,
        FileNo: true,
      },
    });

    const receipts = await prisma.receiptTbl.findMany({
      where: {
        Date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      select: {
        Id: true,
        ReceiptNo: true,
        Date: true,
        ReceivedAmount: true,
        ModeOfPayment: true,
        AgentName: true,
      },
    });

    const DailyReport = receipts.map((receipt) => {
      const mainForm = mainForms.find((mainForm) => receipt.ReceiptNo === mainForm.ApplicationNo);
      return {
        Id: receipt.Id,
        Application_No: mainForm?.ApplicationNo || '',
        Applicant_Name: mainForm?.ApplicantName || '',
        Date: receipt.Date.toISOString().split('T')[0],
        FileNo: mainForm?.FileNo || '',
        Received_Amount: receipt.ReceivedAmount,
        Mode_Of_Payment: receipt.ModeOfPayment,
        Receipt_No: receipt.ReceiptNo,
        Agent_Name: receipt.AgentName,
      };
    });

    const jsonSerializer = JSONbig({ storeAsString: true });
    const serializedJointData = jsonSerializer.stringify(DailyReport);
    res.send(serializedJointData);
  } catch (error) {
    console.error(error);
    next(error);
  }
});


module.exports = router;
