/**
 *   basic api script for sending forms to email, as per recaptcha authentication.
 *   Copyright (C) 2021  Rodrigo Dornelles
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { load } from 'ts-dotenv';
import { config } from 'dotenv';
import fastify from 'fastify';
import cors from 'fastify-cors';
import { createTransport } from 'nodemailer';
import fetch from 'node-fetch';

config();

const api = fastify();
const env = load({
    PORT: Number,
    ORIGIN: String,
    RECAPTCHA_KEY: String,
    RECAPTCHA_URL: String,
    MAIL_HOST: String,
    MAIL_PORT: Number,
    MAIL_SECURE: Boolean,
    MAIL_AUTH_USER: String,
    MAIL_AUTH_PASS: String,
    TEXT_MAIL_TITLE: String,
    TEXT_MAIL_BODY: String,
    TEXT_MAIL_HTML: String,
    TEXT_RESPONSE_OK: String,
    TEXT_RESPONSE_FAIL_CAPTCHA: String
});

interface Body {
    "g-recaptcha-response"?: string,
    "h-captcha-response"?: string,
    "comment": string,
    "email": string,
    "name": string
}

const transporter = createTransport({
    host: env.MAIL_HOST ,
    port: env.MAIL_PORT,
    secure: env.MAIL_SECURE,
    auth: {
        user: env.MAIL_AUTH_USER, 
        pass: env.MAIL_AUTH_PASS
    },
});

api.register(cors, { 
    methods: "POST",
    origin: env.ORIGIN,
    optionsSuccessStatus: 200
});

api.post<{Body: Body}>('/', async (request, response) => {
    const recaptcha : string = request.body["g-recaptcha-response"] ?? request.body["h-captcha-response"] ?? '';
    const comment : string = request.body["comment"];
    const email : string = request.body["email"];
    const name : string = request.body["name"];
    const secret : string = env.RECAPTCHA_KEY;
    const url : string = env.RECAPTCHA_URL;
    
    await fetch(`${url}?secret=${secret}&response=${recaptcha}`)
    .then(response => response.json())
    .then(async (captcha) => {
        if(captcha.success !== undefined && !captcha.success) {
            throw new Error(env.TEXT_RESPONSE_FAIL_CAPTCHA);
        }
    })
    .then(async () => {
        await transporter.sendMail({
            from: env.MAIL_AUTH_USER,
            to: `${env.MAIL_AUTH_USER}, ${email}`,
            subject: env.TEXT_MAIL_TITLE
                .replace(/\{name\}/g, name)
                .replace(/\{email\}/g, email)
                .replace(/\{comment\}/g, comment), 
            text: env.TEXT_MAIL_BODY
                .replace(/\{name\}/g, name)
                .replace(/\{email\}/g, email)
                .replace(/\{comment\}/g, comment),
            html: env.TEXT_MAIL_HTML.replace('{name}', name)
                .replace(/\{name\}/g, name)
                .replace(/\{email\}/g, email)
                .replace(/\{comment\}/g, comment)
        });
    })
    .then(async () => {
        return response.send({ok: true, message: env.TEXT_RESPONSE_OK});
    })
    .catch(error => {
        return response.send({ok: false, message: error.message ?? error});
    });
});

api.listen(env.PORT, '0.0.0.0');
