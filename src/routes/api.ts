import express from 'express';
import authController from '../controllers/auth.controller';
import authMiddleware from '../middlewares/auth.middleware';
import aclMiddleware from '../middlewares/acl.middleware';
import { ROLES } from '../utils/constant';
import mediaMiddleware from '../middlewares/media.middleware';
import mediaController from '../controllers/media.controller';
import categoryController from '../controllers/category.controller';
import regionController from '../controllers/region.controller';
import eventController from '../controllers/event.controller';
import ticketController from '../controllers/ticket.controller';

const router = express.Router();

router.post('/auth/register', authController.register
    /*
        #swagger.tags = ['Auth']
    */
);
router.post('/auth/login', authController.login
    /*
        #swagger.tags = ['Auth']
        #swagger.requestBody = { 
            required: true,
            schema: { $ref: "#/components/schemas/LoginRequest" }
        }
    */
);
router.get('/auth/me', authMiddleware, authController.me
     /*
        #swagger.tags = ['Auth']
        #swagger.security = [{
            "bearerAuth": []
        }]
    */
);
router.post('/auth/activation', authController.activation
    /*
        #swagger.tags = ['Auth']
        #swagger.requestBody = {
            required: true,
            schema: { $ref: "#/components/schemas/ActivationRequest" }
        }
    */
);

router.post('/tickets', [authMiddleware, aclMiddleware([ROLES.ADMIN])], ticketController.create);
router.get('/tickets', ticketController.findAll);
router.get('/tickets/:id', ticketController.findOne);
router.put('/tickets/:id', [authMiddleware, aclMiddleware([ROLES.ADMIN])], ticketController.update);
router.delete('/tickets/:id', [authMiddleware, aclMiddleware([ROLES.ADMIN])], ticketController.remove);
router.get('/tickets/:eventId/events', ticketController.findAllByEvent);

router.post('/category', [authMiddleware, aclMiddleware([ROLES.ADMIN])], categoryController.create
    /*
        #swagger.tags = ['Category']
        #swagger.security = [{
            "bearerAuth": {}
        }]
        #swagger.requestBody = {
            required: true,
            schema: {
                $ref: "#/components/schemas/CreateCategoryRequest"
            }
        }
    */
);
router.get('/category', categoryController.findAll
    /*
        #swagger.tags = ['Category']
    */
);
router.get('/category/:id', categoryController.findOne
     /*
        #swagger.tags = ['Category']
    */
);
router.put('/category/:id', [authMiddleware, aclMiddleware([ROLES.ADMIN])], categoryController.update
    /*
        #swagger.tags = ['Category']
        #swagger.security = [{
            "bearerAuth": {}
        }]
        #swagger.requestBody = {
            required: true,
            schema: {
                $ref: "#/components/schemas/CreateCategoryRequest"
            }
        }
    */
);
router.delete('/category/:id', [authMiddleware, aclMiddleware([ROLES.ADMIN])], categoryController.remove
    /*
        #swagger.tags = ['Category']
        #swagger.security = [{
            "bearerAuth": {}
        }]
    */
);


router.post('/events', [authMiddleware, aclMiddleware([ROLES.ADMIN])], eventController.create
    /*
        #swagger.tags = ['Events']
        #swagger.security = [{
            "bearerAuth": {}
        }]
        #swagger.requestBody = {
            required: true,
            schema: {
                $ref: "#/components/schemas/CreateEventRequest"
            }
        }
    */
);
router.get('/events', eventController.findAll
    /*
        #swagger.tags = ['Events']
    */
);
router.get('/events/:id', eventController.findOne
    /*
        #swagger.tags = ['Events']
    */
);
router.put('/events/:id', [authMiddleware, aclMiddleware([ROLES.ADMIN])], eventController.update
    /*
        #swagger.tags = ['Events']
        #swagger.security = [{
            "bearerAuth": {}
        }]
        #swagger.requestBody = {
            required: true,
            schema: {
                $ref: "#/components/schemas/CreateEventRequest"
            }
        }
    */
);
router.delete('/events/:id', [authMiddleware, aclMiddleware([ROLES.ADMIN])], eventController.remove
    /*
        #swagger.tags = ['Events']
        #swagger.security = [{
            "bearerAuth": {}
        }]
    */
);
router.get('/events/:slug/slug', eventController.findOneBySlug
    /*
        #swagger.tags = ['Events']
    */
);

router.get('/regions', regionController.getAllProvinces
    /*
        #swagger.tags = ['Regions']
    */
);
router.get('/regions/:id/province', regionController.getProvince
    /*
        #swagger.tags = ['Regions']
    */
);
router.get('/regions/:id/regency', regionController.getRegency
    /*
        #swagger.tags = ['Regions']
    */
);
router.get('/regions/:id/district', regionController.getDistrict
    /*
        #swagger.tags = ['Regions']
    */
);
router.get('/regions/:id/village', regionController.getVillage
    /*
        #swagger.tags = ['Regions']
    */
);
router.get('/regions-search', regionController.findByCity
    /*
        #swagger.tags = ['Regions']
    */
);

router.post('/media/upload-single', [
    authMiddleware, 
    aclMiddleware([ROLES.ADMIN, ROLES.MEMBER]), 
    mediaMiddleware.single('file'),
],
    mediaController.single
     /*
        #swagger.tags = ['Media']
        #swagger.security = [{
            "bearerAuth": {}
        }]
        #swagger.requestBody = {
            required: true,
            content: {
                "multipart/form-data": {
                    schema: {
                        type: "object",
                        properties: {
                            file: {
                                type: "string",
                                format: "binary"
                            }
                        }
                    }
                }
            }  
        }
    */
);
router.post('/media/upload-multiple', [
    authMiddleware, 
    aclMiddleware([ROLES.ADMIN, ROLES.MEMBER]), 
    mediaMiddleware.multiple('files'),
], mediaController.multiple
    /*
        #swagger.tags = ['Media']
        #swagger.security = [{
            "bearerAuth": {}
        }]
        #swagger.requestBody = {
            required: true,
            content: {
                "multipart/form-data": {
                    schema: {
                        type: "object",
                        properties: {
                            files: {
                                type: "array",
                                items: {
                                    type: "string",
                                    format: "binary"
                                }
                            }
                        }
                    }
                }
            }  
        }
    */
);
router.delete('/media/remove', [
    authMiddleware, 
    aclMiddleware([ROLES.ADMIN, ROLES.MEMBER]), 
    
], mediaController.remove
 /*
        #swagger.tags = ['Media']
        #swagger.security = [{
            "bearerAuth": {}
        }]
        #swagger.requestBody = {
            required: true,
            schema: {
                $ref: "#/components/schemas/RemoveMediaRequest"
            }
        }
    */
);

export default router;