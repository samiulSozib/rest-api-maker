// src/config/swagger.js
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Core System API Docs",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: "https://rest-api-maker.samiulcse.cloud"
      },
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
    scheme:{
      Package: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Basic Plan" },
            price: { type: "number", example: 9.99 },
            duration_days: { type: "integer", example: 30 },
            max_projects: { type: "integer", example: 5 },
            max_tables_per_project: { type: "integer", example: 10 },
            features: {
              type: "object",
              example: {
                support: "email",
                analytics: "basic",
              },
            },
          },
        },
        Purchase: {
          type: "object",
          properties: {
            id: { type: "integer", example: 12 },
            user_id: { type: "integer", example: 5 },
            package_id: { type: "integer", example: 2 },
            start_date: { type: "string", format: "date-time", example: "2025-10-19T00:00:00Z" },
            end_date: { type: "string", format: "date-time", example: "2025-11-19T00:00:00Z" },
            status: { type: "string", example: "active" },
            Package: { $ref: "#/components/schemas/Package" },
          },
        },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js", "./src/models/*.js"], // where Swagger will look for docs
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📘 Swagger docs available at: http://localhost:4000/api-docs");
}

module.exports = setupSwagger;
