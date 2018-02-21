import {Model} from 'objection';

export class BaseModel extends Model {
    private createdAt: Date;
    private updatedAt: Date;

    $beforeInsert(context: any) {
        const parent = super.$beforeInsert(context);

        return Promise.resolve(parent)
            .then(() => {
                this.createdAt = new Date();
                this.updatedAt = new Date();
            });
    }

    $beforeUpdate(opt: any, context: any) {
        const parent = super.$beforeUpdate(opt, context);

        return Promise.resolve(parent)
            .then(() => {
                this.updatedAt = new Date();
            });
    }
}