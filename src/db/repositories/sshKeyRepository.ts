import { UnitOfWork } from '../index';
import { SshKey } from '../models/sshKey';

export class SshKeyRepository {
    private uow: UnitOfWork;

    constructor(uow: UnitOfWork) {
        this.uow = uow;
    }

    public async getAllSshKeysByUserId(userId: string) {
        this.uow._logger.info(`Fetching all ssh keys for user: ${userId}`);

        try {
            const q = SshKey.query(this.uow._transaction)
            .where('userId', userId);
        
            const sshKeys = await q;
            return sshKeys;
        } catch(err) {
            this.uow._logger.error(err);
            throw(err);
        }
    }

    public async createSshKey(sshKey: any) {
        this.uow._logger.info(`Creating new ssh key: ${JSON.stringify(sshKey)}`);

        try {
            const sshKeyModel = SshKey.fromJson({
                key: sshKey.key,
                userId: sshKey.userId,
                description: sshKey.description
            });

            const q = SshKey.query(this.uow._transaction)
                .insertAndFetch(sshKeyModel);

            const newSshKey = await q;
            return newSshKey;
        } catch (err) {
            this.uow._logger.error(err);
            throw err;
        }
    }

    async createSshKeys(userId: string, sshKeys: any[]) {
        this.uow._logger.info(`Updating ssh keys for user: ${userId}`);
        const sshKeysModel =
            sshKeys.map(sshKey => {
                const sshKeyModel = SshKey.fromJson({
                    key: sshKey.key,
                    userId: userId,
                    description: sshKey.description
                });

               return sshKeyModel;
            });

        try {
            const q = SshKey.query(this.uow._transaction)
                .where('id', userId)
                .insertGraph(sshKeysModel);

            const updatedSshKeys = await q;
            return updatedSshKeys;
        } catch (err) {
            this.uow._logger.error(err);
            throw err;
        }
    }

    public async deleteSshKeyById(id: string) {
        this.uow._logger.info(`Deleting ssh key: ${id}`);

        try {
            const q = SshKey.query(this.uow._transaction)
                .where('id', id)
                .delete();

            await q;
            return true;
        } catch (err) {
            this.uow._logger.error(err);
            throw err;
        }
    }

    public async deleteSshKeysByUserId(userId: string) {
        this.uow._logger.info(`Deleting ssh keys for user: ${userId}`);

        try {
            const q = SshKey.query(this.uow._transaction)
                .where('userId', userId)
                .delete();

            await q;
            return true;
        } catch (err) {
            this.uow._logger.error(err);
            throw err;
        }
    }
}