# WebSockets demo
This demo has two parts, a node based server and a client able to connect to it.
The server holds the data and transmits it to new clients. Clients transmits changes to
the server in real time, it broadcasts the changes to the other clients and also updates its 
own dataset.

## Prerequisites
The server requires node to run, https://nodejs.org.

## Starting the server
To start the server, navigate to the websockets/server folder and run:

```
npm install
```

When dependencies are installed, start the server by running:

```
npm run start
```

After launching it will display its IP-address and port and start listening for clients.

## Using secure SSL connection

To create self-signed certificate use this OpenSSL command in the `cert` sub-folder in server's root directory. 
```
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 100 -nodes
```

If you already have certificate put these two files to `cert` folder to enable SSL connection on server side/ 
```
server/cert/cert.pem
server/cert/key.pem
```

## Trying the demo
The demo folder should be accessed from a web server, so simply navigate to your localhost/scheduler/examples/websockets/
. When loaded, enter the websocket server IP-address + port (e.g. ws://10.0.1.2:8080 or similar) 
to the Host text field, fill out a username in the Name field then click "Login". 

To use SSL secure connection add `wss://` protocol to the server IP address.

When connected you should see events appearing, manipulate them and your changes will be
mirrored on any other connected clients.

Enjoy :)
