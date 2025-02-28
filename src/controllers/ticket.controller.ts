import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import TicketModel, { ticketDAO, TypeTicket } from "../models/ticket.model";
import response from "../utils/response";
import { FilterQuery, isValidObjectId } from "mongoose";


export default {
    async create(req: IReqUser, res: Response) {
        try {
            await ticketDAO.validate(req.body);

            const result = await TicketModel.create(req.body)

            response.success(res, result, 'success create a ticket')
        } catch (error) {
            response.error(res, error, 'failed create ticket')
        }
    },
    async findAll(req: IReqUser, res: Response) { 
        try {
         const { 
            page = 1, 
            limit = 10, 
            search 
         } = req.query as unknown as IPaginationQuery;
           
         const query: FilterQuery<TypeTicket> = {};

         if(search) {
            Object.assign(query, {
               ...query,
               $text: {
                    $search: search
               }
            })
         }

        const result = await TicketModel.find(query)
            .populate("events")
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({createdAt: -1})
            .exec();

        const count = await TicketModel.countDocuments(query);

        response.pagination(res, result, {
            total: count,
            totalPages: Math.ceil(count / limit),
            current: page
        }, 'success find all ticket')
        } catch (error) {
            response.error(res, error, 'failed find all ticket')
        }
    },
    async findOne(req: IReqUser, res: Response) {
        try {
            const { id } = req.params;

            if(!isValidObjectId(id)) {
                return response.notFound(res, 'failed find one a ticket');
            }

            const result = await TicketModel.findById(id);

             if(!result) {
                return response.notFound(res, 'failed find one a ticket');
            }

            response.success(res, result, 'success find one ticket')
        } catch (error) {
            response.error(res, error, 'failed find one ticket')
        }
    },
    async update(req: IReqUser, res: Response) {
        try {
            const { id } = req.params;

            if(!isValidObjectId(id)) {
                return response.notFound(res, 'failed update a ticket');
            }

            const result = await TicketModel.findByIdAndUpdate(id, req.body, {
                new: true
            });

            response.success(res, result, 'success update ticket')
        } catch (error) {
            response.error(res, error, 'failed update ticket')
        }
    },
    async remove(req: IReqUser, res: Response) {
        try {
            const { id } = req.params;

            if(!isValidObjectId(id)) {
                return response.notFound(res, 'failed remove a ticket');
            }

            const result = await TicketModel.findByIdAndDelete(id, {
                new: true
            });

            response.success(res, result, 'success remove a ticket')
        } catch (error) {
            response.error(res, error, 'failed remove a ticket')
        }
    },
    async findAllByEvent(req: IReqUser, res: Response) {
        try {
            const { eventId } = req.params;

            if(!isValidObjectId(eventId)) { 
                return response.error(res, null, 'ticket not found')
            }
            
            const result = await TicketModel.find({events: eventId}).exec();
            
            response.success(res, result, 'success find all by event')
        } catch (error) {
            response.error(res, error, 'failed find all by event')
        }
    },
};