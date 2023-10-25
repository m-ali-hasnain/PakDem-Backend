const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const JSONbig = require('json-bigint');
const app = express();

const prisma = new PrismaClient();

const jsonSerializer = JSONbig({ storeAsString: true });


// Parse JSON data sent in the request body
app.use(bodyParser.json());

// main form
router.post('/login', async function (req, res, next) {
  try {

    const {
        CNICNo,
        FileNo
    } = req.body

    const mainAppForm = await prisma.mainAppForm.findFirst({
        where: {
            CNICNo: CNICNo,
            FileNo : FileNo
        },
      });
  
      // If form not found, return error
      if (!mainAppForm) {
        return res.status(404).json({
            success: false,
            message: `No User with such CNIC and File Number Exists.`
          });
      }
      else{
        return res.status(200).json({ success: true });
      }

        

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// router.get('/mainform/details', async function (req, res, next) {
//     try {
//       const { CNICNo } = req.query;
  
//       // Find the mainAppForm with the provided ApplicationNo in the database
//       const mainAppForm = await prisma.mainAppForm.findFirst({
//         where: {
//             CNICNo: CNICNo,
//         },
//         select :{
//                 ApplicationNo : true,
//                 Date : true
//                 ,FileNo : true
//                 ,FileType : true
//                 ,Area : true
//                 ,PlotNo : true
//                 ,PlotID : true
//                 ,Phase : true
//                 ,Block : true
//                 ,Total_Installment : true
//                 ,PlotLocation : true
//                 ,ApplicantName : true
//                 ,FatherOrHusband : true
//                 ,CNICNo : true
//                 ,ContactNo : true
//                 ,PermanentAddress : true
//                 ,PostalAddress : true
//                 ,Nok : true
//                 ,NoKFatherName : true
//                 ,NokSRelation : true
//                 ,NoKAddress : true
//                 ,Refrence : true
//                 ,ModeOfPayment : true
//                 ,TotalAmount : true
//                 ,DownPayment : true
//         }
//       });
  
//       // If form not found, return error
//       if (!mainAppForm) {
//         return res.status(404).json({ error: 'Form not found' });
//       }
  
     
  
//       // Find the latest date for the FileNo in the ReceiptTbl
//       const latestReceiptDate = await prisma.receiptTbl.findFirst({
//         where: {
//           ReceiptNo: parseInt(mainAppForm.ApplicationNo),
//           ReceivedAmount: {
//             gt: 0, 
//           },
//         },
//         orderBy: {
//           Date: 'desc', 
//         },
//       });
  
//       mainAppForm.Date = mainAppForm.Date?.toISOString().split('T')[0]
     
      
  
//       // Calculate the difference in months between the latest receipt date and today's date
//       const today = new Date();
//       const latestDate = latestReceiptDate ? new Date(latestReceiptDate.Date) : null;
  
//       let statusData = {};
  
//       if (!latestDate) {
//         statusData = { status: 'active' };
//       } else {
//         const monthDifference = (today.getFullYear() - latestDate.getFullYear()) * 12 +
//           (today.getMonth() - latestDate.getMonth());
  
//         let status;
//         let reason = '';
  
//         if (monthDifference < 3) {
//           if(monthDifference > 1 )
//             {
//               status = 'active';
//               reason = `installment pending from ${monthDifference} months`;
//             }
//             else{
//               status = 'active';
//               reason = ``;
//             }
//           } else if (monthDifference < 6) {
//           status = 'inactive';
//           reason = `Due to installment pending from ${monthDifference} months`;
//         } else {
//           status = 'cancelled';
//           reason = `Due to installment pending from ${monthDifference} months`;
//         }
  
//         statusData = { status, reason };
//       }
  
//       // Combine status and reason inside mainAppForm object
//       const responseData = { ...mainAppForm, ...statusData };
  
//       // Convert the response data to a JSON string
//       const serializedResponseData = jsonSerializer.stringify(responseData);
      
//       // Send the combined data as the response
//       res.send(serializedResponseData);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });

router.get('/mainform/details', async function (req, res, next) {
    try {
      const { CNICNo } = req.query;
  
      // Find the mainAppForm with the provided ApplicationNo in the database
      const mainAppForm = await prisma.mainAppForm.findFirst({
        where: {
          CNICNo: CNICNo,
        },
        select :{
          ApplicationNo : true,
          Date : true
          ,FileNo : true
          ,FileType : true
          ,Area : true
          ,PlotNo : true
          ,PlotID : true
          ,Phase : true
          ,Block : true
          ,Total_Installment : true
          ,PlotLocation : true
          ,ApplicantName : true
          ,FatherOrHusband : true
          ,CNICNo : true
          ,ContactNo : true
          ,PermanentAddress : true
          ,PostalAddress : true
          ,Nok : true
          ,NoKFatherName : true
          ,NokSRelation : true
          ,NoKAddress : true
          ,Refrence : true
          ,ModeOfPayment : true
          ,TotalAmount : true
          ,DownPayment : true
  }
      });
  
      // If form not found, return error
      if (!mainAppForm) {
        return res.status(404).json({ error: 'Form not found' });
      }
  
      // Find all receipts matching the ApplicationNo
      const allReceipts = await prisma.receiptTbl.findMany({
        where: {
          ReceiptNo: parseInt(mainAppForm.ApplicationNo),
        },
        select: {
          ReceivedAmount: true,
        },
      });
  
      // Calculate the total received amount
      const totalReceivedAmount = allReceipts.reduce(
        (sum, receipt) => parseFloat(sum) + parseFloat(receipt.ReceivedAmount),
        0
      );
  
      const balanceAmount = parseFloat(mainAppForm.TotalAmount) - parseFloat(totalReceivedAmount);

         const latestReceiptDate = await prisma.receiptTbl.findFirst({
                where: {
                  ReceiptNo: parseInt(mainAppForm.ApplicationNo),
                    ReceivedAmount: {
                      gt: 0, 
                          },
                        },
                        orderBy: {
                          Date: 'desc', 
                        },
                    });
      mainAppForm.Date = mainAppForm.Date?.toISOString().split('T')[0];
  
      // Calculate the difference in months between the latest receipt date and today's date
      const today = new Date();
      const latestDate = latestReceiptDate ? new Date(latestReceiptDate.Date) : null;
  
      let statusData = {};
  
      if (!latestDate) {
        statusData = { status: 'active' };
      } else {
        const monthDifference = (today.getFullYear() - latestDate.getFullYear()) * 12 +
          (today.getMonth() - latestDate.getMonth());
  
        let status;
        let reason = '';
  
        if (monthDifference < 3) {
          if(monthDifference > 1 )
            {
              status = 'active';
              reason = `installment pending from ${monthDifference} months`;
            }
            else{
              status = 'active';
              reason = ``;
            }
          } else if (monthDifference < 6) {
          status = 'inactive';
          reason = `Due to installment pending from ${monthDifference} months`;
        } else {
          status = 'cancelled';
          reason = `Due to installment pending from ${monthDifference} months`;
        }
  
        statusData = { status, reason };
      }
  
  
      // Combine status, reason, received amount, and balance amount inside mainAppForm object
      const responseData = {
        ...mainAppForm,
        ...statusData,
        receivedAmount: totalReceivedAmount,
        balanceAmount: balanceAmount,
      };
  
      // Convert the response data to a JSON string
      const serializedResponseData = jsonSerializer.stringify(responseData);
  
      // Send the combined data as the response
      res.send(serializedResponseData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  router.get('/receipts', async function (req, res, next) {
    try {
      const { CNICNo } = req.query;
  
      // Find the mainAppForm with the provided ApplicationNo in the database
      const mainAppForm = await prisma.mainAppForm.findFirst({
        where: {
            CNICNo: CNICNo,
        },
        select :{
                ApplicationNo : true,
        }
      });
  
      // If form not found, return error
      if (!mainAppForm) {
        return res.status(404).json({ error: 'Form not found' });
      }
  
     
  
      // Find the latest date for the FileNo in the ReceiptTbl
      const latestReceiptDate = await prisma.receiptTbl.findMany({
        where: {
          ReceiptNo: parseInt(mainAppForm.ApplicationNo),
          ReceivedAmount: {
            gt: 0, 
          },
        },
      });

      const Receipts = latestReceiptDate.map((res) => {
        return {
            Id : res.Id,
            File_No : res.FileNo,
            Date : res.Date?.toISOString().split('T')[0],
            Received_Amount : res.ReceivedAmount,
            Amount_For_The_Month_Of : res.Amount_For_The_Month_Of,
            Mode_Of_Payment :res. ModeOfPayment,

        }
      })

      const serializedResponseData = jsonSerializer.stringify(Receipts);
      
      // Send the combined data as the response
      res.send(serializedResponseData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;
