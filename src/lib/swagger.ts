import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = () => {
  return createSwaggerSpec({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "PhongTot API",
        version: "1.0.0",
        description: `API documentation`,
      },

      servers: [
        {
          url: "http://localhost:3000",
          description: "Development",
        },
        // {
        //   url: "http://localhost:3000",
        //   description: "Production",
        // },
      ],

      components: {
        // JWT AUTH SCHEME
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },

        // SCHEMAS
        schemas: {
          ApiResponse: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: { type: "object" },
            },
          },

          User: {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: {
                type: "string",
                format: "email",
                example: "test@gmail.com",
              },
              password: {
                type: "string",
                example: "test@123",
              },
            },
          },
        },
      },

      security: [
        {
          bearerAuth: [],
        },
      ],
    },

    apis: ["src/app/api/**/*.ts"],
  });
};