const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const JSONbig = require('json-bigint');

const prisma = new PrismaClient();

var {isAdmin, protect } = require('../middleware/authMiddleware')

const jsonSerializer = JSONbig({ storeAsString: true });

// vouchers
router.get('/vouchers',protect,isAdmin, async function (req, res, next) {
  try {
    const allvouchers = await prisma.voucherTbl.findMany();
    const serializedallvouchers = jsonSerializer.stringify(allvouchers);

    res.send(serializedallvouchers);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

//Create Vouchers
router.post('/createVoucher',protect, isAdmin,async function (req, res, next) {
  try {
    const {
      FileNo,
      VoucherDate,
      Agent,
      Amount,
      Description,
      CommissionPercentage,
      CommissionType,
      BBF,
      VoucherNo
    } = req.body;

    const data = {
      FileNo,
      VoucherDate,
      Agent,
      Amount,
      Description,
      CommissionPercentage,
      CommissionType,
      BBF,
      VoucherNo
    };

    console.log(data);

    // Now you can use 'data' to create a new RefundTbl record in the database.
    // For example, using Prisma:
    const newVoucher = await prisma.voucherTbl.create({
      data: data,
    });
    console.log(newVoucher);
    const serializednewVoucher = jsonSerializer.stringify(newVoucher);

    res.status(200).json(serializednewVoucher);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// 1 vouchers
router.get('/voucher/details', protect,isAdmin, async function (req, res, next) {
  try {

    const {Id} = req.body

    const VoucherID = parseInt(Id)

    console.log(VoucherID)

    const allvouchers = await prisma.voucherTbl.findFirst({
      where:{
        VoucherID : VoucherID,
      }
    });
    const serializedallvouchers = jsonSerializer.stringify(allvouchers);

    res.send(serializedallvouchers);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

//Update voucher
router.put('/voucher/update',protect,isAdmin, async function (req, res, next) {
  try {
    const {
      VoucherID,
      FileNo,
      VoucherDate,
      Agent,
      Amount,
      Description,
      CommissionPercentage,
      CommissionType,
      BBF,
      VoucherNo
    } = req.body;

    const data = {
      FileNo,
      VoucherDate : new Date(VoucherDate),
      Agent,
      Amount,
      Description,
      CommissionPercentage,
      CommissionType,
      BBF,
      VoucherNo
    };

    console.log(data);

    // Now you can use 'data' to create a new RefundTbl record in the database.
    // For example, using Prisma:
    const UpdatedVoucher = await prisma.voucherTbl.update({
      where:{
        VoucherID : parseInt(VoucherID)
      },
      data: data,
    });

    console.log(UpdatedVoucher);
    const serializedUpdatedVoucher = jsonSerializer.stringify(UpdatedVoucher);

    res.status(200).json(serializedUpdatedVoucher);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

//Delete
router.delete('/voucher/delete',protect,isAdmin, async function (req, res, next) {
  try {
    const { VoucherID } = req.body;

    if (!VoucherID) {
      return res.status(400).json({
        success: false,
        message: 'VoucherID is required in the request body.',
      });
    }

    // Use Prisma client to delete the record
    const deletedRecord = await prisma.voucherTbl.delete({
      where: {
        VoucherID: parseInt(VoucherID),
      },
    });

    res.status(200).json({
      success: true,
      message: `Record with VoucherID ${VoucherID} has been deleted successfully.`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
});

module.exports = router;