const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { Prisma } = require('@prisma/client'); 
const JSONbig = require('json-bigint');

const prisma = new PrismaClient();
const jsonSerializer = JSONbig({ storeAsString: true });
var { protect ,isAdmin } = require('../middleware/authMiddleware')

// regular receipt
router.get('/regularReceipt',protect, async function (req, res, next) {
  try {

    // Prisma query to retrieve refund records with ReceivedAmount = 15000
    const allMainForm = await prisma.receiptTbl.findMany({
      where: {
        ReceiptType : 1
      },
      select : {
        Id:true,
        FileNo : true,
        Date : true,
        ReceivedAmount : true,
        ReceivedFrom:true,
        Amount_For_The_Month_Of : true,
        Receipt:true,
        Plot_No:true,
        Remarks:true
      }
    });
    const MainAppForm = allMainForm.map(item => ({
      Id:item.Id,
      File_No : item.FileNo,
        Date: item.Date.toISOString().split('T')[0],
        Received_Amount : item.ReceivedAmount,
        Received_From:item.ReceivedFrom,
        Amount_For_The_Month_Of : item.Amount_For_The_Month_Of,
        Receipt:item.Receipt,
        Plot_No:item.Plot_No,
        Remarks:item.Remarks,
  
    }));

    const serializedMainAppForm = jsonSerializer.stringify(MainAppForm);

    res.send(serializedMainAppForm);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


//transfer receipt
// transfer receipt with ReceivedAmount filter
router.get('/transferReceipt',protect, async function (req, res, next) {
  try {

    // Prisma query to retrieve refund records with ReceivedAmount = 15000
    const allMainForm = await prisma.receiptTbl.findMany({
      where: {
        ReceiptType : 2
      },
      select : {
        Id:true,
        FileNo : true,
        Date : true,
        ReceivedAmount : true,
        ReceivedFrom:true,
        Amount_For_The_Month_Of : true,
        Receipt:true,
        Plot_No:true,
        Remarks:true
      }
    });
    const MainAppForm = allMainForm.map(item => ({
      Id:item.Id,
      File_No : item.FileNo,
        Date: item.Date.toISOString().split('T')[0],
        Received_Amount : item.ReceivedAmount,
        Received_From:item.ReceivedFrom,
        Amount_For_The_Month_Of : item.Amount_For_The_Month_Of,
        Receipt:item.Receipt,
        Plot_No:item.Plot_No,
        Remarks:item.Remarks,
    }));

    const serializedMainAppForm = jsonSerializer.stringify(MainAppForm);

    res.send(serializedMainAppForm);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Development receipt
router.get('/DevelopmentReceipt',protect, async function (req, res, next) {
  try {

    // Prisma query to retrieve refund records with ReceivedAmount = 15000
    const allMainForm = await prisma.receiptTbl.findMany({
      where: {
        ReceiptType : 3
      },
      select : {
        Id:true,
        FileNo : true,
        Date : true,
        ReceivedAmount : true,
        ReceivedFrom:true,
        Amount_For_The_Month_Of : true,
        Receipt:true,
        Plot_No:true,
        Remarks:true
      }
    });
    const MainAppForm = allMainForm.map(item => ({
      Id:item.Id,
      File_No : item.FileNo,
        Date: item.Date.toISOString().split('T')[0],
        Received_Amount : item.ReceivedAmount,
        Received_From:item.ReceivedFrom,
        Amount_For_The_Month_Of : item.Amount_For_The_Month_Of,
        Receipt:item.Receipt,
        Plot_No:item.Plot_No,
        Remarks:item.Remarks,
    }));

    const serializedMainAppForm = jsonSerializer.stringify(MainAppForm);

    res.send(serializedMainAppForm);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


//Edit Receipt
router.put('/update', protect,isAdmin, async function (req, res, next) {
  try {
    
    const {
      UserID,
      receiptId,
      ReceiptNo,
      FileNo,
      date,
      ReceivedAmount,
      ReceivedDifferenceAmount,
      ReceivedFrom,
      Amount_For_The_Month_Of,
      AmountReceivedForPlot,
      ModeOfPayment,
      Phase,
      Block,
      Plot_No,
      Prepaired_By,
      Prepaired_by_Name,
      Remarks,
      Balancamount,
      ReceiptCatgory,
      ReceiptStatus,
      NextDueDate,
      AgentID,
      AgentName,
      CommAmount,
      CommRemarks,
      ReceiptType, 
    } = req.body;

    if (isNaN(receiptId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receiptId provided in the request body.',
      });
    }

    const Id = parseInt(receiptId)

    const updatedRecord = await prisma.receiptTbl.update({
      where: {
        Id: Id,
      },
      data: {
        ReceiptNo : parseInt(ReceiptNo),
        FileNo,
        Date : date ? new Date(date) : new Date(),
        ReceivedAmount : parseInt(ReceivedAmount),
        ReceivedDifferenceAmount ,
        ReceivedFrom,
        Amount_For_The_Month_Of,
        AmountReceivedForPlot,
        ModeOfPayment,
        Receipt : parseInt(ReceiptNo),
        Phase,
        Block,
        Plot_No,
        Prepaired_By : parseInt(Prepaired_By),
        Prepaired_by_Name,
        Remarks,
        Balancamount,
        ReceiptCatgory,
        ReceiptStatus,
        NextDueDate : NextDueDate ? new Date(NextDueDate) : null,
        AgentID : parseInt(AgentID),
        AgentName,
        CommAmount : parseFloat(CommAmount),
        CommRemarks,
        ReceiptType : parseInt(ReceiptType), 
      },
    });

    const serializedupdatedRecord = jsonSerializer.stringify(updatedRecord);

    
    const userActivity = await prisma.testtable.create({
      data:{
        ApplicationNo : parseInt(ReceiptNo),
        Applicant_Name : 'updated',
        Agent : UserID , 
        Date : new Date(),
        Receivied_Amount : 1,
        Mode_Of_Payment : 'no',
        Receipt : updatedRecord.Id,
        File_No : updatedRecord.FileNo
      }
    })

    res.status(200).json({
      success: true,
      message: `Receipt record with ID ${receiptId} has been updated successfully.`,
      updatedRecord: serializedupdatedRecord,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      // If the error is due to non-existent record, return 404 status
      return res.status(404).json({
        success: false,
        message: 'Receipt record to update does not exist.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
});


//Delete Receipt
router.delete('/delete',protect,isAdmin, async function (req, res, next) {
  try {
    const { receiptId } = req.body;

    if (!receiptId) {
      return res.status(400).json({
        success: false,
        message: 'receiptId is required in the request body.',
      });
    }

    const Id = parseInt(receiptId);

    const deletedRecord = await prisma.receiptTbl.delete({
      where: {
        Id: Id,
      },
    });

    res.status(200).json({
      success: true,
      message: `Record with Id ${Id} has been deleted successfully.`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
});

//Get 1 receipt
router.get('/details',protect, async function (req, res, next) {
  try {
    const { receiptId } = req.query;

    if (!receiptId) {
      return res.status(400).json({
        success: false,
        message: 'receiptId is required in the request body.',
      });
    }

    const Id = parseInt(receiptId);

    // Use Prisma client to delete the record
    const Record = await prisma.receiptTbl.findFirst({
      where: {
        Id: Id,
      },
    });

    const receipt = {
        Id : Record.Id, 
        Receipt_No: Record.ReceiptNo,
        File_No: Record.FileNo,
        Date: Record.Date?.toISOString().split('T')[0],
        Received_Amount: Record.ReceivedAmount,
        Received_Difference_Amount: Record.ReceivedDifferenceAmount,
        Received_From: Record.ReceivedFrom?.toUpperCase(),
        Amount_For_The_Month_Of: Record.Amount_For_The_Month_Of?.toUpperCase(),
        Amount_Received_For_Plot: Record.AmountReceivedForPlot?.toUpperCase(),
        Mode_Of_Payment: Record.ModeOfPayment?.toUpperCase(),
        Receipt: Record.Receipt,
        Phase: Record.Phase?.toUpperCase(),
        Block: Record.Block?.toUpperCase(),
        Plot_No: Record.Plot_No?.toUpperCase(),
        Prepaired_By: Record.Prepaired_By,
        Prepaired_by_Name: Record.Prepaired_by_Name?.toUpperCase(),
        Remarks: Record.Remarks?.toUpperCase(),
        Balance_Amount: Record.Balancamount,
        Receipt_Catgory: Record.ReceiptCatgory?.toUpperCase(),
        Receipt_Status: Record.ReceiptStatus?.toUpperCase(),
        Next_Due_Date: Record.NextDueDate?.toISOString().split('T')[0],
        Agent_Name: Record.AgentName?.toUpperCase(),
        Commission_Amount: Record.CommAmount,
        Commission_Remarks: Record.CommRemarks,
        Receipt_Type: Record.ReceiptType,
        Agent_ID : Record.AgentID
        
    }
    if (Record.ModeOfPayment === 'Online') {
      receipt.Online_Method = Record.Online_Method;
      receipt.Payment_ID = Record.Method_ID;
    }

    const serializedRecord = jsonSerializer.stringify(receipt);

    res.send(serializedRecord)
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
});


router.get('/print',protect, async function (req, res, next) {
  try {
    const { receiptId } = req.query;

    if (!receiptId) {
      return res.status(400).json({
        success: false,
        message: 'receiptId is required in the request body.',
      });
    }

    const Id = parseInt(receiptId);

    // Use Prisma client to delete the record
    const Record = await prisma.receiptTbl.findFirst({
      where: {
        Id: Id,
      },
    });

    const result = await prisma.$queryRaw`
    SELECT SUM(ReceivedAmount) As Total_Receieved
  FROM [pakdempk].[dbo].[ReceiptTbl]
  where ReceiptNo = ${Record.ReceiptNo}
  group by ReceiptNo`;

    const main = await prisma.mainAppForm.findFirst({
      where:{
        ApplicationNo : parseInt(Record.ReceiptNo)
      }
    })

    const receipt = {
        Receipt_No: Record.ReceiptNo,
        Receipt_Status: Record.ReceiptStatus,
        Amount_For_The_Month_Of: Record.Amount_For_The_Month_Of,
        Payment_Mode: Record.ModeOfPayment,
        File_No: main.FileNo,
        Date: Record.Date?.toISOString().split('T')[0],
        Received_Amount: Record.ReceivedAmount,
        Name: main.ApplicantName,
        Total_Recieved: result[0].Total_Receieved,
        Mode_Of_Payment : main.ModeOfPayment,
        Plot: main.PlotNo,
        Phase: main.Phase,
        Block: main.Block,
        Area: main.Area,
        Prepaired_By: Record.Prepaired_By,
        Prepaired_by_Name: Record.Prepaired_by_Name,
        Remarks: Record.Remarks,
        Balance_Amount: main.TotalAmount  - result[0].Total_Receieved,
        Total_Amount: main.TotalAmount,
        PlotLocation : main.PlotLocation,
        PlotCategory: main.PlotCategory
        
    }
    if (Record.ModeOfPayment === 'Online') {
      receipt.Online_Method = Record.Online_Method;
      receipt.Payment_ID = Record.Method_ID;
    }

    const serializedRecord = jsonSerializer.stringify(receipt);

    return res.send(serializedRecord)
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
});



//all receipts
router.get('/receipt',protect, async function(req,res,next){
    try {
        const receipt = await prisma.receiptTbl.findMany();
        const serializedreceipt = jsonSerializer.stringify(receipt);
    
        res.send(serializedreceipt);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
});

//Create Receipt
//receipt record finder
router.post('/createReceipt',protect, async function (req, res, next) {
  try {
    

    const {
      UserID,
      FileNo,
      date,
      ReceivedAmount,
      ReceivedDifferenceAmount,
      ReceivedFrom,
      Amount_For_The_Month_Of,
      AmountReceivedForPlot,
      ModeOfPayment,
      Receipt,
      Phase,
      Block,
      Plot_No,
      Prepaired_By,
      Prepaired_by_Name,
      Remarks,
      Balancamount,
      ReceiptCatgory,
      ReceiptStatus,
      NextDueDate,
      AgentID,
      AgentName,
      CommAmount,
      CommRemarks,
      ReceiptType, 
      Online_Method,
      Method_ID
    } = req.body;

    const mainForm = await prisma.mainAppForm.findFirst({
      where :{
        FileNo : FileNo
      }
    })

    const data = {
      ReceiptNo : parseInt(mainForm.ApplicationNo),
      FileNo,
      Date : date ? new Date(date) : new Date(),
      ReceivedAmount : parseInt(ReceivedAmount),
      ReceivedDifferenceAmount ,
      ReceivedFrom,
      Amount_For_The_Month_Of,
      AmountReceivedForPlot,
      ModeOfPayment,
      Receipt : parseInt(mainForm.ApplicationNo),
      Phase,
      Block,
      Plot_No,
      Prepaired_By : parseInt(Prepaired_By),
      Prepaired_by_Name,
      Remarks,
      Balancamount,
      ReceiptCatgory,
      ReceiptStatus,
      NextDueDate : NextDueDate ? new Date(NextDueDate) : null,
      AgentID : parseInt(AgentID),
      AgentName,
      CommAmount : parseFloat(CommAmount),
      CommRemarks,
      ReceiptType : parseInt(ReceiptType),
      Online_Method,
      Method_ID 
    };



    const newReceipt = await prisma.receiptTbl.create({
      data: data,
    });

    const userActivity = await prisma.testtable.create({
      data:{
        ApplicationNo : mainForm.ApplicationNo,
        Applicant_Name : 'Created',
        Agent : UserID , 
        Date : new Date(),
        Receivied_Amount : 1,
        Mode_Of_Payment : 'no',
        Receipt : newReceipt.Id,
        File_No : newReceipt.FileNo
      }
    })

    const serializednewReceipt = jsonSerializer.stringify(newReceipt);

    res.status(200).json(serializednewReceipt);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



module.exports = router;
