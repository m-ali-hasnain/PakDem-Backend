var express = require('express');
var router = express.Router();
const { PrismaClient, Prisma } = require('@prisma/client');
const JSONbig = require('json-bigint');

const prisma = new PrismaClient();
const jsonSerializer = JSONbig({ storeAsString: true });
var { isAdmin,protect } = require('../middleware/authMiddleware')

router.get('/', protect, async function (req, res, next) {
  try {
    const { userEnteredFileNo } = req.query;

    // Find payment schedule for the given FileNo
    const paymentSchedule = await prisma.paymentSchedule.findMany({
      where: {
        FileNo: parseInt(userEnteredFileNo),
      },
      select: {
        PaymentScheduleID: true,
        DueDate: true,
        MonthIyInstallement: true,
      },
    });

    if (!paymentSchedule || paymentSchedule.length === 0) {
      return res.status(404).json({ message:  `No Payment Schedule With File ${userEnteredFileNo} found`});
    }

    // Find the corresponding MainAppForm for the FileNo
    const mainAppForm = await prisma.mainAppForm.findFirst({
      where: {
        FileNo: userEnteredFileNo,
      },
      select: {
        Total_Installment: true,
      },
    });

    if (!mainAppForm) {
      return res.status(404).json({ message: `No Application With File ${userEnteredFileNo} found` });
    }

    const installmentDetails = [];

    for (let i = 0; i < mainAppForm.Total_Installment; i++) {
      const dueDate = new Date(paymentSchedule[i % paymentSchedule.length].DueDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      const installmentNumber = i + 1;
      const monthlyInstallment = paymentSchedule[i % paymentSchedule.length].MonthIyInstallement;

      installmentDetails.push({
        Id: installmentNumber,
        Installment_Number: installmentNumber,
        Due_Date: dueDate.toLocaleString('en-US', { month: '2-digit', year: 'numeric' }),
        Monthly_Installment: monthlyInstallment,
        Payment_Nature : paymentSchedule.PaymentNature,
      });
    }

    // Serialize the installment details
    const jsonSerializer = JSONbig({ storeAsString: true });
    const serializedInstallmentDetails = jsonSerializer.stringify(installmentDetails);

    res.send(serializedInstallmentDetails);
  } catch (error) {
    console.error(error);
    next(error);
  }
});



module.exports = router;
