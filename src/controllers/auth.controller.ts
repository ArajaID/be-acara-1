import { Request, Response } from 'express';

import * as Yup from 'yup';

import UserModel from '../models/user.model';
import { encrypt } from '../utils/encryption';
import { generateToken } from '../utils/jwt';
import { IReqUser } from '../middlewares/auth.middleware';

type TRegister = {
    fullName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

type TLogin = {
    identifier: string;
    password: string;
}

const registerValidateSchema = Yup.object({
    fullName: Yup.string().required(),
    username: Yup.string().required(),
    email: Yup.string().email().required(),
    password: Yup.string().required(),
    confirmPassword: Yup.string().required().oneOf([Yup.ref('password'), ""], "Password not matched"),
})

export default {
    async register (req: Request, res: Response) {
        /**
         #swagger.tags = ['Auth']
         */
        const { 
            fullName, 
            username, 
            email, 
            password, 
            confirmPassword 
        } = req.body as unknown as TRegister;
        

        try {
            await registerValidateSchema.validate({ 
                fullName, 
                username, 
                email, 
                password, 
                confirmPassword })

            const result = await UserModel.create({
                fullName,
                username,
                email,
                password
            })

            return res.status(200).json({ 
                message: 'User registered successfully',
                data: result
            })
        } catch (error) {
           const err = error as unknown as Error;
              return res.status(400).json({ 
                message: err.message,
                data: null
              })
        }
    },

    async login (req: Request, res: Response) {
        /**
           #swagger.tags = ['Auth']
            #swagger.requestBody = { 
                required: true,
                schema: { $ref: "#/components/schemas/LoginRequest" }
            }
         */
        const { identifier, password } = req.body as unknown as TLogin;

        try {
            
            // ambil data user berdasarakan identifier (username atau email)
            const userByIdentifier = await UserModel.findOne({ 
                $or: [
                    { username: identifier },
                    { email: identifier }
                ]
            })

            if(!userByIdentifier) { 
                return res.status(403).json({ 
                    message: 'User not found',
                    data: null
                })
            }
            // validasi password
            const validatePassword: boolean = encrypt(password) === userByIdentifier.password;

            if(!validatePassword) {
                return res.status(403).json({ 
                    message: 'Password not matched',
                    data: null
                })
            }

            const token = generateToken({
                id: userByIdentifier._id,
                role: userByIdentifier.role
            })

            res.status(200).json({ 
                message: 'Login Success',
                data: token
            })
            
        } catch (error) {
            const err = error as unknown as Error;
              return res.status(400).json({ 
                message: err.message,
                data: null
              })
        }
    },

    async me (req: IReqUser, res: Response) {
        /**
         #swagger.tags = ['Auth']
            #swagger.security = [{
                "bearerAuth": []
            }]
         */
        try {
            const user = req.user;
            const result = await UserModel.findById(user?.id);

            res.status(200).json({ 
                message: 'Success User Profile',
                data: result
            })

        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ 
              message: err.message,
              data: null
            }) 
        }
    },

}