import * as _ from 'lodash';
import * as Joi from 'joi';
import {Request, ReplyWithContinue, RouteConfiguration} from 'hapi';
import { UnitOfWork } from '../db';
import { Imgapi } from '../triton/imgapi';

const routes: RouteConfiguration[] =  [
    {
        method: 'GET',
        path: '/triton/images',
        config: {
            description: 'Get all images imgApi',
            tags: ['api', 'imgApi'],
            notes: ['Fetches and returns all images Triton'],
            cors: true
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const imgApi: Imgapi = await request.app.getNewImgApi();

            const images = await imgApi.getAllImages();
            return {status: 0, message: 'success', data: images};
        }
    }, {
        method: 'GET',
        path: '/triton/images/{uuid}',
        config: {
            description: 'Get an image from imgApi',
            tags: ['api', 'imgApi'],
            notes: ['Fetches and returns an image from Triton'],
            cors: true,
            validate: {
                params: {
                    uuid: Joi.string().guid().required()
                }
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const imgApi: Imgapi = await request.app.getNewImgApi();

            const image_uuid = request.params.uuid;
            const image = await imgApi.getImageByUuid(image_uuid);
            return {status: 0, message: 'success', data: image};
        }
    }
];

export default routes;