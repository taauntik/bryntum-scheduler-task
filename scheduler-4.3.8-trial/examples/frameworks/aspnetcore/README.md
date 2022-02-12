# Scheduler ASP.NET Core demo

This demo shows Scheduler component working with backend on ASP.NET Core with MySQL as a database.

# Bryntum Repository access setup

**IMPORTANT NOTE!** These access instructions are mandatory when using the private Bryntum NPM repository.

This example uses npm packages from the Bryntum private NPM repository. You must be logged-in to this repository as a
licensed or trial user to access the packages. Please
check [Online npm repository guide](https://bryntum.com/docs/scheduler/guide/Scheduler/npm-repository) for detailed information
on the sign-up/login process. Also you can check bundled guide inside distribution zip
in `docs/guides/npm-repository.md`.

## Setup

There are few ways to start the application:

1. [Manual installation](#manual-installation)
2. [Using Docker](#using-docker) (recommended)
3. [Use Docker for MySQL and platform-native .NET Core](#Docker-+-platform-native-.NET)

<a name="manual"></a>
## Manual installation

### Prerequisites
1. MySQL server
2. .NET Core 3.1
3. ASP.NET Core 3.1
4. NodeJS 10+

### Setup MySQL server

1. Create new database called `bryntum_scheduler`
    
    ```
    CREATE DATABASE IF NOT EXISTS `bryntum_scheduler`;
    ```

2. Create new user

    ```
    CREATE USER 'USERNAME'@'%' IDENTIFIED BY 'PASSWORD';
    GRANT ALL ON `bryntum_scheduler`.* TO 'USERNAME'@'%';
    ```

3. Setup tables with initial data

    ```
    aspnetcore$ mysql -uUSERNAME -pPASSWORD bryntum_scheduler < ./sql/setup.sql
    ```

If setup was successful you should see this output from mysql

```
# mysql -ubryntum -pbryntum bryntum_scheduler
mysql> show tables;
+-----------------------------+
| Tables_in_bryntum_scheduler |
+-----------------------------+
| events                      |
| options                     |
| resources                   |
+-----------------------------+
3 rows in set (0.00 sec)
```

### Build JS application

```
aspnetcore$ (cd BryntumSchedulerDemo/wwwroot/app && npm i && npm run build)
```

### Building .NET application

Use IDE (Visual Studio 2019, VS Code + extenstions, etc) to open solution. Alternatively, you can use CLI:

1. Install NuGet packages
    ```
    aspnetcore$ cd BryntumSchedulerDemo
    BryntumSchedulerDemo$ dotnet restore
    ```
2. Change MySQL connection settings at `BryntumSchedulerDemo/appsettings.json`

3. Run app
    ```
    BryntumSchedulerDemo$ dotnet run
    info: Microsoft.Hosting.Lifetime[0]
          Now listening on: http://localhost:5000
    info: Microsoft.Hosting.Lifetime[0]
          Application started. Press Ctrl+C to shut down.
    info: Microsoft.Hosting.Lifetime[0]
          Hosting environment: Development
    info: Microsoft.Hosting.Lifetime[0]
          Content root path: ...Scheduler\examples\aspnetcore\BryntumSchedulerDemo
    ```

Now you can open application at http://localhost:5000

<a name="docker"></a>
## Using Docker

### Prerequisites

1. [Docker](https://docs.docker.com/install/)
2. NodeJS 10+

### Install Docker

Refer to the docker docs to learn how to install Docker:
https://docs.docker.com/install/

If you are using Linux, make sure to follow post-installation steps described in this guide:
https://docs.docker.com/install/linux/linux-postinstall/

### Configure

There is a `docker-compose.yml` config in the application root folder which specifies environment required to run the
application. Environment is just two containers:

1. [MySQL](https://hub.docker.com/_/mysql) version 8.0. 

    Container will have MySQL database with a required tables created, running on default port, exposed to localhost:33061.

2. [ASP.NET Core Runtime](https://hub.docker.com/_/microsoft-dotnet-core-aspnet/) version 3.1.

    Container will build and run ASP.NET Core application, exposed to localhost:8080.

### Start

To start application with docker it is enough to call:

    aspnetcore$ docker-compose up

Now wait until mysql container is up and listening to connection, you will see this message in console

```
/usr/sbin/mysqld: ready for connections. Version: '8.0.19'
  socket: '/var/run/mysqld/mysqld.sock'  port: 3306  MySQL Community Server - GPL.
  ```

meaning app is ready to use. Navigate to http://localhost:8080/ and see.

## Docker + platform-native .NET

This is convenient way to develop application in IDE without having to install and setup MySQL database.

### Prerequisites

1. [Docker](https://docs.docker.com/install/)
2. NodeJS 10+
3. .NET Core 3.1
4. ASP.NET Core 3.1

### Setup

1. Start MySQL container

    Run this to only start MySQL container

        docker-compose up -d db

    MySQL will be listening on `localhost:33061`

2. Build JS/.NET Application

    Build JS and .NET applications as described in the [Manual installation](#dotner) section

