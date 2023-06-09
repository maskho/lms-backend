This is the _backend code_ for Lerero Practical Test by S.A. Khobar

## Preview

API server can be accessed here: [api_server_dev](http://ec2-108-137-51-188.ap-southeast-3.compute.amazonaws.com:8000/api)

You can access the API documentation in this url: [Documentation](https://documenter.getpostman.com/view/11180673/2s93RXrVQ9)

Or you can download Json file Postman collection here: [Json file](https://file.io/FLjlPlBvbSI1)

## Database dump file
You can download the dump file for mongodb in this url: [Dump file](https://file.io/5qCmcdE5FvyQ)

## Getting Started

First, create .env in the root directory and add following env variables with their values:

```bash
PORT=
DATABASE=
JWT_SECRET=

AWS_ACCESS_KEY=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_API_VERSION=

EMAIL_FROM=
```

Second, install dependencies and run the development server:

```bash
npm install
npm start
```

Open [http://localhost:{PORT}](http://localhost:{PORT}) see the result.

## Tech Stack

This backend was built with the following stack:

- REST API
- ExpressJS
- AWS SDK
- MongoDB
- Mongoose

### Node Version: v18.13.0
### NPM Version: 8.19.3


## Front End

You can access the frontend repository in this url: [https://github.com/maskho/lms-frontend](https://github.com/maskho/lms-frontend)
