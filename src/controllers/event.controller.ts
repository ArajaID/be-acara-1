import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import EventModel, { eventDAO, TEvent } from "../models/event.model";
import response from "../utils/response";
import { FilterQuery, isValidObjectId } from "mongoose";

export default {
    async create(req: IReqUser, res: Response) {
        try {
            const payload = {...req.body, createdBy: req.user?.id} as TEvent;
            await eventDAO.validate(payload);
            const result = await EventModel.create(payload)

            response.success(res, result, 'success create a event')
        } catch (error) {
            response.error(res, error, 'failed create event')
        }
    },
    async findAll(req: IReqUser, res: Response) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                search 
            } = req.query as unknown as IPaginationQuery;
           
            const query: FilterQuery<TEvent> = {};

            if(search) {
                Object.assign(query, {
                    ...query,
                    $text: {
                        $search: search,
                    },
                });
            }

            const result = await EventModel.find(query)
                .limit(limit)
                .skip((page - 1) * limit)
                .sort({createdAt: -1})
                .exec();

            const count = await EventModel.countDocuments(query);

            response.pagination(res, result, {
                total: count,
                totalPages: Math.ceil(count / limit),
                current: page
            }, 'success find all event')
        } catch (error) {
            response.error(res, error, 'failed find all event')
        }
    },
    async findOne(req: IReqUser, res: Response) {
        try {
            const { id } = req.params;

            if(!isValidObjectId(id)) {
                return response.notFound(res, 'failed find one a event');
            }

            const result = await EventModel.findById(id);

            if(!result) {
                return response.notFound(res, 'failed find one a event');
            }

            response.success(res, result, 'success find one event')
        } catch (error) {
            response.error(res, error, 'failed find one event')
        }
    },
    async update(req: IReqUser, res: Response) {
        try {
            const { id } = req.params;

            if(!isValidObjectId(id)) {
                return response.notFound(res, 'failed update a event');
            }

            const result = await EventModel.findByIdAndUpdate(id, req.body, {
                new: true
            });

            response.success(res, result, 'success update event')
        } catch (error) {
            response.error(res, error, 'failed update event')
        }
    },
    async remove(req: IReqUser, res: Response) {
        try {
            const { id } = req.params;

            if(!isValidObjectId(id)) {
                return response.notFound(res, 'failed remove a event');
            }

            const result = await EventModel.findByIdAndDelete(id, {
                new: true
            });

            response.success(res, result, 'success remove event')
        } catch (error) {
            response.error(res, error, 'failed remove event')
        }
    },
    async findOneBySlug(req: IReqUser, res: Response) {
        try {
            const { slug } = req.params;

            const result = await EventModel.findOne({ slug });

            response.success(res, result, 'success find one by slug event')
        } catch (error) {
            response.error(res, error, 'failed find one by slug event')
        }
    },
};