# A Canine (Dog) Discord Bot 🐶
The bot - for all of your dog-lovin' needs - for your Discord channel. Easy to set up (guide below)

Not only can you get a nice dog picture, but you can also play, feed, walk and pet the dog. The dog can get hungry, lonely, and/or bored - these stats do decrease over time, so, the more you interact with the dog bot, the more these stats will increase, so it will love you more, have more fun with you, and become less hungry. Dog stats are subject to each individual user which are auto-saved after each interaction to a MongoDB database.

## 🐕 Commands
The dog bot responds to a set of commands usually indicated by a wake symbol. This symbol is the `£` - get it? A ***pound***.

### Currently Available Commands
* `£bark` - *"You must be barkin' mad!"* - posts a random grrrr-eat picture of canine friends.
* `£bork` - *"Borkin' up the wrong tree!"* - posts a random grrrr-eat picture of canine friends.
* `£feed` - *"Get in my belly!"* - feed the dog with a juicy bone.
* `£git` - *"Mr. Doggo's Git repository information"* - provides the link to the git repository.
* `£growl` - *"Grrrrrrrrrrr!!"* - posts a random grrrr-eat picture of canine friends.
* `£help` - *"Lists out everything relating to the Mr. Doggo"* - lists the available dog commands.
* `£info` - *"See what I know about you!"* - sends a DM containing your information (minus the dog status) saved in the database.
* `£pet` - *"Pet me... if you dare"* - shows your dog that you love them.
* `£pints` - *"I do have 45 pints in about two hours. I'd have a packet of crisps then, and a maybe an old packet of peanuts"* - gets a random image of a dog(s) with pints of Guinness.
* `£play` - *"It's playtime"* - show your dog you are not a bore.
* `£status` - *"See how I feel about you!"* - shows the status and version of your dog bot, your level and XP.
  > **Luvs** - ❤️/🖤<br> **Fun** - 🥎/⚫<br> **Hunger** - 🦴/🍖<br> **XP** - ✅/☑️
* `£walk` - *"Walk... WALK?! WWAALLKK?!?!"* - show your dog you are not lazy.
* `£woof` - *"Say 'Woof' again, I dare you, I double-dare you buttsniffer, say 'Woof' one more dogdamn time!"* - posts a random grrrr-eat picture of canine friends.

## 🐺 Policy
Feel free to play with code; use for your Discord server, share it with friends, *plz credit me* 😝 - basically have fun. You may share this repo URL on other websites.
But <u>**DO NOT**</u> put out a bot running this code or altered version of this code to https://discordbots.org/ or any websites that list discord bots without giving this repo and me credit.
*Thank you!* ❤️

## 🐕‍🦺 Setup Guide
### Requirements
* 2 API Keys/Tokens:
  * [Discord Bot Token](https://discord.com/developers/)
  * [The Dog API](https://www.thedogapi.com/)
* [Node.js](https://node.js.org/) - *the bot can be deployed and executed locally, but I personally recommend hosting it on [Heroku](https://www.heroku.com/home) - it is free and offers plenty for your application*
* [MongoDB](https://www.mongodb.com/try/download/community) - *using MongoDBCompass, it allows both a localhost and cloud storage system, and it interacts very well with Node.js applications*

### Steps
1. Sign-up with [The Dog API](https://www.thedogapi.com/) and receive the Dog API key in your email.
2. Follow [this guide](https://www.devdungeon.com/content/javascript-discord-bot-tutorial) to configure your [Discord Developer](https://discord.com/developers/) account. You will run through the bot creation process and how to retrieve your Discord API key. You will also be able to invite your bot into your Discord server from the Configuration Panel.
3. Follow the [MongoDB documentation](https://docs.mongodb.com/) to configure your own local/cloud storage. 
4. Click on the [discord-dog-bot releases](https://github.com/deanbyrne95/discord-dog-bot/releases), select a release (preferably [the latest](https://github.com/deanbyrne95/discord-dog-bot/releases/latest)), and download the `Source Code (zip)` from Assets. This can also be done through the `git clone` command.
5. Edit the `config.json` file and insert your API keys to the following:
    ```json
   {
       "dog_bot_token": "Dog Bot Token",
       "dog_api_token": "Dog API Token",
       "mongo_uri": "MongoDB URI",
       "wake_symbol": "£"
   }
    ```
   > **Note**: <u style="color:red;">DO NOT COMMIT</u> API Key(s)/Token(s) to GitHub. Keep these stored locally and/or as 'Config Vars' (secrets) on Heroku
6. **Deployment**
   
    Node.js will be required whether you are deploying locally and/or on a server. 
   1. *Local*

        To deploy locally, you will need to open a command line in your projects' folder, where the `package.json` file is located. You will need to execute the following command to begin:
        ```
        npm install
        ```
        This will make Node.js download all required packages into the project (into the `node_modules` directory). Wait until it finishes before progressing.
   
        1. Using `nodemon`
      
            Personally, I use `nodemon` for starting my Node.js applications as it detects any changes made and instantly re-deploys the application. You can read more about it [here](https://github.com/remy/nodemon) 
            
            To install it, do so on a global level. This will make it easier to use on other projects in the future. To install it, run the following command: 
            ```
           npm install -g nodemon
            ```
           
            Once installed, you can use it to start your main file; I will use `index.js` in this example:
            ```
           nodemon index.js
            ``` 
            
           This project has the `nodemon` script entered within the `package.json` so it can be called by using the following `npm` command
            ```
           npm run nm
            ```
      
        2. Using `npm start`

            Using this method is, quite simply, the easiest to run. In your command line, run the following:

            ```
           npm start
            ```

      Once the script has run, either `nodemon` or `npm start`, your bot should start and a message should appear in the command line with the following:
      ```
      Mongoose connected to *MONGO_URI*
      ...
      Connected as *bot_name*
      ...
      ```
      Check your Discord server, if the bot has already been invited, to see it appear online.

   2. *Heroku*

        To deploy with Heroku, you will first need to create an app with Heroku. This will automatically create a Heroku git repository, which can be ignored.

        You can link your GitHub repository inside the '**Deploy**' tab. This will allow you to either: (1) enable automatic deployments with a specified branch or (2) allow you to manually deploy whichever branch you specify.
   
        Within your project is a `Procfile`. This file specifies to Heroku what dyno (container) type it is, i.e. web app, worker app, etc., using the following layout:
    
        ```
        worker: node index.js
        ```
      
        In this file, it is specifying that it is a worker dyno and that the run command is `node index.js`.
   
        **Note**: Be sure that your 'Config Vars' are entered correctly within Heroku. This should include:
        * dog_api_token
        * dog_bot_token
        * mongo_uri

And that is it! Enjoy and happy developing! 🐶