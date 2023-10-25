var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const JSONbig = require('json-bigint');

const prisma = new PrismaClient();
const jsonSerializer = JSONbig({ storeAsString: true });
var { isAdmin,protect } = require('../middleware/authMiddleware')

router.get('/', protect,isAdmin,async function (req, res, next) {
  try {

    const allPlots = await prisma.plotCancellationLetter.findMany();

    const jsonSerializer = JSONbig({ storeAsString: true });

      const files = await prisma.mainAppForm.findMany({
        select: {
          ApplicationNo: true,
          FileNo: true,
        },
      })

      


      const cacncelledPlots = allPlots.map((allPlot) => {
        const File = files.find((file) => allPlot.PlotID == file.ApplicationNo);
  
        return {
          PlotCancelID : allPlot.PlotCancelID,
          Cancellation_Date : allPlot.CancellationDate.toISOString().split('T')[0],
          Amount_Not_Paid : allPlot.AmountNotPaid,
          Reason_For_Cancellation : allPlot.ReasonForCancellation,
          File_No : File.FileNo
        
        };
      });

  

    // Serialize the BigInt values using json-bigint
    const serializedPlots = jsonSerializer.stringify(cacncelledPlots);

    res.send(serializedPlots);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/details', async function (req, res, next) {

  const {PlotCancelID} = req.query

  try {
    const allPlots = await prisma.plotCancellationLetter.findFirst({
      where:{
        PlotCancelID : parseInt(PlotCancelID)
      }
    });

    const mainAppForm =  await prisma.mainAppForm.findFirst({
      where:{
        ApplicationNo : allPlots.PlotID
      },
      select:{
        FileNo: true,
      }
    })
    const jsonSerializer = JSONbig({ storeAsString: true });

    const plotDetails = {
      PlotCancelID : allPlots.PlotCancelID,
      Cancellation_Date : allPlots.CancellationDate?.toISOString().split('T')[0],
      Amount_Not_Paid : allPlots.AmountNotPaid,
      Reason_For_Cancellation : allPlots.ReasonForCancellation,
      File_No : mainAppForm.FileNo
    }

    // Serialize the BigInt values using json-bigint
    const serializedPlots = jsonSerializer.stringify(plotDetails);

    res.send(serializedPlots);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//create plot cancellation
router.post('/create',protect,isAdmin, async function (req, res, next) {
  try {
    const {
      PlotID,
      CancellationDate,
      AmountNotPaid,
      ReasonForCancellation,
    } = req.body;

    const data = {
      PlotID : parseInt(PlotID),
      CancellationDate : CancellationDate ? new Date(CancellationDate) : new Date(),
      AmountNotPaid : parseInt(AmountNotPaid),
      ReasonForCancellation,
    };

    console.log(data);

    const newPlotCancellationLetter = await prisma.plotCancellationLetter.create({
      data: data,
    });

    console.log(newPlotCancellationLetter);
    const serializedNewPlotCancellationLetter = jsonSerializer.stringify(newPlotCancellationLetter);

    res.status(200).json(serializedNewPlotCancellationLetter);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

//create plot cancellation
router.put('/Update',protect,isAdmin, async function (req, res, next) {
  try {
    const {
      PlotCancelID,
      PlotID,
      CancellationDate,
      AmountNotPaid,
      ReasonForCancellation,
    } = req.body;

    const data = {
      PlotID,
      CancellationDate : new Date(CancellationDate),
      AmountNotPaid,
      ReasonForCancellation,
    };

    console.log(data);

    const updatePlotCancellationLetter = await prisma.plotCancellationLetter.update({
      where:{
        PlotCancelID : parseInt(PlotCancelID)
      },
      data: data,
    });
    console.log(updatePlotCancellationLetter);
    const serializedupdatePlotCancellationLetter = jsonSerializer.stringify(updatePlotCancellationLetter);
    res.status(200).json(serializedupdatePlotCancellationLetter);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

//Delete
router.delete('/delete',protect,isAdmin, async function (req, res, next) {
  try {


    const PlotCancel = await prisma.plotCancellationLetter.delete({
      where:{
        PlotCancelID : parseInt(req.body.PlotCancelID),
      }
    });
    res.status(200).json({
      success: true,
      message: `plot Cancellation Letter has been deleted successfully.`
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});


module.exports = router;
