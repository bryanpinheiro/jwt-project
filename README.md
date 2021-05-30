# jwt-project
![dependencies](https://img.shields.io/david/bryansouza/jwt-project)
![typescript](https://img.shields.io/github/languages/top/bryansouza/jwt-project)

This project is a simple API in which uses JWT Authentication.

## Usage
### 1. Installing dependencies
```
yarn install
```

### 2. Environment variables
   
First, create a `.env` file in the root of the project.

Then, add these variables: 
`HOSTNAME`
`PORT`
`ACCESS_TOKEN_SECRET`
`REFRESH_TOKEN_SECRET`

:bulb:***TIP**: run the commands below on your terminal to generate random secrets.*
```
node

require("crypto").randomBytes(64).toString("base64")
```
   
### 3. Starting the server
```
yarn run dev
```

### 4. Rest Client *(Optional)*
After installing the `Rest Client` extension on `vscode`, open the `requests.rest` file to send HTTP requests.

## How it works
### 1. JSON Web Tokens (JWT)

JWT is a **method for authentication**, for instance, suppose we want to get just a `token` without the need to verify the **user credentials** again.
And, if this token has an **expiration time**, we could use another token called `refreshToken` to generate another one for a short period.
