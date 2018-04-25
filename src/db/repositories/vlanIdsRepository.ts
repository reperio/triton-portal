import { UnitOfWork } from '../index';
import { VlanId } from '../models/vlanId';

export class VlanIdsRepository {
    private uow: UnitOfWork;

    constructor(uow: UnitOfWork) {
        this.uow = uow;
    }

    public async getAllByOwnerUuid(ownerUuid: string) {
        this.uow._logger.info(`Fetching all vlan id's for owner: ${ownerUuid}`);

        const q = VlanId.query(this.uow._transaction)
            .where('ownerUuid', ownerUuid);
        
        const vlanIds = await q;
        return vlanIds;
    }

    public async createVlanId(ownerUuid: string, vlanId: number) {
        this.uow._logger.info(`Creating new vlan id: ${JSON.stringify({ownerUuid, vlanId})}`);

        try {
            const vlanIdModel = VlanId.fromJson({
                ownerUuid,
                vlanId
            });

            const q = VlanId.query(this.uow._transaction)
                .insertAndFetch(vlanIdModel);

            const newVlanId = await q;
            return newVlanId;
        } catch (err) {
            this.uow._logger.error(err);
            throw err;
        }
    }

    public async deleteVlanId(ownerUuid: string, vlanId: number) {
        this.uow._logger.info(`Deleting vlan id: ${JSON.stringify({ownerUuid, vlanId})}`);

        try {
            const q = VlanId.query(this.uow._transaction)
                .where({'ownerUuid': ownerUuid, 'vlanId': vlanId})
                .delete();

            const result = await q;
            return result;
        } catch (err) {
            this.uow._logger.error(err);
            throw err;
        }
    }
}