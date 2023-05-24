const db = require("../model.ts");
import express, {
    Request,
    Response,
    NextFunction,
    RequestHandler,
} from "express";
import cookieParser from "cookie-parser";
import bcrypt from 'bcryptjs';

const baseError = {
    status: 400,
    log: "hit base error",
    message: { err: "An error occurred in the solutionsController" },
};

export const signInController = {
    verifyUser: async (req: Request, res: Response, next: NextFunction) => {
        // find user in database
        // get username/pw from req.body
        const { username, password } = req.body;
        const values = [username]
        const userQuery =
            `SELECT *
            FROM users
            WHERE username=$1`
        try {
            const dataResult = await db.query(userQuery, values);

            // if there is a result, return that the user is verified
            if (dataResult.rows.length === 1){
                // compare password with bcrypt password
                const databasePassword = dataResult.rows[0].password;
                bcrypt.compare(password, databasePassword, function (err, result){
                    // if password matches, set verified to true
                    if (result === true){
                        res.locals.verified = "true";
                        res.cookie('user_id', dataResult.rows[0].user_id);
                        res.cookie('username', username);
                        return next();
                    } else {
                        res.locals.verified = "false";
                        return next();
                    }
                })
            // if user is not in database, verified is false
            } else {
                res.locals.verified = "false";
                console.log(res.locals.verified)
                return next();
            }
        } catch (err) {
            baseError.log = `Error caught in signInController: ${err}`;
            baseError.message.err = `Could not sign in user`;
            return next(baseError);
        }
    },
    signUpUser: async (req: Request, res: Response, next: NextFunction) => {
        // get username and password from request body
        let {username, password} = req.body;
        // need to make sure user with same username does not exist (?)

        // encrypt password here
        const SALT_WORK_FACTOR = 10;
        bcrypt.hash(password, SALT_WORK_FACTOR, async (err: Error, hashedPassword: string) => {
            if (err) {
                baseError.log = `Error caught in signInController: ${err}`;
                baseError.message.err = `Could not encrypt password`;
                return next(baseError);
            }
            password = hashedPassword;
            const values = [username, password]
            const userInsert = `INSERT INTO users (username, password)
            VALUES ($1, $2)`
            const userQuery = 
                `SELECT *
                FROM users
                WHERE username=$1 AND password=$2`
            try {
                const result = await db.query(userInsert, values);
                // set cookies with user_id and username here
                // find user
                const user = await db.query(userQuery, values);
                const user_id = user.rows[0].user_id;
                res.cookie('user_id', user_id);
                res.cookie('username', username);
                res.locals.verified = "true"
                return next();
            } catch (err){
                baseError.log = `Error caught in signInController: ${err}`;
                baseError.message.err = `Could not sign up user`;
                return next(baseError);
            }
        })
    }
}



