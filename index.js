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

const bodyParser = require('body-parser');
const mailer = require('nodemailer');
const fetch = require('node-fetch');
const express = require('express');
const cors = require('cors');
const api = express();
require('dotenv').config();

const corsOptions = {
    methods: "POST",
    origin: process.env.ORIGIN,
    optionsSuccessStatus: 200
};

const transporter = mailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: JSON.parse(process.env.MAIL_SECURE),
    auth: {
        user: process.env.MAIL_AUTH_USER, 
        pass: process.env.MAIL_AUTH_PASS
    },
});

api.listen(process.env.PORT);
api.use(cors(corsOptions));
api.use(bodyParser.json());
api.use(express.urlencoded({ extended: false }));

api.post('/', async (request, response) => {
    const remoteAddress = request.connection.remoteAddress;
    const recaptcha = request.body["g-recaptcha-response"] ?? null;
    const comment = request.body["comment"] ?? null;
    const email = request.body["email"] ?? null;
    const name = request.body["name"] ?? null;
    const secret = process.env.RECAPTCHA_KEY;
    const url = process.env.RECAPTCHA_URL;
    
    await fetch(`${url}?secret=${secret}&response=${recaptcha}`)
    .then(response => response.json())
    .then(async (captcha) => {
        if(captcha.success !== undefined && !captcha.success) {
            throw new Error(process.env.TEXT_RESPONSE_FAIL_CAPTCHA);
        }
    })
    .then(async () => {
        await transporter.sendMail({
            from: process.env.MAIL_AUTH_USER,
            to: `${process.env.MAIL_AUTH_USER}, ${email}`,
            subject: process.env.MAIL_MAIL_TILE.replace('{name}', name).replace('{email}', email).replace('{comment}', comment), 
            text: process.env.TEXT_MAIL_BODY.replace('{name}', name).replace('{email}', email).replace('{comment}', comment),
            html: process.env.TEXT_MAIL_HTML.replace('{name}', name).replace('{email}', email).replace('{comment}', comment)
        });
    })
    .then(async () => {
        return response.json({ok: true, message: process.env.TEXT_RESPONSE_OK});
    })
    .catch(error => {
        return response.json({ok: false, message: error.message ?? error});
    });
});