const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const JSONbig = require('json-bigint');
const prisma = new PrismaClient();
const jsonSerializer = JSONbig({ storeAsString: true });
var { protect } = require('../middleware/authMiddleware')

router.get('/',protect, async function (req, res, next) {
  try {
    const {fileNo} = req.query

    const MainappForm = await prisma.MainAppForm.findMany({
      select : {
        ApplicationNo : true,
        FileNo : true,
        PlotNo : true,

      }
    })

    const receipts = await prisma.receiptTbl.findMany({
      select: {
        Id:true,
        ReceiptNo : true,
        Date: true,
        ReceivedFrom:true,
        ReceivedAmount: true,
        Amount_For_The_Month_Of: true,
        Remarks: true,
        Balancamount: true,
              }
    });
    const jsonSerializer = JSONbig({ storeAsString: true });

    const findings = MainappForm.filter((m) => {
      if(m.FileNo == fileNo){
        return {
          m
        }
      }
    })

   

    const filteredReceipts = receipts.filter(receipt => {
      const matchingFindings = findings.find(
        finding => finding.ApplicationNo == receipt.ReceiptNo
      );
    
      return matchingFindings !== undefined;
    });

    
    const data = filteredReceipts.map((f) => {
      const matchingFindings = findings.find((item) => item.ApplicationNo == f.ReceiptNo);
      return {
        Id: f.Id,
        File: matchingFindings.FileNo,
        Received_Amount: f.ReceivedAmount,
        Received_From: f.ReceivedFrom,              
        Amount_For_The_Month_Of: f.Amount_For_The_Month_Of,
        ReceiptNo: f.ReceiptNo,
        Plot: matchingFindings.Plot,
        Balance: f.Balancamount,
        Remarks: f.Remarks,
      };
    });
    
    

    

    // Serialize the BigInt values using json-bigint
    const serializedreceipts = jsonSerializer.stringify(data);

    res.send(serializedreceipts);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
