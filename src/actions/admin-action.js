
const Repository = require('../repositories/repository');

class AdminAction {
    static getBestProfession = async (req, res) => {
        const { start, end } = req.query;
        const contractors = await Repository.getContractorsJobs(start, end);
        if(!contractors) return res.status(404).end();
        let maxValue=0;
        let mostValuableContractor;
        contractors.forEach( (contractor) => {
            contractor.Contractor.forEach( (contract,) => {
                const jobsPriceSum = contract.Jobs.reduce((sum, job) => {
                    return sum +job.price;
                }, 0);
                if(jobsPriceSum > maxValue){
                    maxValue = jobsPriceSum;
                    mostValuableContractor = contractor;
                }
            });
        });
        res.json(mostValuableContractor);
    };

    static getBestClients = async (req, res) => {
        const { start, end, limit } = req.query;

        const contractors = await Repository.getBestClients(start, end, limit);
        if(!contractors) return res.status(404).end();
        
        res.json(contractors[0]);
    };
}

module.exports = AdminAction;