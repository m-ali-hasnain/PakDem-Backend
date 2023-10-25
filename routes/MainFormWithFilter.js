const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const JSONbig = require('json-bigint');

const prisma = new PrismaClient();

const jsonSerializer = JSONbig({ storeAsString: true });
var { protect } = require('../middleware/authMiddleware')
router.get('/', protect,async function (req, res, next) {
  try {
   const { PlotNo, FileNo, ApplicantName, CNICNo } = req.body;

        const mainForms = await prisma.MainAppForm.findMany({
          where: {
            ...(CNICNo ? { CNICNo: CNICNo } : {}),
            ...(FileNo ? { FileNo: FileNo } : {}),
            ...(ApplicantName ? { ApplicantName: ApplicantName } : {}),
            ...(PlotNo ? { PlotNo: PlotNo } : {}),
          },
          select: {
            ApplicationNo:true,
            Date: true,
            FileNo: true,
            FileType: true,
            PlotNo: true,
            ContactNo : true,
            ApplicantName: true,
            Agent: true,
          },
        });
  
        
        const forms = mainForms.map((mainform)=>{
          return {
            ApplicationNo : mainform.ApplicationNo,
            Date: mainform.Date?.toISOString().split('T')[0],
            File_No: mainform.FileNo,
            File_Type: mainform.FileType,
            Plot_No: mainform.PlotNo,
            Contact_No : mainform.ContactNo,
            Applicant_Name: mainform.ApplicantName,
            Agent: mainform.Agent,
          }
        })
  

    const jsonSerializer = JSONbig({ storeAsString: true });
    const serializedMainForms = jsonSerializer.stringify(mainForms);
    res.send(serializedMainForms);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
