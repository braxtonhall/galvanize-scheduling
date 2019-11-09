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

### Updating Dependencies
- `sh install_dependencies`

### Testing
to run tests:
`npm run test:backend`
