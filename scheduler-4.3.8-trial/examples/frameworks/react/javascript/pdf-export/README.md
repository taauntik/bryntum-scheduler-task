# React Scheduler PDF export demo

This example uses Bryntum Scheduler wrapped in the provided `BryntumScheduler` wrapper.
This demo contains a React Scheduler with the PDF export feature enabled. You can also export to PNG &amp; Excel

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Bryntum Repository access setup

**IMPORTANT NOTE!** These access instructions are mandatory when using the private Bryntum NPM repository.

This example uses npm packages from the Bryntum private NPM repository. You must be logged-in to this repository as a
licensed or trial user to access the packages. Please
check [Online npm repository guide](https://bryntum.com/docs/scheduler/guide/Scheduler/npm-repository) for detailed information
on the sign-up/login process. Also you can check bundled guide inside distribution zip
in `docs/guides/npm-repository.md`.

# React integration guide

Please check this  
[Bryntum React integration online guide](https://bryntum.com/docs/scheduler/guide/Scheduler/integration/react) for
detailed integration information and help. Also you can check bundled guide inside distribution zip
in `docs/guides/integration/react.md`.

# Installation

Use the following command to install the example packages after the successful login.

Using **npm**:

```shell
$ npm install
```

Using **yarn**:

```shell
$ yarn install
```

# Start PDF export server

This demo requires server to create PDF/PNG files.
To setup the server please refer to this file in distribution zip `examples/_shared/server/README.md`.

## Quick setup

Usually it is enough to run these from server's folder `examples/_shared/server`:

```shell
$ npm install
$ node ./src/server.js -h 8080
```

## Loading resources

To export Scheduler to the PDF we collect HTML/styles on the client and send it to the server, which launches headless
puppeteer, open page and puts HTML directly to the page.

React development server has pretty strict CORS policy out of the box, unless you have it ejected, you cannot configure
response headers. Neither puppeteer allows to disable web security in headless mode. Thus in order to make export server
to work with demo's dev server, we added config `clientURL` which will first navigate puppeteer to the
page and then will
try to load content provided by the client.

### Dev mode

In dev mode all styles are loaded inside `<style>` tags and app itself is hosted on `localhost:3000`. It means that we
need to point all `url()` to correct URL, e.g.

Change this

```css
font : url('/static/media/myfont.eot')
```

to

```css
font : url('http://localhost:3000/static/media/myfont.eot')
```

Below config does just that

```javascript
// Main.js
pdfExportFeature    = {{
    exportServer            : 'http://localhost:8080',
    translateURLsToAbsolute : 'http://localhost:3000',
    clientURL               : 'http://localhost:3000',
    keepPathName            : false // ignores window location, uses translateURLsToAbsolute value
}}
```

Export server wouldn't require more configs:

```shell
$ node ./src/server.js -h 8080
```

## Prod mode

In production mode there could be a combination of `<style>` and `<link>` tags, which means we need to also
process `<link>`
hrefs. Also there is no default server run, so config would depend on your environment.

First, use this config:

```ts
// Main.ts
pdfExportFeature    = {{
    exportServer            : 'http://localhost:8080',
    translateURLsToAbsolute : 'http://localhost:8080/resources/',
    keepPathName            : false // ignores window location, uses translateURLsToAbsolute value
}}
```

Then run this from example's folder `examples/frameworks/react/javascript/pdf-export`:

```shell
// build for production
$ npm run build

// serve the app using `serve` npm package
$ serve -l 8081 build
```

And finally run these from server's folder `examples/_shared/server`:

```shell
$ node ./src/server.js -h 8080 -r ../../frameworks/examples/frameworks/react/javascript/pdf-export
```

Serve doesn't disable CORS by default, which is required to load styles on our origin-less page. So we rely on export
server to provide resources. Last command makes it to host resources on the address `http://localhost:8080/resources`
and disables CORS by default.

# Running a development server

To build example and start development server run this command:

Using **npm**:

```shell
$ npm run start
```

Using **yarn**:

```shell
$ yarn run start
```

Navigate to `http://localhost:3000/` or `http://127.0.0.1:3000/` in your browser. We recommend to use latest versions of
modern browsers like Chrome, FireFox, Safari or Edge (Chromium). The app will automatically reload if you change any of
the source files.

# Creating a production build

To build production code for the example run this command:

Using **npm**:

```shell
$ npm run build
```

Using **yarn**:

```shell
$ yarn run build
```

The build artifacts will be stored in the `build/` directory.

# Distribution zip references

* Bryntum API docs. Open `docs/index.html` in your browser.
* Bryntum Repository guide `docs/guides/npm-repository.md`.
* Bryntum React integration guide `docs/guides/integration/react.md`.

# Online References

* [React Framework](https://github.com/facebook/create-react-app)
* [Bryntum React integration guide](https://bryntum.com/docs/scheduler/guide/Scheduler/integration/react)
* [Bryntum Scheduler documentation](https://bryntum.com/docs/scheduler/)
* [Bryntum Scheduler examples](https://bryntum.com/examples/scheduler/)
* [Bryntum npm repository guide](https://bryntum.com/docs/scheduler/guide/Scheduler/npm-repository)
* [Bryntum support Forum](https://bryntum.com/forum/)
* [Contacts us](https://bryntum.com/contact/)
