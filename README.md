# Video Sync
This project synchronizes video playback on youtube videos between multiple clients. It was created in part for my own use with my friends, and also for me to learn Vue and Vite.

---
## Installation
Requirements:
* NodeJS (Tested with 14.17)

Install using:
`$ npm install`
## Usage
### Enviroment variables
Put this in either your host's environment variables when deploying or a .env file within the root folder of the project for development.
```
VITE_HOST = "your host" 
VITE_API_KEY = "your_google_api_key"
```
### Spinning up a development server:
`$ npx vite`
### Building for production:
`$ npx build`:
This creates a bundle in the `dist` folder.

After building for production, run `$ node ./server.js` to spin up the NodeJS server. This server runs the websocket backend and also deploys a HTTP server to serve the bundle in the dist folder. For development, running the NodeJS server is also required to provide a websocket backend.
## Tools used
- Socket.io:
Used for to create websocket connections both client-side and server-side
- Express: HTTP Server
- Vite: Development server and a module bundler. Incredibly fast and supports hot-module reloading.
- Vue: Frontend framework
- Bulma: Frontend styling framework