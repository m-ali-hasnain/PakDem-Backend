const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const JSONbig = require('json-bigint');
const app = express();

const prisma = new PrismaClient();

const jsonSerializer = JSONbig({ storeAsString: true });

var { isAdmin , protect } = require('../middleware/authMiddleware')

// Parse JSON data sent in the request body
app.use(bodyParser.json());

// main form
router.get('/mainform',protect, async function (req, res, next) {
  try {
    const allMainForm = await prisma.mainAppForm.findMany({
      select : {
        ApplicationNo : true,
        Date:true,
        FileNo : true,
        Area : true,
        PlotNo : true,
        ApplicantName : true,
        ContactNo : true,
        TotalAmount : true,
        DownPayment : true
        
      }
    });

    const MainAppForm = allMainForm.map(item => ({
        ApplicationNo : item.ApplicationNo,
        Date:item.Date.toISOString().split('T')[0],
        File_No : item.FileNo,
        Area : item.Area,
        Plot_No : item.PlotNo,
        Applicant_Name : item.ApplicantName,
        Contact_No : item.ContactNo,
        Total_Amount : item.TotalAmount,
        Down_Payment : item.DownPayment
      
    }));
    const serializedMainAppForm = jsonSerializer.stringify(MainAppForm);

    res.send(serializedMainAppForm);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/mainform/Files',protect, async function (req, res, next) {
  try {

    const {selectedFileNos} = req.query;

    const allMainForm = await prisma.mainAppForm.findMany({
      where: {
        FileNo: {
          in: selectedFileNos,
        },
      },
      select : {
        ApplicationNo : true,
        Date:true,
        FileNo : true,
        Area : true,
        PlotNo : true,
        ApplicantName : true,
        ContactNo : true,
        TotalAmount : true,
        DownPayment : true
        
      }
    });

    const MainAppForm = allMainForm.map(item => ({
        ApplicationNo : item.ApplicationNo,
        Date:item.Date?.toISOString().split('T')[0],
        File_No : item.FileNo,
        Area : item.Area,
        Plot_No : item.PlotNo,
        Applicant_Name : item.ApplicantName,
        Contact_No : item.ContactNo,
        Total_Amount : item.TotalAmount,
        Down_Payment : item.DownPayment
      
    }));
    const serializedMainAppForm = jsonSerializer.stringify(MainAppForm);

    res.send(serializedMainAppForm);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



router.get('/Cashmainform', protect, async function (req, res, next) {
  try {
    const allMainForm = await prisma.mainAppForm.findMany({
      where: {
        ModeOfPayment: 'cash'
      },
      select: {
        ApplicationNo: true,
        Date: true,
        FileNo: true,
        Area: true,
        PlotNo: true,
        ApplicantName: true,
        ContactNo: true,
        TotalAmount: true,
        DownPayment: true
      }
    });

    const MainAppForm = allMainForm.map(item => ({
      ApplicationNo: item.ApplicationNo,
      Date: item.Date.toISOString().split('T')[0],
      File_No: item.FileNo,
      Area: item.Area,
      Plot_No: item.PlotNo,
      Applicant_Name: item.ApplicantName,
      Contact_No: item.ContactNo,
      Total_Amount: item.TotalAmount,
      Down_Payment: item.DownPayment
    }));

    const serializedMainAppForm = jsonSerializer.stringify(MainAppForm);

    res.send(serializedMainAppForm);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/installmentFiles', protect, async function (req, res, next) {
  try {
    const allMainForm = await prisma.mainAppForm.findMany({
      where: {
        OR: [
          { ModeOfPayment: 'installment' },
          { ModeOfPayment: 'installments' }
        ]
      },
      select: {
        ApplicationNo: true,
        Date: true,
        FileNo: true,
        Area: true,
        PlotNo: true,
        ApplicantName: true,
        ContactNo: true,
        TotalAmount: true,
        DownPayment: true
      }
    });

    const receiptData = await prisma.receiptTbl.findMany({
      where: {
        ReceiptNo: {
          in: allMainForm.map(item => item.ApplicationNo)
        }
      },
      select: {
        ReceiptNo: true,
        ReceivedAmount: true
      }
    });

    const receiptSumMap = receiptData.reduce((acc, curr) => {
      acc[curr.ReceiptNo] = BigInt(acc[curr.ReceiptNo] || 0) + BigInt(curr.ReceivedAmount || 0);
      return acc;
    }, {});

    const MainAppFormWithShortfall = allMainForm.map(item => ({
      ApplicationNo: item.ApplicationNo,
      Date: item.Date?.toISOString().split('T')[0],
      File_No: item.FileNo,
      Plot_No: item.PlotNo,
      Applicant_Name: item.ApplicantName,
      Contact_No: item.ContactNo,
      Total_Amount: item.TotalAmount,
      Down_Payment: item.DownPayment,
      shortFall: BigInt(item.TotalAmount) - BigInt(item.DownPayment) - (receiptSumMap[item.ApplicationNo] || 0n)
    }));

    const serializedMainAppForm = jsonSerializer.stringify(MainAppFormWithShortfall);

    res.send(serializedMainAppForm);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/mainform/Files',protect, async function (req, res, next) {
  try {
    const allMainForm = await prisma.mainAppForm.findMany({
      select : {
        ApplicationNo : true,
        
        FileNo : true,
        
      }
    });

    const MainAppForm = allMainForm.map(item => ({
        ApplicationNo : item.ApplicationNo,
        FileNo : item.FileNo,
      
    }));
    const serializedMainAppForm = jsonSerializer.stringify(MainAppForm);
    res.send(serializedMainAppForm);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

//Main form Creation
router.post('/CreatemainForm' ,protect,async function (req, res, next) {
  try {
    
    const {
      UserID,
      date,
      FileNo,
      FileType,
      Area,
      PlotNo,
      PlotID,
      Phase,
      Block,
      Total_Installment,
      PlotLocation,
      ApplicantName,
      FatherOrHusband,
      CNICNo,
      ContactNo,
      PermanentAddress,
      PostalAddress,
      Nok,
      NoKFatherName,
      NokSRelation,
      NoKAddress,
      Refrence,
      ModeOfPayment,
      InvestorAmount,
      InvestorDownPayment,
      TotalAmount,
      DownPayment,
      MonthlyInstallment,
      InvestorMonthlyInstallment,
      CornerCharges,
      GrandTotal,
      AppRemarks,
      RefMobileNo,
      Agent,
      CommissionPercentage,
      NoteNo,
      IsActive,
      IsPlotCancel,
      IsCurrentWith,
      PlotCategory,
      Discount,
      PossesionStatus,
      SubAgent,
      SubAgentComm,
      Investor,
      Prepaired_By,
      Prepaired_by_Name,
      TransferAmount,
      TransferDate,
      DevelopmentChargesIncluded,
      DevelopmentAmount,
      DevelopmentChargesDate,
      UpdatedBy,
      RefundedStatus,
      RefundDate,
      DeductedAmount,
      InstallmentsForRefund,
      RefundAmount,
      
    } = req.body;


    const existingMainAppForm = await prisma.mainAppForm.findFirst({
      where: {
        FileNo: FileNo,
      },
    });

    if (existingMainAppForm) {
      return res.status(400).json({ message: 'File number already exists' });
    }
    
    
    const data = {
      Date : date ? new Date(date) : new Date()  ,
      FileNo,
      FileType,
      Area,
      PlotNo,
      PlotID : parseInt(PlotID),
      Phase,
      Block,
      Total_Installment : parseInt(Total_Installment),
      PlotLocation,
      ApplicantName,
      FatherOrHusband,
      CNICNo,
      ContactNo,
      PermanentAddress,
      PostalAddress,
      Nok,
      NoKFatherName,
      NokSRelation,
      NoKAddress,
      Refrence,
      ModeOfPayment,
      InvestorAmount : parseInt(InvestorAmount),
      InvestorDownPayment : parseInt(InvestorDownPayment),
      TotalAmount : parseInt(TotalAmount),
      DownPayment : parseInt(DownPayment),
      MonthlyInstallment : parseInt(MonthlyInstallment),
      InvestorMonthlyInstallment : parseInt(InvestorMonthlyInstallment),
      CornerCharges : parseInt(CornerCharges),
      GrandTotal : parseInt(GrandTotal),
      AppRemarks,
      RefMobileNo,
      Agent  : parseInt(Agent),
      CommissionPercentage: parseInt(CommissionPercentage),
      NoteNo,
      IsActive,
      IsPlotCancel,
      IsCurrentWith,
      PlotCategory,
      Discount : parseInt(Discount),
      PossesionStatus,
      SubAgent :parseInt(SubAgent),
      SubAgentComm :parseInt(SubAgentComm),
      Investor :parseInt(Investor),
      Prepaired_By :parseInt(Prepaired_By),
      Prepaired_by_Name,
      TransferAmount :parseInt(TransferAmount),
      TransferDate : TransferDate ? new Date(TransferDate) : null,
      DevelopmentChargesIncluded,
      DevelopmentAmount :parseInt(DevelopmentAmount),
      DevelopmentChargesDate : DevelopmentChargesDate ? new Date(DevelopmentChargesDate) : null ,
      UpdatedBy :parseInt(UpdatedBy),
      RefundedStatus,
      RefundDate : RefundDate ? new Date(RefundDate) : null,
      DeductedAmount :parseInt(DeductedAmount),
      InstallmentsForRefund :parseInt(InstallmentsForRefund),
      RefundAmount:parseInt(RefundAmount)
    };
    
    // Now you can use 'data' to create a new MainAppForm record in the database.
    // For example, using Prisma:
    const newMainAppForm = await prisma.mainAppForm.create({
      data: data,
    });

    noOfInstallments = newMainAppForm.Total_Installment ? parseInt(newMainAppForm.Total_Installment) : 1;
    const perMonthPayment = Math.floor((parseInt(newMainAppForm.TotalAmount) - parseInt(newMainAppForm.DownPayment)) / noOfInstallments);


    const schedulePayment = {
      FileNo : parseInt(newMainAppForm.FileNo),
      DueDate : date ? new Date(date) : new Date() ,
      MonthIyInstallement : perMonthPayment,
      PaymentNature : 'Installments'

    }

    const newSchedule = await prisma.paymentSchedule.create({
      data: schedulePayment
    })
    
    console.log(newSchedule)

    if(DevelopmentChargesIncluded) {
      const newReceipt = await prisma.receiptTbl.create({
        data: {
          ReceiptNo: newMainAppForm.ApplicationNo,
          FileNo: newMainAppForm.FileNo,
          Date: DevelopmentChargesDate ? new Date(DevelopmentChargesDate) : new Date(), 
          ReceivedAmount: parseInt(DevelopmentAmount),
          ReceivedFrom: ApplicantName,
          AmountReceivedForPlot: PlotNo ? PlotNo : 'not entered',
          ModeOfPayment: ModeOfPayment ? ModeOfPayment : 'Cash',
          Receipt: newMainAppForm.ApplicationNo,
          Prepaired_By: Prepaired_By ? parseInt(Prepaired_By) : 0,
          Prepaired_by_Name: Prepaired_by_Name ? Prepaired_by_Name : "not mentioned",
          ReceiptType: 3,
        },
      });

      
      
     
    }

    const userActivity = await prisma.testtable.create({
      data:{
        ApplicationNo : newMainAppForm.ApplicationNo,
        Applicant_Name : 'Created',
        Agent : UserID , 
        Date : new Date(),
        Receivied_Amount : 0,
        Mode_Of_Payment : 'no',
        Receipt : newMainAppForm.ApplicationNo,
        File_No : newMainAppForm.FileNo
      }
    })
    


    const serializedMainAppForm = jsonSerializer.stringify(newMainAppForm);

    res.status(200).json(serializedMainAppForm);    
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
} )

//Get detail of one form
router.get('/mainform/details', protect, async function (req, res, next) {
  try {
    const { ApplicationNo } = req.query;

    // Find the mainAppForm with the provided ApplicationNo in the database
    const mainAppForm = await prisma.mainAppForm.findFirst({
      where: {
        ApplicationNo: parseInt(ApplicationNo),
      },
    });

    // If form not found, return error
    if (!mainAppForm) {
      return res.status(404).json({ error: 'Form not found' });
    }

    

    // Find the latest date for the FileNo in the ReceiptTbl
    const latestReceiptDate = await prisma.receiptTbl.findFirst({
      where: {
        ReceiptNo: parseInt(ApplicationNo),
        ReceivedAmount: {
          gt: 0, 
        },
      },
      orderBy: {
        Date: 'desc', 
      },
    });



    mainAppForm.Date = mainAppForm.Date?.toISOString().split('T')[0]
    mainAppForm.DevelopmentChargesDate = mainAppForm.DevelopmentChargesDate?.toISOString().split('T')[0]
    mainAppForm.TransferDate = mainAppForm.TransferDate?.toISOString().split('T')[0]
    mainAppForm.RefundDate = mainAppForm.RefundDate?.toISOString().split('T')[0]
    mainAppForm.Registry_Date = mainAppForm.Registry_Date?.toISOString().split('T')[0]
   mainAppForm.inteqal_date = mainAppForm.inteqal_date?.toISOString().split('T')[0]
    

    // Calculate the difference in months between the latest receipt date and today's date
    const today = new Date();
    const latestDate = latestReceiptDate ? new Date(latestReceiptDate.Date) : null;

    const result = await prisma.$queryRaw`
      SELECT SUM(ReceivedAmount) As Total_Receieved
    FROM [pakdempk].[dbo].[ReceiptTbl]
    where ReceiptNo = ${ApplicationNo}
    group by ReceiptNo`;


    let statusData = {};

    if(result[0].Total_Receieved >= mainAppForm.TotalAmount ){
      statusData = { status: 'Cleared' };
    }
    else if (!latestDate) {
      statusData = { status: 'active' };
    } 
    else {
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

    // Combine status and reason inside mainAppForm object
    const responseData = { ...mainAppForm, ...statusData };

    // Convert the response data to a JSON string
    const serializedResponseData = jsonSerializer.stringify(responseData);
    
    // Send the combined data as the response
    res.send(serializedResponseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Get detail of one form
router.get('/FileFolder', protect, async function (req, res, next) {
  try {
    const { FileNo } = req.query;

    // Find the mainAppForm with the provided ApplicationNo in the database
    const mainAppForm = await prisma.mainAppForm.findFirst({
      where: {
        FileNo: FileNo,
      },
    });

    // If form not found, return error
    if (!mainAppForm) {
      return res.status(404).json({ error: 'Form not found' });
    }

    

    // Find the latest date for the FileNo in the ReceiptTbl
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



    mainAppForm.Date = mainAppForm.Date?.toISOString().split('T')[0]
    mainAppForm.DevelopmentChargesDate = mainAppForm.DevelopmentChargesDate?.toISOString().split('T')[0]
    mainAppForm.TransferDate = mainAppForm.TransferDate?.toISOString().split('T')[0]
    mainAppForm.RefundDate = mainAppForm.RefundDate?.toISOString().split('T')[0]
    mainAppForm.Registry_Date = mainAppForm.Registry_Date?.toISOString().split('T')[0]
    mainAppForm.inteqal_date = mainAppForm.inteqal_date?.toISOString().split('T')[0]
    

    // Calculate the difference in months between the latest receipt date and today's date
    const today = new Date();
    const latestDate = latestReceiptDate ? new Date(latestReceiptDate.Date) : null;

    const result = await prisma.$queryRaw`
      SELECT SUM(ReceivedAmount) As Total_Receieved
    FROM [pakdempk].[dbo].[ReceiptTbl]
    where ReceiptNo = ${mainAppForm.ApplicationNo}
    group by ReceiptNo`;


    let statusData = {};

    if(result[0].Total_Receieved >= mainAppForm.TotalAmount ){
      statusData = { status: 'Cleared' };
    }
    else if (!latestDate) {
      statusData = { status: 'active' };
    } 
    else {
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

    const receipts = await prisma.receiptTbl.findMany({
      where:{
        ReceiptNo : parseInt(mainAppForm.ApplicationNo),
        ReceivedAmount: {
          gt: 0, 
        },
      }
    ,
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
    })

    const finalizedReceipts = receipts.map((item)=>{
      return {
        Id:item.Id,
        File_No : item.FileNo,
          Date: item.Date.toISOString().split('T')[0],
          Received_Amount : item.ReceivedAmount,
          Received_From:item.ReceivedFrom,
          Amount_For_The_Month_Of : item.Amount_For_The_Month_Of,
          Receipt:item.Receipt,
          Plot_No:item.Plot_No,
          Remarks:item.Remarks,
      };

    })

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
        main.FileNo = ${FileNo}
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


    const responseData = {
  ...mainAppForm,
  ...statusData,
  receipts: Object.values(finalizedReceipts),
  commission : commission
};

    // Convert the response data to a JSON string
    const serializedResponseData = jsonSerializer.stringify(responseData);
    
    // Send the combined data as the response
    return res.send(serializedResponseData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.put('/mainform/update' ,protect,isAdmin,async function (req, res, next) {
  try {

    
    // Get the form data from the request body
    const {
      UserID,
      ApplicationNo,
      date,
      FileNo,
      FileType,
      Area,
      PlotNo,
      PlotID,
      Phase,
      Block,
      Total_Installment,
      PlotLocation,
      ApplicantName,
      FatherOrHusband,
      CNICNo,
      ContactNo,
      PermanentAddress,
      PostalAddress,
      Nok,
      NoKFatherName,
      NokSRelation,
      NoKAddress,
      Refrence,
      ModeOfPayment,
      InvestorAmount,
      InvestorDownPayment,
      TotalAmount,
      DownPayment,
      MonthlyInstallment,
      InvestorMonthlyInstallment,
      CornerCharges,
      GrandTotal,
      AppRemarks,
      RefMobileNo,
      Agent,
      CommissionPercentage,
      NoteNo,
      IsActive,
      IsPlotCancel,
      IsCurrentWith,
      PlotCategory,
      Discount,
      PossesionStatus,
      SubAgent,
      SubAgentComm,
      Investor,
      Prepaired_By,
      Prepaired_by_Name,
      TransferAmount,
      TransferDate,
      DevelopmentChargesIncluded,
      DevelopmentAmount,
      DevelopmentChargesDate,
      UpdatedBy,
      RefundedStatus,
      RefundDate,
      DeductedAmount,
      InstallmentsForRefund,
      RefundAmount,
      
    } = req.body;

  
    const updatedData = {
      Date : date ? new Date(date) : new Date() ,
      FileNo,
      FileType,
      Area,
      PlotNo,
      PlotID : parseInt(PlotID),
      Phase,
      Block,
      Total_Installment : parseInt(Total_Installment),
      PlotLocation,
      ApplicantName,
      FatherOrHusband,
      CNICNo,
      ContactNo,
      PermanentAddress,
      PostalAddress,
      Nok,
      NoKFatherName,
      NokSRelation,
      NoKAddress,
      Refrence,
      ModeOfPayment,
      InvestorAmount : parseInt(InvestorAmount),
      InvestorDownPayment : parseInt(InvestorDownPayment),
      TotalAmount : parseInt(TotalAmount),
      DownPayment : parseInt(DownPayment),
      MonthlyInstallment : parseInt(MonthlyInstallment),
      InvestorMonthlyInstallment : parseInt(InvestorMonthlyInstallment),
      CornerCharges : parseInt(CornerCharges),
      GrandTotal : parseInt(GrandTotal),
      AppRemarks,
      RefMobileNo,
      Agent  : parseInt(Agent),
      CommissionPercentage: parseInt(CommissionPercentage),
      NoteNo,
      IsActive,
      IsPlotCancel,
      IsCurrentWith,
      PlotCategory,
      Discount : parseInt(Discount),
      PossesionStatus,
      SubAgent :parseInt(SubAgent),
      SubAgentComm :parseInt(SubAgentComm),
      Investor :parseInt(Investor),
      Prepaired_By :parseInt(Prepaired_By),
      Prepaired_by_Name,
      TransferAmount :parseInt(TransferAmount),
      TransferDate : TransferDate ? new Date(TransferDate) : null,
      DevelopmentChargesIncluded,
      DevelopmentAmount :parseInt(DevelopmentAmount),
      DevelopmentChargesDate : DevelopmentChargesDate ? new Date(DevelopmentChargesDate) : null ,
      UpdatedBy :parseInt(UpdatedBy),
      RefundedStatus,
      RefundDate : RefundDate ? new Date(RefundDate) : null,
      DeductedAmount :parseInt(DeductedAmount),
      InstallmentsForRefund :parseInt(InstallmentsForRefund),
      RefundAmount:parseInt(RefundAmount)
    };


    const updatedForm = await prisma.mainAppForm.update({
      where: {
        ApplicationNo,
      },
      data: updatedData,
    });

    const userActivity = await prisma.testtable.create({
      data:{
        ApplicationNo : updatedForm.ApplicationNo,
        Applicant_Name : 'Updated',
        Agent : UserID , 
        Date : new Date(),
        Receivied_Amount : 0,
        Mode_Of_Payment : 'no',
        Receipt : updatedForm.ApplicationNo,
        File_No : updatedForm.FileNo
      }
    })


    // Convert the response data to a JSON string
    const serializedResponseData = jsonSerializer.stringify(updatedForm);

    

    return res
    .status(200)
    .json(serializedResponseData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error While Updating' });
  }
});

//Delete
router.delete('/mainform/delete',protect,isAdmin , async function (req, res, next) {
  try {
    const { UserID , applicationNo } = req.query;

    console.log(applicationNo)
    
    if (!applicationNo) {
      return res.status(400).json({
        success: false,
        message: 'ApplicationNo is required in the request body.',
      });
    }

    const ApplicationNo = parseInt(applicationNo);


    const mainAppForm = await prisma.mainAppForm.findFirst({
      where: {
        ApplicationNo: parseInt(ApplicationNo),
      },
    });

    // Use Prisma client to delete the record
    const deletedRecord = await prisma.mainAppForm.delete({
      where: {
        ApplicationNo: ApplicationNo,
      },
    });

    const userActivity = await prisma.testtable.create({
      data:{
        ApplicationNo : mainAppForm.ApplicationNo,
        Applicant_Name : 'Deleted',
        Agent : UserID , 
        Date : new Date(),
        Receivied_Amount : 0,
        Mode_Of_Payment : 'no',
        Receipt : mainAppForm.ApplicationNo,
        File_No : mainAppForm.FileNo ?  mainAppForm.FileNo : "not mentioned"
      }
    })

    res.status(200).json({
      success: true,
      message: `Application Form is deleted successfully.`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
});

/*              Transfer Amunt Router                       */

router.put('/TransferFile' ,protect,async function (req, res, next) {
  try {

    
    // Get the form data from the request body
    const {
      applicationNo,
      ApplicantName,
      FatherOrHusband,
      CNICNo,
      ContactNo,
      Nok,
      NokSRelation,
      TransferAmount,
      TransferDate,
    
      
    } = req.body;

  
    const updatedData = {
      ApplicantName,
      FatherOrHusband,
      CNICNo ,
      ContactNo,
      Nok,
      NokSRelation,
      TransferAmount : parseInt(TransferAmount),
      TransferDate : TransferDate ? new Date(TransferDate) : new Date(),
    };


    const updatedForm = await prisma.mainAppForm.update({
      where: {
        ApplicationNo : parseInt(applicationNo),
      },
      data: updatedData,
    });

   return res.status(201).json("Successfully Created Transfered File");

    // // Convert the response data to a JSON string
    // const serializedResponseData = jsonSerializer.stringify(updatedForm);

    

    // return res
    // .status(200)
    // .json(serializedResponseData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error While Updating' });
  }
});

router.get('/TransferFile',protect, async function (req, res, next) {
  try {
    const allMainForm = await prisma.mainAppForm.findMany({
      where: {
        TransferAmount: {
          not: null
        } },
      select : {
        ApplicationNo : true,
        Date:true,
        FileNo : true,
        Area : true,
        PlotNo : true,
        ApplicantName : true,
        ContactNo : true,
        TotalAmount : true,
        TransferDate : true
        
      }
    });

    const MainAppForm = allMainForm.map(item => ({
        ApplicationNo : item.ApplicationNo,
        Date:item.Date.toISOString().split('T')[0],
        File_No : item.FileNo,
        Area : item.Area,
        Plot_No : item.PlotNo,
        Applicant_Name : item.ApplicantName,
        Contact_No : item.ContactNo,
        Total_Amount : item.TotalAmount,
        Transfer_Date : item.TransferDate?.toISOString().split('T')[0]
      
    }));
    const serializedMainAppForm = jsonSerializer.stringify(MainAppForm);

    res.send(serializedMainAppForm);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/transfer/details', protect, async function (req, res, next) {
  try {
    const { FileNo } = req.query;

    // Find the mainAppForm with the provided ApplicationNo in the database
    const mainAppForm = await prisma.mainAppForm.findFirst({
      where: {
        FileNo: FileNo,
      },
    });

    // If form not found, return error
    if (!mainAppForm) {
      return res.status(404).json({ error: 'Form not found' });
    }


   mainAppForm.Date =  mainAppForm.Date?.toISOString().split('T')[0]
   mainAppForm.DevelopmentChargesDate =  mainAppForm.DevelopmentChargesDate?.toISOString().split('T')[0]
   mainAppForm.TransferDate =  mainAppForm.TransferDate?.toISOString().split('T')[0]
   mainAppForm.RefundDate = mainAppForm.RefundDate?.toISOString().split('T')[0]
   mainAppForm.Registry_Date = mainAppForm.Registry_Date?.toISOString().split('T')[0]
   mainAppForm.inteqal_date = mainAppForm.inteqal_date?.toISOString().split('T')[0]
    

    // Convert the response data to a JSON string
    const serializedResponseData = jsonSerializer.stringify(mainAppForm);
    
    // Send the combined data as the response
    res.send(serializedResponseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


/*              Registry/Inteqal Router                       */

router.put('/RegitryInteqal' ,protect,async function (req, res, next) {
  try {

    
    // Get the form data from the request body
    const {
      applicationNo,
      registry_Ineqal_Charges,
      Registry_Date,
      Registry_Number,
      Inteqal_Number,
      inteqal_date
    
      
    } = req.body;

  
    const updatedData = {
      registry_Ineqal_Charges : parseInt(registry_Ineqal_Charges),
      Registry_Date : Registry_Date ? new Date(Registry_Date) : null,
      Registry_Number : Registry_Number ? parseInt(Registry_Number) : null,
      Inteqal_Number:Inteqal_Number ? parseInt(Inteqal_Number) : null,
      inteqal_date : inteqal_date ? new Date(inteqal_date) : null
    };


    const updatedForm = await prisma.mainAppForm.update({
      where: {
        ApplicationNo : parseInt(applicationNo),
      },
      data: updatedData,
    });

   return res.status(201).json("Successfully Created Transfered File");

    // // Convert the response data to a JSON string
    // const serializedResponseData = jsonSerializer.stringify(updatedForm);

    

    // return res
    // .status(200)
    // .json(serializedResponseData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error While Updating' });
  }
});

router.get('/RegitryInteqal',protect, async function (req, res, next) {
  try {
    const allMainForm = await prisma.mainAppForm.findMany({
      where: {
        registry_Ineqal_Charges: {
          not: null
        }
      },
      select: {
        ApplicationNo: true,
        Date: true,
        FileNo: true,
        Area: true,
        PlotNo: true,
        ApplicantName: true,
        ContactNo: true,
        TotalAmount: true,
        registry_Ineqal_Charges: true
      }
    });
    

    const MainAppForm = allMainForm.map(item => ({
        ApplicationNo : item.ApplicationNo,
        Date:item.Date?.toISOString().split('T')[0],
        File_No : item.FileNo,
        Area : item.Area,
        Plot_No : item.PlotNo,
        Applicant_Name : item.ApplicantName,
        Contact_No : item.ContactNo,
        Total_Amount : item.TotalAmount,
        Registry_Inteqal_Charges : item.registry_Ineqal_Charges
      
    }));
    const serializedMainAppForm = jsonSerializer.stringify(MainAppForm);

    res.send(serializedMainAppForm);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/registryInteqal/details', protect, async function (req, res, next) {
  try {
    const { FileNo } = req.query;

    // Find the mainAppForm with the provided ApplicationNo in the database
    const mainAppForm = await prisma.mainAppForm.findFirst({
      where: {
        FileNo: FileNo,
      },
    });

    // If form not found, return error
    if (!mainAppForm) {
      return res.status(404).json({ error: 'Form not found' });
    }


   mainAppForm.Date =  mainAppForm.Date?.toISOString().split('T')[0]
   mainAppForm.DevelopmentChargesDate =  mainAppForm.DevelopmentChargesDate?.toISOString().split('T')[0]
   mainAppForm.TransferDate =  mainAppForm.TransferDate?.toISOString().split('T')[0]
   mainAppForm.RefundDate = mainAppForm.RefundDate?.toISOString().split('T')[0]
   mainAppForm.Registry_Date = mainAppForm.Registry_Date?.toISOString().split('T')[0]
   mainAppForm.inteqal_date = mainAppForm.inteqal_date?.toISOString().split('T')[0]

    

    // Convert the response data to a JSON string
    const serializedResponseData = jsonSerializer.stringify(mainAppForm);
    
    // Send the combined data as the response
    res.send(serializedResponseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});










/*                               Refund Router                              */

//refund schedule
router.get('/refundSchedule',protect, async function(req,res,next){
    try {
        const allMainForm = await prisma.refundTbl.findMany();

        const refund = allMainForm.map((item)=>{
          return{
            RefundID : item.RefundID,
            File_no : item.ApplicationNo,
            Refund_Date : item.RefundDate?.toISOString().split('T')[0],
            Refundable_Amount : item.RefundAmount,
            No_Of_Months : item.Installment,
            Amount_Per_Month : Math.round(parseInt(item.RefundAmount) / parseInt(item.Installment) )
          }
        })
        const serializedMainAppForm = jsonSerializer.stringify(refund);
        console.log(serializedMainAppForm)
        res.send(serializedMainAppForm);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
});

router.get('/refundSchedule/details',protect, async function(req,res,next){
  try {

      const {RefundID} = req.query
      const allMainForm = await prisma.refundTbl.findFirst({
        where : {
          RefundID : parseInt(RefundID)
        }
      });

      const refund = {
          File_no : allMainForm.ApplicationNo,
          Refund_Date : allMainForm.RefundDate?.toISOString().split('T')[0],
          Refundable_Amount : allMainForm.RefundAmount,
          No_Of_Months : allMainForm.Installment,
          Amount_Per_Month : Math.round(parseInt(allMainForm.RefundAmount) / parseInt(allMainForm.Installment) )
        }
      
      const serializedMainAppForm = jsonSerializer.stringify(refund);
  
      res.send(serializedMainAppForm);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
});


router.get('/refundfile/details', protect, async function (req, res, next) {
  try {
    const { FileNo } = req.query;

    // Find the mainAppForm with the provided ApplicationNo in the database
    const mainAppForm = await prisma.mainAppForm.findFirst({
      where: {
        FileNo: FileNo,
      },
    });

    // If form not found, return error
    if (!mainAppForm) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const receiptTotal = await prisma.receiptTbl.aggregate({
      where: {
        ReceiptNo: parseInt(mainAppForm.ApplicationNo),
      },
      _sum: {
        ReceivedAmount: true,
      },
    });
    
    const Total_Paid_Amount = parseFloat(receiptTotal._sum.ReceivedAmount) + parseFloat(mainAppForm.DownPayment)



   mainAppForm.Date =  mainAppForm.Date?.toISOString().split('T')[0]
   mainAppForm.DevelopmentChargesDate =  mainAppForm.DevelopmentChargesDate?.toISOString().split('T')[0]
   mainAppForm.TransferDate =  mainAppForm.TransferDate?.toISOString().split('T')[0]
   mainAppForm.RefundDate = mainAppForm.RefundDate?.toISOString().split('T')[0]
   mainAppForm.Registry_Date = mainAppForm.Registry_Date?.toISOString().split('T')[0]
   mainAppForm.inteqal_date = mainAppForm.inteqal_date?.toISOString().split('T')[0]
    

   const refundData = {
    ...mainAppForm , Total_Paid_Amount
   }
    // Convert the response data to a JSON string
    const serializedResponseData = jsonSerializer.stringify(refundData);
    
    // Send the combined data as the response
    res.send(serializedResponseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//create refund
router.post('/createRefund',protect, async function (req, res, next) {
  try {
    const {
      ApplicationNo,
      RefundDate,
      RefundAmount,
      Installment,
      ModeofPayment,
      Remarks,
    } = req.body;

    const data = {
      ApplicationNo : parseInt(ApplicationNo),
      RefundDate : RefundDate ? new Date(RefundDate) : new Date(),
      RefundAmount : parseInt(RefundAmount),
      Installment ,
      ModeofPayment,
      Remarks ,
    };

    // Now you can use 'data' to create a new RefundTbl record in the database.
    // For example, using Prisma:
    const newRefund = await prisma.refundTbl.create({
      data: data,
    });
    const serializednewRefund = jsonSerializer.stringify(newRefund);

    res.status(200).json(serializednewRefund);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


//files developmnt charges
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

/*
            Token Money
*/
router.post('/CreateTokenMoney',protect, async function (req, res, next) {
  try {
    const {
          FileNo,
          Total_Installment,
          ApplicantName,
          FatherOrHusband,
          CNICNo,
          ContactNo,
          PermanentAddress,
          Nok,
          TotalAmount,
          ReceivedAmount,
          AmountReceivedForPlot,
          ModeOfPayment,
          Prepaired_By,
          Prepaired_by_Name,
          Remarks,
    } = req.body;

    const existingMainAppForm = await prisma.mainAppForm.findFirst({
      where: {
        FileNo: FileNo,
      },
    });

    if (existingMainAppForm) {
      return res.status(400).json({ message: 'File number already exists' });
    }


    const MainAppFormdata = {
         Date : new Date(),
          FileNo,
          Total_Installment : Total_Installment ?  parseInt(Total_Installment) : 0,
          ApplicantName : ApplicantName.toUpperCase(),
          FatherOrHusband : FatherOrHusband ? FatherOrHusband.toUpperCase() : "not mention",
          CNICNo,
          ContactNo,
          PermanentAddress : PermanentAddress ? PermanentAddress.toUpperCase() : "not mentioned",
          Nok : Nok ?  Nok.toUpperCase() : "not mention",
          TotalAmount : parseInt(TotalAmount),
          DownPayment : parseInt(ReceivedAmount),
    }

    const newMainAppForm = await prisma.MainAppForm.create({
      data: MainAppFormdata,
    });

    const ReceiptData = {
          ReceiptNo :  newMainAppForm.ApplicationNo,
          FileNo,
          Date : new Date(),
          ReceivedAmount : parseInt(ReceivedAmount),
          AmountReceivedForPlot : AmountReceivedForPlot ? AmountReceivedForPlot : "not mentioned" ,
          ModeOfPayment,
          Receipt : newMainAppForm.ApplicationNo,
          Prepaired_By : Prepaired_By ? parseInt(Prepaired_By) : 1,
          Prepaired_by_Name : Prepaired_by_Name ? Prepaired_by_Name.toUpperCase() : 'Not mentioned',
          Remarks :  Remarks ? Remarks.toUpperCase() : null,
          ReceiptType : 4
    }

    const newReceipt = await prisma.receiptTbl.create({
      data: ReceiptData,
    });




    const serializedMainAppForm = jsonSerializer.stringify(newMainAppForm);

    return res.status(200).send(serializedMainAppForm);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
});


router.get('/TokenMoney',protect, async function (req, res, next) {
  try {

    // Prisma query to retrieve refund records with ReceivedAmount = 15000
    const allMainForm = await prisma.receiptTbl.findMany({
      where: {
        ReceiptType : 4
      },
      select : {
        Id:true,
        ReceiptNo : true,
        FileNo : true,
        Date : true,
        Prepaired_by_Name: true,
        AmountReceivedForPlot : true,
        ReceivedAmount : true,
        Remarks:true
      }
    });
    const MainAppForm = allMainForm.map(item => ({
        Id:item.Id,
        Receipt_No : item.ReceiptNo ,
        File_No : item.FileNo ? item.FileNo : null,
        Date: item.Date?.toISOString().split('T')[0],
        Prepaired_by_Name : item.Prepaired_by_Name,
        Plot : item.AmountReceivedForPlot,
        Token_Amount : item.ReceivedAmount,
        Remarks:item.Remarks ? item.Remarks : null,
  
    }));

    const serializedMainAppForm = jsonSerializer.stringify(MainAppForm);

    res.send(serializedMainAppForm);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/Tokendetails',protect, async function (req, res, next) {
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
        Amount_Received_For_Plot: Record.AmountReceivedForPlot,
        Mode_Of_Payment: Record.ModeOfPayment,
        Prepaired_by_Name: Record.Prepaired_by_Name,
        Remarks: Record.Remarks,
        Receipt_Type: Record.ReceiptType,
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

router.put('/Tokendetails',protect, async function (req, res, next) {
  try {
    const { 
      Id,
      Receipt_No,
      DownPayment
     } = req.body;

     updateMainappForm = {
      DownPayment : parseInt(DownPayment)
     }
     const main = await prisma.mainAppForm.update({
      where : {
        ApplicationNo : parseInt(Receipt_No)
      },
      data : updateMainappForm
     })

     const updatereceipptForm = {
      ReceivedAmount : parseInt(DownPayment),
      ReceiptType : 1
     }

     const updatereceipt = await prisma.receiptTbl.update({
      where : {
        Id : parseInt(Id)
      },
      data : updatereceipptForm
     })

     const receipt = {
      Id : updatereceipt.Id, 
      Receipt_No: updatereceipt.ReceiptNo,
      File_No: updatereceipt.FileNo,
      Date: updatereceipt.Date?.toISOString().split('T')[0],
      Received_Amount: updatereceipt.ReceivedAmount,
      Amount_Received_For_Plot: updatereceipt.AmountReceivedForPlot,
      Mode_Of_Payment: updatereceipt.ModeOfPayment,
      Prepaired_by_Name: updatereceipt.Prepaired_by_Name,
      Remarks: updatereceipt.Remarks,
      Receipt_Type: updatereceipt.ReceiptType,
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


module.exports = router;
