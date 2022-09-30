const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model');
const { getProfile } = require('./middleware/getProfile');

const { 
    ContractsAction,
    JobsAction,
    AdminAction,
    DepositAction
} = require('./actions');
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

app.get('/contracts/:id', getProfile, ContractsAction.getContract);

app.get('/contracts', getProfile, ContractsAction.getContracts);

app.get('/jobs/unpaid',getProfile, JobsAction.getUnpaidJobs);

app.post('/jobs/:job_id/pay',getProfile ,JobsAction.payJob);

app.get('/admin/best-profession',getProfile, AdminAction.getBestProfession);

app.get('/admin/best-clients',getProfile, AdminAction.getBestClients);


app.post('/balances/deposit/:userId', getProfile, DepositAction.postDeposit);

module.exports = app;
