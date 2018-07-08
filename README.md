[![Coverage Status](https://coveralls.io/repos/github/reperio/triton-portal-api/badge.svg?branch=master)](https://coveralls.io/github/reperio/triton-portal-api?branch=master) [![Build Status](https://travis-ci.org/reperio/triton-portal-api.svg?branch=master)](https://travis-ci.org/reperio/triton-portal-api)
# triton-portal

## Project Setup

### Global NPM Packages
`npm install -g jest knex typescript`

### Database Configuration
Install mysql community server and enter the mysql prompt  
Create the development database with: `CREATE DATABASE reperio_triton_portal_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;`  
Create the development (and test) user with: `GRANT ALL PRIVILEGES ON *.* TO 'reperio'@'localhost' IDENTIFIED BY 'reperio';`

## Testing
Run tests with `npm test` or `jest` (and optionally `--coverage`).

## Database Migrations
Create a database migration with `knex migrate:make migration_name --knexfile path\_to\_knexfile`  
Run migrations with `knex migrate:latest --knexfile path\_to\_knexfile`  
Rollback migrations with `knex migrate:rollback --knexfile path\_to\_knexfile`  

## API Documentation 
View the hapi-swagger plugin page at http://localhost:3000/documentation
