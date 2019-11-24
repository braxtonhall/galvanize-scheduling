# Interview Scheduler

Created by pH14 Solutions for Galvanize and UBC's CPSC 319 2019W1.

pH14 Solutions consists of:
- Andrea Tamez
- Braxton Hall
- Cindy Hsu
- Christopher Powroznik
- Kwangsoo Yeo
- Masahiro Toyomura

## Configuration

### Outlook Setup

Ensure you have added a your employees who are candidates for conducting an interview to the Group `Interviewers`.

## Deployment

## Development

### First Time Installation
The development process requires installation of several dependencies. This includes:
- `Node` (and `npm`). Both the frontend and backend systems run in Node, and npm is used to manage dependencies. 
- `Docker`. Used to automatically deploy dummy containers during the testing process.
- `amazon/dynamodb-local`. This image is used to mock the database.
 - To install this, run `docker pull amazon/dynamodb-local`. This needs to done only once.
- `docker-compose` *(optional)*. This is used for orchestrating multiple containers at once. This can allow for building and deploying test instances of the project's micro services all in one command.

### Configuring Your Environment
Environment variables are used to manage the configuration of the project's micro services.

- Create a `.env` file and put it in the root directory of the project.
  - This file should **never** be committed to version control.
- Copy `.env.sample` to the new `.env` file and modify as necessary.
  - `.env.sample` includes further documentation for each environment variable.

### Debugging the Backend
You can remotely connect to your local backend service through `chrome://inspect` or by creating a `Attach to node.js` run configuration in Webstorm/IntelliJ.
- `npm run stop-backend` to stop any existing containers using the ports
- (optional) `npm run build-backend` to update the docker image
- `npm run debug-backend` to start an instance of the backend and db that does not persist data

In Webstorm, create an attachment run configuration with `localhost`on port `9229`. This is the default Node inspection port. Add breakpoints and hit debug, the program should now pause when the breakpoint is hit by any external calls.

### Updating Dependencies
- `sh install_dependencies`

### Testing
#### Unit Tests
to run tests:
`npm run test:backend`
#### Integration Tests
- Complete the fields marked with `#change` in your `.env` file, using values associated with the app in your test instance of Active Directory (found in the admin portal)
- If you already have an instance of the backend running: `npm run test:adapter`
- If you would like to do startup + teardown: `npm run test:integration`. You may have to stop existing containers first (`npm run stop-backend`).

Note for devs: `test:integration` does not re-build the image.

##### Customizing the Test Suites
There are some flags in `integration.spec.ts` that turn certain tests on and off. Some rely the specific integration with the ph14solutions active directory.
Using a different directory to run tests against would require updating those tests, or you can disabling them by setting the flags to false.