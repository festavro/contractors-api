const Repository = require('../repositories/repository');

class JobsAction {
    static getUnpaidJobs = async (req, res) => {
        const { profile_id } = req.headers;
        const jobs = await Repository.getClientUnpaidJobs(profile_id);
        if(!jobs) return res.status(404).end();
        res.json(jobs);
    };

    static payJob = async (req, res) => {
        const { job_id } = req.params;
        const { profile_id } = req.headers;
        const job = await Repository.getJob(job_id, profile_id);
        if(!job) return res.status(404).end();
        
        const client = job.Contract.Client;
        const contractor = job.Contract.Contractor;

        const isJobAlreadyPaid = job.paid;
        if(isJobAlreadyPaid){
            return res.status(400).end('Job already paid');
        }
        const isThereEnoughBalance = client.balance >=0 && client.balance > job.price;
        if(!isThereEnoughBalance){
            return res.status(400).end('Client does not have enough balance');
        }
        client.balance -= job.price;
        contractor.balance +=job.price;
        await Repository.payJob(client, contractor, job);
        res.json('Ok');
    };
}

module.exports = JobsAction;