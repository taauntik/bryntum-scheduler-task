# Export demo

This demo shows how to use export to PDF/PNG feature with Scheduler.
It includes server which gets HTML from browser and makes PDF/PNG.

## Setup

1. Setup the server

    Server is located in `examples/_shared/server`

    Navigate to `examples/_shared/server/README.md` for instructions.
    Usually it should be enough to run:
    
    ```
    cd examples/_shared/server/ && npm i && node ./src/server.js -h 8080 -r /path/to/resources
    ```
   
    where `/path/to/resources` is the physical path to the root folder which contains styles.
    The path can be either absolute (`/path/to/resources`) or relative (`path/to/resources`),
    for example when you start the export server with the export demo locally.
    It is required to correctly load FontAwesome which is used to show icons.
   
    For example
    
    ```javascript
    const scheduler = new Scheduler({
        features : {
            pdfExport : {
                exportServer : 'http://export-host:8080',
                translateURLsToAbsolute : 'http://export-host:8080/resources'
            }
        }
    })
    ```
   
    where `/resources` is a virtual path hardcoded in `server/WebServer.js` implementation.
    Running the server with `-r` maps the virtual path to the real style's location.
    Just need to copy all the styles and fonts from the `http://application-host/` keeping the folder hierarchy.

    ```bash
    # url              : http://application-host/scheduler-x.y.z-trial/examples/export
    # path             : /home/www/styles/scheduler-x.y.z-trial/examples/export
    # resource path    : /home/www/styles/
    
    # Maps 'http://export-host:8080/resources' to /home/www/styles
    node ./src/server.js -h 8080 -r /home/www/styles
    ```
   
2. Configure example to use your server

    By default, the example is configured to use `localhost:8080` as export host.
    
3. Open this example in the browser, press `Export` and check various export options

## Alternate setup (Docker)

You can use our Docker image to run the export server. To start the container run:

    examples/_shared/server$ docker-compose up -d --build

Feature config should be changed too:

```javascript
new Scheduler({
    features : {
        pdfExport : {
            // Assuming Docker is running locally
            exportServer            : 'http://localhost:8080/',
            // Docker runs in own subnet, it should be able to access global address of the exported page
            translateURLsToAbsolute : 'http://external-address:80/',
            // This is required only if you do not choose to enable CORS on web server.
            // In case your web server provides `Access-Control-Allow-Origin: *` header, this can be omitted.
            clientURL               : 'http://external-address:80/'
        }
    }
})
```

See corresponding section in `examples/_shared/server/README.md` for more details.
