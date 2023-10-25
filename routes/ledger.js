const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const JSONbig = require('json-bigint');

const prisma = new PrismaClient();
var { isAdmin , protect } = require('../middleware/authMiddleware')
const jsonSerializer = JSONbig({ storeAsString: true });

// Ledger Report
router.get('/', protect, async function (req, res, next) {
  try {
      const mainAppForms = await prisma.mainAppForm.findMany();
      const allreceipts = await prisma.receiptTbl.findMany();

      // Create a hashmap of receipts grouped by ReceiptNo
      const receiptMap = new Map();
      for (let receipt of allreceipts) {
          if (!receiptMap.has(receipt.ReceiptNo)) {
              receiptMap.set(receipt.ReceiptNo, []);
          }
          receiptMap.get(receipt.ReceiptNo).push(receipt);
      }

      const results = [];

      // Iterate over each mainAppForm entry
      for (let form of mainAppForms) {
          const matchingReceipts = receiptMap.get(form.ApplicationNo) || [];

          // Sum the received amounts of the matching receipts
          const receivedAmount = matchingReceipts.reduce((sum, receipt) => BigInt(sum) + BigInt(receipt.ReceivedAmount), 0n);

          // Calculate the balance
          const balanceAmount = parseFloat(form.TotalAmount) - parseFloat(receivedAmount);

          results.push({
              Application_No : form.ApplicationNo,
              Name : form.ApplicantName,
              File_No: form.FileNo,
              Date: form.Date.toISOString().split('T')[0],
              total_amount: form.TotalAmount,
              received_amount: receivedAmount.toString(),
              balance_amount: balanceAmount,
          });
      }

      const serializedresults = jsonSerializer.stringify(results);
      // Send the combined data as the response
      res.send(serializedresults);
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});


module.exports = router;




module.exports = router;