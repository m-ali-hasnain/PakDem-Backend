const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const JSONbig = require('json-bigint');

const prisma = new PrismaClient();
const jsonSerializer = JSONbig({ storeAsString: true });
var {isAdmin,protect } = require('../middleware/authMiddleware')

router.get('/',protect, isAdmin,async function (req, res, next) {
  try {
    const { plotSize, plotBlock, applicantName, agent } = req.body;
        
        const mainForms = await prisma.MainAppForm.findMany({
          where: {
            Area: plotSize,
            Block: plotBlock,
            ...(applicantName ? { ApplicantName: applicantName } : {}),
            ...(agent ? { Agent: agent } : {}),
          },
          select: {
            Date: true,
            FileNo: true,
            FileType: true,
            PlotNo: true,
            Phase: true,
            Block: true,
            PlotLocation: true,
            ApplicantName: true,
            TotalAmount: true,
            Agent: true,
            PlotCategory: true,
          },
        });

        const forms = mainForms.map((form) => {
          return {
            Date: form.Date,
            File_No: form.FileNo,
            File_Type: form.FileType,
            Plot_No: form.PlotNo,
            Phase: form.Phase,
            Block: form.Block,
            Plot_Location: form.PlotLocation,
            Applicant_Name: form.ApplicantName,
            Total_Amount: form.TotalAmount,
            Agent: form.Agent,
            Plot_Category: form.PlotCategory,
          }

        })
  
    const jsonSerializer = JSONbig({ storeAsString: true });
    const serializedMainForms = jsonSerializer.stringify(forms);
    res.send(serializedMainForms);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
