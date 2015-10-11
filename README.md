## Bop Music ##

Directory Structure:

Server:
    All things related to the nodejs server.  Main responsibilities include:
        * Serving index.html for react
        * Acting as a server for api calls from react
        * Auth
        * MongooseDB Saving
Shared:
    Code that may be shared between node server/react client
        * MongoDB Models
app:
    Reactjs Webapp
