var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const JSONbig = require('json-bigint');

const prisma = new PrismaClient();
const jsonSerializer = JSONbig({ storeAsString: true });
var { isAdmin,protect } = require('../middleware/authMiddleware')

router.get('/',protect, isAdmin,async function (req, res, next) {
  try {
    const allPlots = await prisma.plotsTbl.findMany({
      select:{
        PlotID:true,
        Plots:true,
        PlotNo:true,
        Block:true,
        sold:true

      }
    });

    const Plots = allPlots.map((Plot)=>{
        return {
          PlotID:Plot.PlotID,
          Plots:Plot.Plots,
          PlotNo:Plot.PlotNo,
          Block:Plot.Block,
          sold:Plot.sold
        }
    })
    const jsonSerializer = JSONbig({ storeAsString: true });

    // Serialize the BigInt values using json-bigint
    const serializedPlots = jsonSerializer.stringify(Plots);

    res.send(serializedPlots);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//View 1 plot
router.get('/details',protect,isAdmin, async function (req, res, next) {
  try {

    const { PlotID } = req.query

    const allPlots = await prisma.plotsTbl.findFirst({
      where:{
        PlotID : parseInt(PlotID)
      }
    });
    const jsonSerializer = JSONbig({ storeAsString: true });

    const Plot = {
      
        PlotID: allPlots.PlotID,
        ProjectID: allPlots.ProjectID,
        PlotPrice: allPlots.PlotPrice,
        PlotNo: allPlots.PlotNo,
        Plots: allPlots.Plots,
        PlotSize: allPlots.PlotSize,
        Street: allPlots.Street,
        Phase: allPlots.Phase,
        Block: allPlots.Block,
        Category: allPlots.Category,
        PlotLocation: allPlots.PlotLocation,
        Amount: allPlots.Amount,
        PlotStatus: allPlots.PlotStatus,
        sold: allPlots.sold ? "yes" : "no",
        TokenMoney: allPlots.TokenMoney,
        CornfirmationAdvance: allPlots.CornfirmationAdvance,
        MonthlyInstallment: allPlots.MonthlyInstallment,
        QuarterlyInstallment: allPlots.QuarterlyInstallment,
        Extra15Percent: allPlots.Extra15Percent,
        TotalQuarterlyInstallment: allPlots.TotalQuarterlyInstallment,
        TotalMonthlyInstallment: allPlots.TotalMonthlyInstallment
      
    }
    const serializedPlots = jsonSerializer.stringify(Plot);

    res.send(serializedPlots);
  } catch (error) {
    console.error(error);
    next(error);
  }
});



//create plots
router.post('/createPlot',protect,isAdmin, async function (req, res, next) {
  try {
    const {
      ProjectID,
      PlotPrice,
      PlotNo,
      Plots,
      PlotSize,
      Street,
      Phase,
      Block,
      Category,
      PlotLocation,
      Amount,
      PlotStatus,
      sold,
    } = req.body;

    const data = {
      ProjectID,
      PlotPrice : parseInt(PlotPrice),
      PlotNo : parseInt(PlotNo),
      Plots,
      PlotSize,
      Street,
      Phase,
      Block,
      Category,
      PlotLocation,
      Amount : parseInt(Amount),
      PlotStatus,
      sold,

    };


    const newPlot = await prisma.plotsTbl.create({
      data: data,
    });

    console.log(newPlot);
    const serializedNewPlot = jsonSerializer.stringify(newPlot);

    res.status(200).json(serializedNewPlot);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

//Update plots
router.put('/update',protect,isAdmin, async function (req, res, next) {
  try {

    const  { 
      PlotID ,
      ProjectID,
      PlotPrice,
      PlotNo,
      Plots,
      PlotSize,
      Street,
      Phase,
      Block,
      Category,
      PlotLocation,
      Amount,
      PlotStatus,
      sold, 
        } = req.body

    const UpdatedPlot = await prisma.plotsTbl.update({
      where:{
        PlotID : parseInt(PlotID)
      },
      data: {
        ProjectID,
        PlotPrice : parseInt(PlotPrice),
        PlotNo : parseInt(PlotNo),
        Plots,
        PlotSize,
        Street,
        Phase,
        Block,
        Category,
        PlotLocation,
        Amount : parseInt(Amount),
        PlotStatus,
        sold,
      }
    });
    const jsonSerializer = JSONbig({ storeAsString: true });

    // Serialize the BigInt values using json-bigint
    const serializedUpdatedPlot = jsonSerializer.stringify(UpdatedPlot);

    res.send(serializedUpdatedPlot);
  } catch (error) {
    console.error(error);
    next(error);
  }
});


router.delete('/delete',protect,isAdmin, async function (req, res, next) {
  try {

    const  { PlotID  } = req.query

    const allPricePlots = await prisma.plotsTbl.delete({
      where:{
        PlotID : parseInt(PlotID),
      }
    });
    res.status(200).json({
      success: true,
      message: `Plot details are deleted successfully.`
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});



module.exports = router;
