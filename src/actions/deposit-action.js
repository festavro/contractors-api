const Repository = require('../repositories/repository');

class DepositAction {
    static postDeposit = async (req, res) => {
        const { userId } = req.params;
        const { amount } = req.body;
        const jobs = await Repository.getUnpaidJobs(userId);
        if(!jobs) return res.status(404).end();
        
        const jobsPriceSum = jobs.reduce((sum, job) => {
            return sum + job.price;
        }, 0);

        const maximumDepositValue = 0.25 * jobsPriceSum;
        const isDepositAllowed = amount < maximumDepositValue;
        if(!isDepositAllowed)
            return res.status(404).end('Value of deposit not valid');
        const client = jobs[0].Contract.Client;

        client.balance += amount;
        await Repository.deposit(client);
        res.json();
    };

}

module.exports = DepositAction;