import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        version: "v0.0.1",
        title: "Dokumentasi API Acara",
        description: "Dokumentasi API Acara",
    },
    servers: [
        {
            url: "http://localhost:3002/api",
            description: "Development server",
        },
        {
            url: "https://back-end-acara-rosy.vercel.app/api",
            description: "Production server",
        }
    ], 
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",

            }
        },
        schemas: {
            LoginRequest: { 
                identifier: "admin@gmail.com",
                password: "admin123",
            },
            RegisterRequest: {
                fullName: "member2025",
                username: "member2025",
                email: "member2025@yopmail.com",
                password: "Member2025!",
                confirmPassword: "Member2025!",
            },
            ActivationRequest: { 
                code: "abcdeef",
            },
            UpdateProfileRequest: {
                fullName: "",
                profilePicture: "",
            },
              UpdatePasswordRequest: {
                oldPassword: "",
                password: "",
                confirmPassword: "",
            },
            CreateCategoryRequest: {
                name: "",
                description: "",
                icon: "",
            },
            CreateEventRequest: {
                name: "",
                banner: "",
                category: "",
                description: "",
                startDate: "yyyy-mm-dd hh:mm:ss",
                endDate: "yyyy-mm-dd hh:mm:ss",
                location: {
                    region: "region id",
                    coordinates: [0, 0],
                    address: "",
                },
                isOnline: false,
                isFeatured: false,
                isPublish: false,
            },
            RemoveMediaRequest: {
                fileUrl: "",
            },
            CreateBannerRequest: {
                title: "",
                image: "",
                isShow: true
            },
            CreateTicketRequest: {
                price: 0,
                name: "",
                events: "",
                description: "",
                quantity: 0
            },
            CreateOrderRequest: {
                events: "event object id",
                ticket: "ticket object id",
                quantity: 1,
            },
        }
    },
}

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/api.ts"];

swaggerAutogen({ openapi: "3.0.0"})(outputFile, endpointsFiles, doc);