**

## eexamcenter

**
Electronic coaching system- nodejs powered exam management system.
Site designed to stimulate real-time exam environment that will help examine.
**prerequisite:**
 nodejs installed
 mongodb installed locally or remotely
 
**How to setup:**  
 1. clone this git 
 2. npm install 
 3. make a .env file put some environmental
    variable (see env variable section) 
 4. npm start --> to start with node
        or npm run dev --> to start with nodemon (app will open on 3000 port or you should declare it in process.env.PORT)
**ENV variables:**
if you install mongodb locally and running without admin authentication and want to run in development mode. you have no need to use this variable.
if you have personal email server then, put the host, port, user and password (contact email service provider).
or using sendgrid like api service, just use the second section.
DOMAIN= your site domain name
SENDER_EMAIL= no-replay@mydomain.com, support@mydomain.com etc.
Mongodb section is self-explanatory.

    #NODE_ENV=production
    #Email Related*
     *#personal Email*server
    #EMAIL_HOST=
    #EMAIL_PORT=
    #true for 465, false for other ports
    #IS_SECURE=
    #EMAIL_USER=
    #EMAIL_PASSWORD=
    *#when using sendgrid api*
    #SENDGRID_KEY=
    *#for both*
    #SENDER_EMAIL=
    #DOMAIN=
    
    *#Mongo data base related*
    #APP_MONGO_USER=
    #APP_MONGO_PASS=
    #MONGO_HOSTNAME=
    #MONGO_PORT=
    #MONGO_DB=

**Coding Language**
A. Backend: NODEJS
B. DATABASE: MONGODB
C. FROENTEND: pug, bootstrap4

**Some talks:**
public and assets/images are publicly accessible folder.
assets/images: store images

**Problems**
This site's index, about-us, and help pages are hard coded. 
certain variables(that will affect SEO, Marking system) are also hard coded. To change, you have to chage manually(sorry for that)

Please visit : [my site](onlinepgdexam.com)
> Written with [StackEdit](https://stackedit.io/).