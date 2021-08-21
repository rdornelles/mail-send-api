# mail-send-api

## Project setup

 1. download the project
 
```SHELL
$ git clone https://github.com/rdornelles/mail-send-api
```

 2. Install dependencies

```SHELL
$ npm install
```

 3. create `.env` in the root patch project

```ENV
PORT = <80>
ORIGIN = <https://example.com>
RECAPTCHA_KEY = <secret key api recaptcha>
RECAPTCHA_URL = <https://www.google.com/recaptcha/api/siteverify>
MAIL_HOST = <mail.example.com>
MAIL_PORT = <586>
MAIL_SECURE = <false>
MAIL_AUTH_USER = <staff@example.com>
MAIL_AUTH_PASS = <12435678>
TEXT_MAIL_TITLE = <Contact form>
TEXT_MAIL_BODY = <contact from {name}, using mail: {email}, about: {comment}>
TEXT_MAIL_HTML = <contact from {name}, using mail: {email}, about: {comment}>
TEXT_RESPONSE_OK = <successful!>
TEXT_RESPONSE_FAIL_CAPTCHA = <Captcha failed. Try again!>
```

 4. run project

```
npm run start
```
