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
            cors: true,
            auth: 'jwt',
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required()
               }).unknown()
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const imgApi: Imgapi = await request.app.getNewImgApi();

            try {
                const images = await imgApi.getAllImages();
                return h.response({message: 'success', data: images}).code(200);
            }
            catch(err) {
                return h.response({message: err.message}).code(400);
            }
        }
    }, {
        method: 'GET',
        path: '/triton/images/{uuid}',
        config: {
            description: 'Get an image from imgApi',
            tags: ['api', 'imgApi'],
            notes: ['Fetches and returns an image from Triton'],
            cors: true,
            auth: 'jwt',
            validate: {
                params: {
                    uuid: Joi.string().guid().required()
                },
                headers: Joi.object({
                    'authorization': Joi.string().required()
               }).unknown()
            }
        },
        handler: async(request: Request, h: ReplyWithContinue) => {
            const imgApi: Imgapi = await request.app.getNewImgApi();

            const image_uuid = request.params.uuid;
            try {
                const image = await imgApi.getImageByUuid(image_uuid);
                return h.response({message: 'success', data: image}).code(200);
            }
            catch(err) {
                if (err.message === "The chosen image could not be found.") {
                    return h.response({message: err.message}).code(404);
                }
            }
        }
    }
];

export default routes;