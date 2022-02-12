# ASP.NET Scheduler Demo

This is a demo showing Bryntum Scheduler component running with a ASP.NET backend.

# Bryntum Repository access setup

**IMPORTANT NOTE!** These access instructions are mandatory when using the private Bryntum NPM repository.

This example uses npm packages from the Bryntum private NPM repository. You must be logged-in to this repository as a
licensed or trial user to access the packages. Please
check [Online npm repository guide](https://bryntum.com/docs/scheduler/guide/Scheduler/npm-repository) for detailed information
on the sign-up/login process. Also you can check bundled guide inside distribution zip
in `docs/guides/npm-repository.md`.

## Required software

Requirements for this example :
- Visual Studio 2017+
- MS SQL Server (express edition is enough for this demo purposes)
- Node.js 10+

## Example installation

1) Launch Visual Studio, open this solution via FILE > OPEN > Project/Solution.
2) Build the solution, it will resolve it's dependencies.
3) Create the application database:

    1. create the database (we used MS SQL Management Studio for that you can pick another similar tool) Note: by default the example configured to use database named 'bryntum_scheduler' you can give it another name and edit corresponding configuration files (see "Setup the database connection for Entity Framework" below for details).
    2. create user for the application to use the database (in this example we use 'bryntum' as default for the user login and password).
    3. create tables

    To setup tables you have two options:

        a) Generate database from entity model
        b) Execute sql/setup.sql

    Both approaches will create tables and relations required for the demo, but in case you run sql script you will also get some test data.
    In case you want to generate clean database from model, you will also have to add the following record to the `Options` table:

        INSERT [dbo].[Options] ([name], [value]) VALUES (N'revision', N'1')

4) Setup the database connection for the Entity Framework

    By default we use MSSQL Express installed on localhost. If you share this approach and you created user 'bryntum',
    as described above, connection should be fine from the box. If not - change credentials in BryntumScheduler/App.config
    and BryntumSchedulerCrudDemo/Web.config:

        <connectionStrings>
            <add name="SchedulerEntities"
            connectionString="metadata=res://*/Entities.csdl|res://*/Entities.ssdl|res://*/Entities.msl;provider=System.Data.SqlClient;provider connection string=&quot;data source=.\SQLEXPRESS;initial catalog=bryntum_scheduler;user id=bryntum;password=bryntum;MultipleActiveResultSets=True;App=EntityFramework&quot;"
            providerName="System.Data.EntityClient" />
        </connectionStrings>

5) Build javascript application

    - Navigate to BryntumSchedulerCrudDemo/app
    - run `npm install && npm run build`

6) Run BryntumSchedulerCrudDemo project
