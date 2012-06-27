Wally
=====

Turntable Bot

Running
=======
Requires [node.js](http://nodejs.org/) and Node Package Manager (npm).

Requires the following node modules:
```bash
npm install ttapi
npm install node-uuid
npm install winston
npm install underscore
npm install mongoose
npm install wordpos
npm install node-uuid
npm install handlebars
npm install async
npm install natural
```

Also requires that you create a `conf.json` file in the root of the directory where you define:
```json
{
    "AUTH" : "auth+live+xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "USER_ID" : "xxxxxxxxxxxxxxxxxxxxxxxx",
    "ECHONEST_API_KEY" : "xxxxxxxxxxxxxxxxx",
    "ROOM_ID" : "xxxxxxxxxxxxxxxxxxxxxxxx",
    "ADMIN_USER_NAME" : "xxxxx",
    "ADMIN_USER_ID" : "xxxxxxxxxxxxxxxxxxxxxxxx",
    "BOT_SHORT_NAME" : "xxxxx",
    "BOT_USERNAME" : "xxxxxxxxx"
}
```
`AUTH`, `USER_ID` and `ROOM_ID` are values obtained using [this bookmarklet](http://alaingilbert.github.com/Turntable-API/bookmarklet.html).

`ECHONEST_API_KEY` is a valid [Echonest API](http://the.echonest.com/) developer key.

`ADMIN_USER_NAME` and `ADMIN_USER_ID` are the user name and id of a user you want to be an admin user, respectively.

`BOT_SHORT_NAME` and `BOT_USER_NAME` are the command name and full user name of the bot, respectively.

Run the bot with:
```bash
node bot.js
```