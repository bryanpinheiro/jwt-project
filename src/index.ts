import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";

const app = express();
dotenv.config();
app.use(express.json());

const HOSTNAME = process.env["HOSTNAME"] as string;
const PORT = parseInt(process.env["PORT"] as string);
const REFRESH_TOKEN_SECRET = process.env["REFRESH_TOKEN_SECRET"] as jwt.Secret;
const ACCESS_TOKEN_SECRET = process.env["ACCESS_TOKEN_SECRET"] as jwt.Secret;

var myUser: User;
let refreshTokens: string[] = [];
let users: User[] = [];

interface Post {
    username: string,
    title: string,
    text: string,
}

interface User {
    name: string,
    password: string
}

type Middleware = (req: express.Request, res: express.Response, next: express.NextFunction) => void;

const authenticateToken: Middleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(" ")[1];
    if(!token) return res.sendStatus(401);

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403);
        myUser = user as User;
        next();
    });
}

const generateAccessToken = (user: User): string => {
    return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '30s'});
};

app.get("/posts", authenticateToken, (req, res) => {
    const posts: Post[] = [
        {
            username: "Bryan",
            title: "Weekend",
            text: "Saturday"
        },
        {
            username: "Random",
            title: "Black",
            text: "White"
        }
    ];

    res.json(posts.filter((post) => post.username === myUser.name));
});

app.get("/users", authenticateToken, (req, res) => {
    res.json(users.filter((user) => user.name === myUser.name));
});

app.post("/token", (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken) return res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err: any, user: any) => {
        if(err) return res.sendStatus(403);
        console.log(user);
        const accessToken = generateAccessToken({name: user.name, password: user.password});

        res.json({ accessToken });
    });
});

app.post("/login", async (req, res) => {
    const user = users.find((user) => user.name == req.body.username);
    
    if(!user) {
        return res.sendStatus(400);
    }

    try {
        if(await bcrypt.compare(req.body.password, user.password)) {
            let accessToken = generateAccessToken(user);
            let refreshToken = jwt.sign(user, REFRESH_TOKEN_SECRET);
            refreshTokens.push(refreshToken);
        
            res.json({ accessToken, refreshToken });
        } else {
            res.sendStatus(401);
        }
    } catch {
        res.sendStatus(500);
    }
});

app.post("/register", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const user: User = {
            name: username,
            password: hashedPassword
        };

        users.push(user);

        res.sendStatus(201);
    } catch {
        res.sendStatus(500);
    }
});

app.delete("/logout", (req, res) => {
    refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
    res.sendStatus(204);
});

app.listen(PORT, HOSTNAME, () => {
    console.log(`Server running on http://${HOSTNAME}:${PORT}/`);
});