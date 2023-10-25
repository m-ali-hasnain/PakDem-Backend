var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const JSONbig = require('json-bigint');

const prisma = new PrismaClient();

const jsonSerializer = JSONbig({ storeAsString: true });
var { isAdmin,protect } = require('../middleware/authMiddleware')

router.get('/',protect,isAdmin, async function (req, res, next) {
  try {
    const allPricePlots = await prisma.plotPrice.findMany({
      select:{
        PlotPriceID:true,
        PlotCategory:true,
        PlotSize:true,
        PriceDate:true,
        PlotPrice:true,
        MonthlyInstallment:true,
        TotalMonthlyInstallments:true,
        Extra15Percent:true
      }
    });
    const jsonSerializer = JSONbig({ storeAsString: true });

    const PlotPrices = allPricePlots.map(item => ({
      PlotPriceID:item.PlotPriceID,
      Plot_Category:item.PlotCategory,
      Plot_Size:item.PlotSize,
      Price_Date: item.PriceDate.toISOString().split('T')[0],
      Plot_Price:item.PlotPrice,
      Monthly_Installment:item.MonthlyInstallment,
      Total_Monthly_Installments:item.TotalMonthlyInstallments,
      Extra_15_Percent:item.Extra15Percent,
      
    }));

    // Serialize the BigInt values using json-bigint
    const serializedPricePlots = jsonSerializer.stringify(PlotPrices);

    res.send(serializedPricePlots);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//Get 1 plot price
router.get('/details',protect,isAdmin, async function (req, res, next) {
  try {

    const  { PlotPriceID } = req.query

    const allPricePlots = await prisma.plotPrice.findFirst({
      where:{
        PlotPriceID : parseInt(PlotPriceID),
      }
    });
    const jsonSerializer = JSONbig({ storeAsString: true });

    PricePlot = {
      PlotPriceID: allPricePlots.PlotPriceID,
      Plot_Category: allPricePlots.PlotCategory,
      Plot_Size: allPricePlots.PlotSize,
      Price_Date: allPricePlots.PriceDate.toISOString().split('T')[0],
      Plot_Price: allPricePlots.PlotPrice,
      Monthly_Installment: allPricePlots.MonthlyInstallment,
      Total_Monthly_Installments: allPricePlots.TotalMonthlyInstallments,
      Extra_15_Percent: allPricePlots.Extra15Percent,
      Token_Money: allPricePlots.TokenMoney,
      Confirmation_Advance: allPricePlots.ConfirmationAdvance,
      Quarterly_Installment: allPricePlots.QuarterlyInstallment,
      Total_Installment_Quarterly: allPricePlots.TotalInstallmentQuarterly,
    }
    

    // Serialize the BigInt values using json-bigint
    const serializedPricePlots = jsonSerializer.stringify(PricePlot);

    res.send(serializedPricePlots);
  } catch (error) {
    console.error(error);
    next(error);
  }
});


// create plot price
router.post('/createPlotPrice',protect,isAdmin, async function (req, res, next) {
  try {
    const {
      PlotCategory,
      PlotSize,
      PlotPrice,
      MonthlyInstallment,
      TotalMonthlyInstallments,
      Extra15Percent,
    } = req.body;

    const data = {
      PlotCategory,
      PlotSize,
      PriceDate :   new Date(),
      PlotPrice : parseInt(PlotPrice),
      MonthlyInstallment : parseInt(MonthlyInstallment),
      TotalMonthlyInstallments : parseInt(TotalMonthlyInstallments),
      Extra15Percent : parseInt(Extra15Percent),
    };

    const newPlotPrice = await prisma.plotPrice.create({
      data: data,
    });

    const serializednewPlotPrice = jsonSerializer.stringify(newPlotPrice);

    res.status(200).json(serializednewPlotPrice);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

//update
router.put('/update',protect,isAdmin, async function (req, res, next) {
  try {

    const  { 
      PlotPriceID ,
      PlotCategory,
      PlotSize,
      PlotPrice,
      MonthlyInstallment,
      TotalMonthlyInstallments,
      Extra15Percent
     } = req.body

    const allPricePlots = await prisma.plotPrice.update({
      where:{
        PlotPriceID : parseInt(PlotPriceID),
      } ,
      data : {
        PlotCategory,
        PlotSize,
        PriceDate :   new Date(),
        PlotPrice : parseInt(PlotPrice),
        MonthlyInstallment : parseInt(MonthlyInstallment),
        TotalMonthlyInstallments : parseInt(TotalMonthlyInstallments),
        Extra15Percent : parseInt(Extra15Percent),
      }
    });
    const jsonSerializer = JSONbig({ storeAsString: true });

    // Serialize the BigInt values using json-bigint
    const serializedPricePlots = jsonSerializer.stringify(allPricePlots);

    res.send(serializedPricePlots);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//Delete Plot Price
router.delete('/delete',protect,isAdmin, async function (req, res, next) {
  try {

    const  { PlotPriceID  } = req.query

    const allPricePlots = await prisma.plotPrice.delete({
      where:{
        PlotPriceID : parseInt(PlotPriceID),
      }
    });
    res.status(200).json({
      success: true,
      message: `Plot Price has been deleted successfully.`
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});


module.exports = router;
