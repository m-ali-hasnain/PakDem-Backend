var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const JSONbig = require('json-bigint');

const prisma = new PrismaClient();

const jsonSerializer = JSONbig({ storeAsString: true });

var { protect ,isAdmin } = require('../middleware/authMiddleware')

router.get('/',protect, async function (req, res, next) {
  try {
    const agentsAndVouchers = await prisma.agentTbl.findMany({
      select: {
        AgentName: true,
        VoucherTbl: {
          select: {
            VoucherID: true,
            FileNo: true,
            VoucherDate: true,
            Amount: true,
            Description: true,
          },
        },
      },
    });

    const agentsWithData = agentsAndVouchers.filter(agent => agent.VoucherTbl.length > 0);

    const vouchers = agentsWithData.flatMap((voucher) => {
      return voucher.VoucherTbl.map((vouch) => {
        return {
          VoucherNo: vouch.VoucherID,
          Voucher_ID: vouch.VoucherID,
          File: vouch.FileNo,
          Date: vouch.VoucherDate?.toISOString().split('T')[0],
          Amount: vouch.Amount,
          Description: vouch.Description,
          Agent_Name: voucher.AgentName,
        };
      });
    });

    const jsonSerializer = JSONbig({ storeAsString: true });

    // Serialize the BigInt values using json-bigint
    const serializedData = jsonSerializer.stringify(vouchers);

    res.send(serializedData);
  } catch (error) {
    console.error(error);
    next(error);
  }
});


//Get details
router.get('/details',protect, async function (req, res, next) {

  const {VoucherID} = req.query



  try {
    const agentsAndVouchers = await prisma.voucherTbl.findFirst({
      where: {
        VoucherID: parseInt(VoucherID)
      },
      select: {
            VoucherID: true,
            FileNo: true,
            VoucherDate: true,
            Amount: true,
            Description: true,
            Agent : true
          },
    });

    const getAgent = await prisma.agentTbl.findFirst({
      where: {
        AgentID: parseInt(agentsAndVouchers.Agent)
      },
      select:{
        AgentName:true
      }
    })


    const voucher = {
      Voucher_No: agentsAndVouchers.VoucherID,
      File: agentsAndVouchers.FileNo,
      Date: agentsAndVouchers.VoucherDate?.toISOString().split('T')[0],
      Amount: agentsAndVouchers.Amount,
      Description: agentsAndVouchers.Description,
      Name: getAgent.AgentName,
    }

    const jsonSerializer = JSONbig({ storeAsString: true });

    // Serialize the BigInt values using json-bigint
    const serializedData = jsonSerializer.stringify(voucher);

    res.send(serializedData);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
