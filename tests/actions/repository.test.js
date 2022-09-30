const { 
    Profile,
    Contract
} = require("../../src/model");
const Repository = require("../../src/repositories/repository");
const expect = require('chai').expect;

describe('Repository tests', async () => {
    it('Should return only contracts of a client', async () => {
        const client = await Profile.create({
            id: 1234,
            firstName: 'Harry',
            lastName: 'Potter',
            profession: 'Wizard',
            balance: 1150,
            type:'client'
        });
        const client2 = await Profile.create({
            id: 1244,
            firstName: 'Harry',
            lastName: 'Potter',
            profession: 'Wizard',
            balance: 1150,
            type:'client'
        });
        const contractor = await Profile.create({
            id: 12345,
            firstName: 'Harry',
            lastName: 'Potter',
            profession: 'Wizard',
            balance: 1150,
            type:'client'
        });
        const firstContract = await Contract.create({
            id:8999,
            terms: 'bla bla bla',
            status: 'terminated',
            ClientId: client.id,
            ContractorId:contractor.id
        });
        const secondContract = await Contract.create({
            id:2,
            terms: 'bla bla bla',
            status: 'in_progress',
            ClientId: client2.id,
            ContractorId: contractor.id
        });

        const contract1 = await Repository.getContract(firstContract.id, client.id);
        const contract2 = await Repository.getContract(secondContract.id, client.id);
        expect(contract1).to.be.instanceOf(Profile);
        expect(contract2).not.to.be.ok;
        await Contract.destroy({
            where: { id: firstContract.id }
        });
        await Contract.destroy({
            where: { id: secondContract.id }
        });
        await Profile.destroy({
            where: { id: client.id }
        });
        await Profile.destroy({
            where: { id: contractor.id }
        });
    });
});