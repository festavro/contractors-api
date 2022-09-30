const { sequelize } = require('../model');
const { Op } = require('sequelize');
const {
    Contract,
    Job,
    Profile
} = require('../model');
const jobStatus = require('../enums/job-status');

class Repository {

    /**
     * 
     * @param {string} start 
     * @param {string} end 
     * @returns {Profile []}
     */
    static async getContractorsJobs (start, end) {
        const contractors = await Profile.findAll(
            {
                include: [
                    {
                        model: Contract,
                        as: 'Contractor',
                        include: [
                            {
                                model: Job,
                                where:{
                                    paid: true,
                                    paymentDate: {
                                        [Op.between]: [start, end]
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        );
        return contractors;
    }

    /**
     * 
     * @param {string} start 
     * @param {string} end 
     * @param {Number} limit 
     * @returns {Profile []}
     */
    static async getBestClients (start, end, limit = 2) {
        // const contractors = await Profile.findAll(
        //     {
        //         attributes: [
        //             'id',
        //             //[fn('concat', col('fisrtName'),' ', col('lastName')), 'fullName']
        //             [fn('SUM', col('jobs.price')), 'teste'],
        //         ],
        //         include: [
        //             {
        //                 model: Contract,
        //                 as: 'Client',
        //                 required: true,
        //                 include: [
        //                     {
        //                         model: Job,
        //                         required: true,
        //                         where:{
        //                             paid: true,
        //                             paymentDate: {
        //                                 [Op.between]: [start, end]
        //                             }
        //                         },
        //                         attributes: []
        //                     }
        //                 ],
        //                 attributes: []
        //             }
        //         ],
        //         group: ['id'],
        //         limit
        //     }
        // );
        //CONCAT(CLIENT.FirstName, CLIENT.LastName) as fullName 
        const contractors = await sequelize.query(`
            SELECT CLIENT.id, CLIENT.FirstName || ' ' || CLIENT.LastName as fullName, SUM(JOB.price) as paid  FROM Profiles CLIENT
            INNER JOIN Contracts CONTRACT on CLIENT.id = CONTRACT.ClientId
            INNER JOIN Jobs JOB on JOB.ContractId = CONTRACT.ID
            WHERE JOB.PAID=1
            AND JOB.paymentDate BETWEEN '${start}' AND '${end}'
            GROUP BY CLIENT.id
            ORDER BY SUM(JOB.price) desc
            LIMIT ${limit}
        `);
        return contractors;
    }

    /**
     * 
     * @param {Number} id 
     * @param {Number} clientId
     * @returns {Contract}
     */
    static async getContract (id, clientId) {
        const contract = await Contract.findOne({where: {id, clientId }});
        return contract;
    }

    /**
     * 
     * @param {Number} clientId
     * @returns {Contract []}
     */
    static async getNotTerminatedContracts (clientId) {
        const contracts = await Contract.findAll(
            {
                where: {
                    clientId: clientId,
                    status: {
                        [Op.not]: jobStatus.TERMINATED
                    }
                }
            }
        );
        return contracts;
    }

    /**
     * 
     * @param {Number} clientId
     * @returns {Job []}
     */
    static async getClientUnpaidJobs (clientId) {
        const jobs = await Job.findAll(
            {
                where: {
                    paid: false,
                },
                include: [
                    {
                        model: Contract,
                        as: 'Contract',
                        where: {
                            clientId: clientId,
                            status: jobStatus.IN_PROGRESS
                        },
                        attributes: []
                    }
                ]
            }
        );
        return jobs;
    }

    /**
     * 
     * @param {Number} id
     * @param {Number} clientId
     * @returns {Job}
     */
    static async getJob (id, clientId) {
        const job = await Job.findOne(
            {
                where: {
                    id: id
                },
                include: [
                    {
                        model: Contract,
                        as: 'Contract',
                        where: {
                            clientId: clientId,
                        },
                        include:[
                            {
                                model: Profile,
                                as: 'Client'
                            },
                            {
                                model: Profile,
                                as: 'Contractor'
                            }
                        ]
                    }
                ]
            }
        );
        return job;
    }

    /**
     * 
     * @param {Number} clientId
     * @returns {Job}
     */
    static async getUnpaidJobs (clientId) {
        const jobs = await Job.findAll(
            {
                where:{
                    paid: false
                },
                include: [
                    {
                        model: Contract,
                        as: 'Contract',
                        where: {
                            clientId: clientId,
                        },
                        include:[
                            {
                                model: Profile,
                                as: 'Client'
                            }
                        ]
                    }
                ]
            }
        );
        return jobs;
    }

    /**
     * 
     * @param {Profile} client
     * @param {Profile} contractor
     * @param {job} job
     * @returns 
     */
    static async payJob (client, contractor, job) {
        const transaction = await sequelize.transaction();
        try{
            Profile.update(
                { balance: client.balance },
                { where: { id: client.id } },
                { transaction }
            );
            Profile.update(
                { balance: contractor.balance },
                { where: { id: contractor.id } },
                { transaction }
            );
            Job.update(
                { paid: true },
                { where: { id: job.id} },
                { transaction }
            );
            await transaction.commit();
        }
        catch(error){
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * 
     * @param {Profile} client
     * @returns 
     */
    static async deposit (client) {
        const transaction = await sequelize.transaction();
        try{
            Profile.update(
                { balance: client.balance },
                { where: { id: client.id } },
                { transaction }
            );
            await transaction.commit();
        }
        catch(error){
            await transaction.rollback();
            throw error;
        }
    }

}

module.exports = Repository;