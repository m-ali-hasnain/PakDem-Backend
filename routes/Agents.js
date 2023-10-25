var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const JSONbig = require('json-bigint');

const prisma = new PrismaClient();

var { isAdmin,protect } = require('../middleware/authMiddleware')

const jsonSerializer = JSONbig({ storeAsString: true });

//All agents
router.get('/', protect ,isAdmin,async function (req, res, next) {
  try {
    const allAgents = await prisma.agentTbl.findMany({
      select: {
        AgentID: true,
        RegistrationDate: true,
        AgentName: true,
        AgentCNICNo: true,
        CompanyName: true,
        OfficeNo:true,
        Phone: true,
        Email: true,
        CommissionPercentage:true,
        DownPaymentCommission:true,
        InstallmentCommission:true
      }
    });

    const Agents = allAgents.map((agent)=> {
      return {
        AgentID : agent.AgentID,
        Date : agent.RegistrationDate?.toISOString().split('T')[0],
        Name : agent.AgentName,
        CNIC : agent.AgentCNICNo,
        Company : agent.CompanyName,
        Office_No : agent.OfficeNo,
        Phone : agent.Phone,
        Email : agent.Email,
        Commission_percent : agent.CommissionPercentage,
        DP_Com : agent.DownPaymentCommission,
        Installment_Comm : agent.InstallmentCommission
    } })

    const jsonSerializer = JSONbig({ storeAsString: true });

    // Serialize the BigInt values using json-bigint
    const serializedallAgents = jsonSerializer.stringify(Agents);

    res.send(serializedallAgents);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//Get 1 agent
router.get('/details',protect,isAdmin, async function (req, res, next) {
  try {

    const { AgentID } =  req.query

    const allAgents = await prisma.agentTbl.findFirst({
      where : {
        AgentID : parseInt(AgentID)
      }
    });
    const jsonSerializer = JSONbig({ storeAsString: true });

    const Agent = {
      Agent_ID : allAgents.AgentID,
      Registration_Date : allAgents.RegistrationDate.toISOString().split('T')[0],
      Agent_Name : allAgents.AgentName,
      Agent_CNIC_No : allAgents.AgentCNICNo,
      Agent_Father_Name :  allAgents.AgentFatherName,
      Company_Name : allAgents.CompanyName,
      Company_Address : allAgents.CompanyAddress,
      Office_No : allAgents.OfficeNo,
      Phone : allAgents.Phone,
      Email : allAgents.Email,
      Commission_Percentage : allAgents.CommissionPercentage,
      Down_Payment_Commission : allAgents.DownPaymentCommission,
      Installment_Commission : allAgents.InstallmentCommission,
      Opening_Balance : allAgents.OpeningBalance,
      Opening_Balance_Date :allAgents.OpeningBalanceDate?.toISOString().split('T')[0],
    }

    // Serialize the BigInt values using json-bigint
    const serializedallAgents = jsonSerializer.stringify(Agent);

    res.send(serializedallAgents);

  } catch (error) {
    console.error(error);
    next(error);
  }
});




//create agents
router.post('/createAgent',protect,isAdmin, async function (req, res, next) {
  try {
    const {
      RegistrationDate,
      AgentName,
      AgentCNICNo,
      AgentFatherName,
      CompanyName,
      CompanyAddress,
      OfficeNo,
      Phone,
      Email,
      CommissionPercentage,
      DownPaymentCommission,
      InstallmentCommission,
      OpeningBalance,
      OpeningBalanceDate,
    } = req.body;

    const data = {
      RegistrationDate : RegistrationDate ? new Date(RegistrationDate) : new Date(),
      AgentName,
      AgentCNICNo,
      AgentFatherName,
      CompanyName,
      CompanyAddress,
      OfficeNo,
      Phone,
      Email,
      CommissionPercentage,
      DownPaymentCommission,
      InstallmentCommission,
      OpeningBalance,
      OpeningBalanceDate : new Date(OpeningBalanceDate),
    };

    console.log(data);

    // Now you can use 'data' to create a new AgentTbl record in the database.
    // For example, using Prisma:
    const newAgent = await prisma.agentTbl.create({
      data: data,
    });

    console.log(newAgent);
    const serializedNewAgent = jsonSerializer.stringify(newAgent);

    res.status(200).json(serializedNewAgent);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

//Update Agent
router.put('/updateAgent',protect,isAdmin, async function (req, res, next) {
  try {
    const {
      AgentID ,
      RegistrationDate,
      AgentName,
      AgentCNICNo,
      AgentFatherName,
      CompanyName,
      CompanyAddress,
      OfficeNo,
      Phone,
      Email,
      CommissionPercentage,
      DownPaymentCommission,
      InstallmentCommission,
      OpeningBalance,
      OpeningBalanceDate,
    } = req.body;

    const data = {
      RegistrationDate : new Date(RegistrationDate),
      AgentName,
      AgentCNICNo,
      AgentFatherName,
      CompanyName,
      CompanyAddress,
      OfficeNo,
      Phone,
      Email,
      CommissionPercentage,
      DownPaymentCommission,
      InstallmentCommission,
      OpeningBalance,
      OpeningBalanceDate : new Date(OpeningBalanceDate),
    };

    console.log(data);

    // Now you can use 'data' to create a new AgentTbl record in the database.
    // For example, using Prisma:
    const updatedAgent = await prisma.agentTbl.update({
      where:{
        AgentID : parseInt(AgentID)
      },
      data: data,
    });

    console.log(updatedAgent);
    const serializedupdatedAgent = jsonSerializer.stringify(updatedAgent);

    res.status(200).json(serializedupdatedAgent);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

//delete
router.delete('/delete', protect,isAdmin,async function (req, res, next) {
  try {

    const { AgentID } =  req.body

    const allAgents = await prisma.agentTbl.delete({
      where : {
        AgentID : parseInt(AgentID)
      }
    });
    res.status(200).json({
      success: true,
      message: `Agent with AgentID ${AgentID} has been deleted successfully.`
    });

  } catch (error) {
    console.error(error);
    next(error);
  }
});


module.exports = router;
