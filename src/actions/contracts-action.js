const Repository = require('../repositories/repository');

class ContractsAction {
    static getContract = async (req, res) => {
        const { id } = req.params;
        const { profile_id } = req.headers;
        const contract = await Repository.getContract(id, profile_id);
        if(!contract) return res.status(404).end();
        res.json(contract);
    };

    static getContracts = async (req, res) => {
        const { profile_id } = req.headers;
        const contracts = await Repository.getNotTerminatedContracts(profile_id);
        if(!contracts) return res.status(404).end();
        res.json(contracts);
    };
}

module.exports = ContractsAction;