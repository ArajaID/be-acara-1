import { Request, Response } from 'express';

import * as Yup from 'yup';

import UserModel, { userUpdatePasswordDTO } from '../models/user.model';
import { encrypt } from '../utils/encryption';
import { generateToken } from '../utils/jwt';
import { IReqUser } from '../utils/interfaces';
import response from '../utils/response';

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
    password: Yup.string().required().min(6, 'Password must be at least 6 characters')
    .test('at-least-one-uppercase-letter', 'Contains at least one uppercase letter', (value) => {
        if(!value) return false;

        const regex = /^(?=.*[A-Z])/;

        return regex.test(value);
    })
    .test('at-least-one-number', 'Contains at least one number', (value) => {
        if(!value) return false;

        const regex = /^(?=.*\d)/;

        return regex.test(value);
    }),
    confirmPassword: Yup.string().required().oneOf([Yup.ref('password'), ""], "Password not matched"),
})

export default {
    async updateProfile(req: IReqUser, res: Response) {
        try {
          const userId = req.user?.id;
          const { fullName, profilePicture } = req.body;
          const result = await UserModel.findByIdAndUpdate(
            userId,
            {
              fullName,
              profilePicture,
            },
            {
              new: true,
            }
          );
    
          if (!result) return response.notFound(res, "user not found");
    
          response.success(res, result, "success to update profile");
        } catch (error) {
          response.error(res, error, "failed to update profile");
        }
    },

    async updatePassword(req: IReqUser, res: Response) {
        try {
          const userId = req.user?.id;
          const { oldPassword, password, confirmPassword } = req.body;
    
          await userUpdatePasswordDTO.validate({
            oldPassword,
            password,
            confirmPassword,
          });
    
          const user = await UserModel.findById(userId);
    
          if (!user || user.password !== encrypt(oldPassword))
            return response.notFound(res, "user not found");
    
          const result = await UserModel.findByIdAndUpdate(
            userId,
            {
              password: encrypt(password),
            },
            {
              new: true,
            }
          );
          response.success(res, result, "success to update password");
        } catch (error) {
          response.error(res, error, "failed to update password");
        }
    },

    async register (req: Request, res: Response) {
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

            return response.success(res, result, "user registered successfully")
        } catch (error) {
            response.error(res, error, "failed registration")
        }
    },

    async login (req: Request, res: Response) {
        const { identifier, password } = req.body as unknown as TLogin;

        try {
            // ambil data user berdasarakan identifier (username atau email)
            const userByIdentifier = await UserModel.findOne({ 
                $or: [
                    { username: identifier },
                    { email: identifier },
                ],
                isActive: true
            })

            if(!userByIdentifier) { 
                return response.unauthorized(res, 'user not found')
            }
            // validasi password
            const validatePassword: boolean = encrypt(password) === userByIdentifier.password;

            if(!validatePassword) {
                return response.unauthorized(res, 'password not matche')
            }

            const token = generateToken({
                id: userByIdentifier._id,
                role: userByIdentifier.role
            })

           response.success(res, token, 'login success')   
        } catch (error) {
           response.error(res, error, 'login failed')
        }
    },

    async me (req: IReqUser, res: Response) {
        try {
            const user = req.user;
            const result = await UserModel.findById(user?.id);

            response.success(res, result, 'success get data profile')
        } catch (error) {
            response.error(res, error, 'failed get data profile')
        }
    },

    async activation (req: Request, res: Response) {
        try {
            const { code } = req.body as { code: string };

            const user = await UserModel.findOneAndUpdate(
                { 
                    activationCode: code 
                },
                {
                    isActive: true,
                },
                {
                    new: true
                }
            );

            response.success(res, user, 'activation success')   
        } catch (error) {
            response.error(res, error, 'activation failed')
        }
    },
}