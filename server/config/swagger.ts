import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MiowNation Prompter API",
      version: "1.0.0",
      description: "API documentation for the MiowNation Prompter application",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
      // You can add production URL here later
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./server/routes/**/*.ts", "./server/routes/*.ts"], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
