var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { PrismaClient } = require('@prisma/client');
var cors = require('cors')

const prisma = new PrismaClient();

var plotPriceRouter = require('./routes/PlotPrice')
var allotmentformRouter = require('./routes/allotmentform')
var commissionRouter = require('./routes/commission')
var ledgerRouter = require('./routes/ledger')
var expenditureRouter = require('./routes/expenditure')
var plotRouter = require('./routes/Plots')
var AgentRouter = require('./routes/Agents')
var investorRegistrationRouter = require('./routes/registration')
var AgentVouchersRouter = require('./routes/AgentVouchers')
var AgentPaymentListRouter = require('./routes/AgentPaymentList')
var ApplicationFormRecordRouter = require('./routes/ApplicationFormRecord')
var ReceiptFinderRouter = require('./routes/ReceiptFInder')
var AgentWiseFileRouter = require('./routes/AgentWiseFile')
var AgentCommssionRouter = require('./routes/AgentCommission')
var PlotListDetailsRouter = require('./routes/PlotListDetails')
var MainFormFilterRouter = require('./routes/MainFormWithFilter')
var CAPaymentRouter = require('./routes/CAPayment')
var CashPaymentRouter = require('./routes/CashPayment')
var OnlinePaymentRouter = require('./routes/OnlinePayment')
var AllPaymentRouter = require('./routes/AllPayment')
var PlotCancellationRouter = require('./routes/PlotCancellation')
var PlotAllotmentRouter = require('./routes/PlotAllotment')
var paymentScheduleRouter = require('./routes/PaymentSchedule')
var receiptRouter = require('./routes/receipts')
var monthlyReportRouter = require('./routes/MonthlyReport')
var UserRouter =  require('./routes/Users')
var CustomerRouter = require('./routes/Customer')
var authAgent = require('./routes/AgentAuth')

var app = express();

app.use(cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/allotmentForm',allotmentformRouter)
app.use('/commission' , commissionRouter)
app.use('/LedgerReport' , ledgerRouter)
app.use('/expenditure',expenditureRouter)
app.use('/plotprice',plotPriceRouter)
app.use('/Plots' , plotRouter)
app.use('/Agents' , AgentRouter)
app.use('/RegistrationOfInvestor' , investorRegistrationRouter)
app.use('/AgentVouchers' , AgentVouchersRouter)
app.use('/AgentPaymentList' , AgentPaymentListRouter)
app.use('/ApplicationFormRecord',ApplicationFormRecordRouter)
app.use('/ReceiptofFile' , ReceiptFinderRouter)
app.use('/AgentWiseFile' , AgentWiseFileRouter)
app.use('/agentCommission' , AgentCommssionRouter)
app.use('/PlotListDetails' ,PlotListDetailsRouter)
app.use('/MainFormFilter' , MainFormFilterRouter)
app.use('/CAPayment' ,CAPaymentRouter)
app.use('/CashPayment' ,CashPaymentRouter)
app.use('/OnlinePayment',OnlinePaymentRouter)
app.use('/AllPayment',AllPaymentRouter)
app.use('/PlotCancellationLetters' , PlotCancellationRouter)
app.use('/PlotAllotment' , PlotAllotmentRouter)
app.use('/PaymentSchedule' ,paymentScheduleRouter)
app.use('/receipt',receiptRouter)
app.use('/MonthlyReport' , monthlyReportRouter)
app.use('/User', UserRouter)
app.use('/Customer' , CustomerRouter)
app.use('/AgentRecord',authAgent)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(res.status(404).json({
    message : 'Not Found'
  }));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
