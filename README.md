# Interview Scheduler

Created by pH14 Solutions for Galvanize and UBC's CPSC 319 2019W1.

pH14 Solutions consists of:

- Andrea Tamez
- Braxton Hall
- Cindy Hsu
- Christopher Powroznik
- Kwangsoo Yeo
- Masahiro Toyomura

## Using the Interview Scheduler

### Website Walkthrough
The Galvanize Interview Scheduler consists of six pages.

1. **Login**. Clicking the `Login` button will redirect you to Microsoft's login process. On completion, if you are an Administrator on the Enterprise Account, you will be redirected to the Candidates page.
2. **Candidates**. This is the main landing page of the portal. It lists every Candidate in the system.
	- Click `New Candidate` to bring up a form for entering Candidate data. On submission they will be added as a row on the main table. The only required field for submission is `Email`.
	- Each row represents on saved Candidate.
		- `Candidate URL` will open a new tab in your browser (the `Submission` page) with the Candidate's availability form or booked schedule.
		- `Select` will reopen the Candidate creation form for that Candidate, allowing you to edit their fields.
		- `Send Availability` appears on Candidates who do not yet have a booked interview schedule. This will email the Candidate with a link to the `Submission` page.
		- `Cancel Meetings` appears on Candidates who already have booked meetings. This will cancel all meeting events on your Outlook Enterprise platform with the Candidate, and send the Candidate an email notifying them of the cancellation.
3. **Submission**. This page is used for sending availabilities for Candidates, or viewing their interview schedule. It is accessible by a user of the system from the `Candidate` page (so the adminitrator can update the availability directly), or via direct link through an email (so a Candidate can submit their own availability). If a Candidate already has a schedule, this page will instead show their currently booked schedule for reference for either the Candidate or administrator.
4. **Rooms**. This page displays all rooms registered with your Outlook Enterprise account. Set a room to `eligible` to have it considered in the scheduling process.
5. **Scheduling**. This page is for creating and booking Interviews with Candidates. The table includes a list of every Candidate who has already submitted an availability.
	- Click `Select` on a Candidate to bring up the Interviewers pane. This is a list of all Interviewers in the Interviewers group on your Outlook Enterprise account.
		- Enter a custom Outlook group name and click `Refresh` to bring up a list of Interviewers in that Outlook group.
	- For each Interviewer, select their `Preference` from the drop down menu to group them with another Interviewer in the interviewing process.
	- For each Interviewer, select the number of minutes needed for their Interview under `Time Needed`. If this value is set to `0`, they will not be considered in the scheduling process.
	- Click `Generate Schedules` to see up to three generated schedules on the Schedules pane.
		- This is a list of possible schedules, each one taking into account the availability of the Candidate, the working hours of each interviewer, and the availability of the room.
	- Click `Select` on your desired schedule to bring up the Actions pane.
		- This view contains all the details of the Schedule for review.
	- Click `Schedule & Send Emails` to book the meetings with the Interviewers on Outlook, add the event to the room's calendar, add and save the meetings to the Candidate for viewing on the `Submission` page, and send an email to the Candidate alerting them of the completion of scheduling.
6. **About**. That page is likely where you're reading this! Click a document to read more about the making of this project, or an author to view their GitHub profile.

On any page, click `Logout` when you're finished working.

### API
**Endpoints**

All authorized routes require the request header `token`, which should be set to the authenticated token provided by the login process.

- **_Candidates_**
  - **`GET    /resource/candidate`**
	  - The request body should be JSON object that contains the field `id` paired with the id of the candidate to be fetched.
	  - If successful, response status will be set to `200`.
		  - If the request was authenticated, an `ICandidate` will be returned.
		  - If the request was not authenticated but there was a Candidate matching that ID in the system, an `ICandidate` will be returned, but all fields will be trimmed except for `firstName`, `availability` and `schedule`.
	  - Else, response status will be set to `404`.
  - **`GET    /resource/candidates`**
	 - If successful, response status will be set to `200`, and a JSON array of every `ICandidate` in the system will be returned.
	 - If the user is not authenticated, response status will be set to `401`.
	 - If unsuccessful for any other reason, response status will be set to `400`.
  - **`POST   /resource/candidate`**
 	 - Saves an `ICandidate` to the database. The request body data should be set to the `ICandidate` to be saved. The `email` field is required and must be a valid email string. If no `id` field is present, one will be generated. The `id` will be a minimum six character hash of an atomic counter in the database concatenated with a 32 character random string.
 	 - If successful, the response status will be set to `200`, and the response will contain the `ICandidate` that was saved to the database.
 	 - If the user is not authenticated, response status will be set to `401`.
 	 - If unsuccessful for any other reason, response status will be set to `400`.
   - **`DELETE /resource/candidate`**
     - The request body should be JSON object that contains the field `id` paired with the id of the candidate to be deleted from the database.
     - If successful, the responds with `200 true`.
 	 - If the user is not authenticated, response status will be set to `401`.
 	 - If unsuccessful for any other reason, response status will be set to `400`.
- **_Rooms_**
  - **`GET    /resource/rooms`**
  	 - If successful, response status will be set to `200`, and a JSON array of `IRoom` objects representing every room registered with Galvanize's Enterprise account will be returned. The field `eligible` will be set to `true` if the primary key of the room was saved in the database, and `false` otherwise. The `eligible` field marks whether or not a room will be considered in the scheduling process.
	 - If the user is not authenticated, response status will be set to `401`.
	 - If unsuccessful for any other reason, response status will be set to `400`.
  - **`POST   /resource/room`** 
  	 - Saves the primary key of an `IRoom` to the database. The request body data should be set to the `IRoom` whose key is to be saved. This decides the eligibility of the room in the scheduling process. The `id` field is required.
 	 - If successful, the response status will be set to `200`, and the response will contain the `ICandidate` that was saved to the database.
 	 - If the user is not authenticated, response status will be set to `401`.
 	 - If unsuccessful for any other reason, response status will be set to `400`.
  - **`DELETE /resource/room`**
     - The request body should be JSON object that contains the field `id` paired with the id of the room whose key is to be deleted from the database. This decides the eligibility of the room in the scheduling process.
     - If successful, the responds with `200 true`.
 	 - If the user is not authenticated, response status will be set to `401`.
 	 - If unsuccessful for any other reason, response status will be set to `400`.
- **_Interviewers_**
  - **`GET    /resource/interviewers`**
	  - If successful, response status will be set to `200`, and a JSON array of `IInterviewer` objects representing every employee registered with Galvanize's Enterprise account in the group denoted by `groupName` will be returned. `groupName` is to be set in the request query, specifies which group in Outlook to retrieve members from. `groupName` is not set, the system will default to its environment's `INTERVIEWER_GROUP_NAME`, described further below and in `.env.sample`.
	  - If the user is not authenticated, response status will be set to `401`.
 	 - If unsuccessful for any other reason, response status will be set to `400`.
- **_Schedules_**
  - **`GET    /resource/schedules`**
	 - Calculates viable schedules and returns them. The query should be set to a valid `IGetSchedulesOptions` object. There may be cycles and chains in the `preferences` array, as the system will attempt to group everyone in the cycle/chain together into one interview. However, having mismatched minutes within a cycle/chain may lead to undefined behaviour.
  	 - If successful, response status will be set to `200`, and a JSON array of up to three `ISchedule` objects will be returned.
  	 	 - The calendars, timezones, and individual working hours of every room and interviewer are compared with the availability of the supplied `ICandidate`.
  	 	 - Every room marked `eligible` is then scored by their averave overlap with interviewers' schedules, their largest timeslot length, their capacity, and their average timeslot length.
  	 	 - Rooms are then selected in the order of their scores at the privous step and are filled up with iterviews back to back if possible, and a break is inserted every four hours of consecutive interviews.
  	 	 - Ten schedules are generated with slight variation in inputs and parameters. Then the schedule with the fewest room switches, the schedule with the most interviewers actually places, and the schedule that does the best across both categories are all returned (if any viable schedules were found at all).
  	 - If the user is not authenticated, response status will be set to `401`.
 	 - If unsuccessful for any other reason, response status will be set to `400`.
  - **`POST   /resource/schedule`**
	  - Saves the provided `ISchedule` timeslots to the `ICandidate`, emails the candidate, alerting them that the schedule has been made, and books an events for every meeting with each interviewer and room on the Outlook Enterprise account. This will not work on Candidates that already have a schedule.
	  - The request body should be set to the `ISchedule` to save.
	  - If successful, the response status will be set to `200`.
 	 - If the user is not authenticated, response status will be set to `401`.
 	 - If unsuccessful for any other reason, response status will be set to `400`.
  - **`DELETE /resource/schedule`**
     - Cancels the specified candidate's schedule. An email is sent to the candidate, alerting them of the cancellation, and every event with the candidate on the Outlook Enterprise account is cancelled.
     - The request body should be JSON object that contains the field `id` paired with the id of the candidate whose schedule is to be cancelled.
     - If successful, the response status will be set to `200`.
 	 - If the user is not authenticated, response status will be set to `401`.
 	 - If unsuccessful for any other reason, response status will be set to `400`.
- **_Availability_**
  - **`POST   /sendavailability`**
	  - Sends an availibity form invitation to the selected candidate in the form of an email from the administrator.
	  - The request body data should be set to the `ICandidate` representing the candidate to be emailed.
	  - If successful, the response status will be set to `200`.
 	 - If the user is not authenticated, response status will be set to `401`.
 	 - If unsuccessful for any other reason, response status will be set to `400`.
  - **`POST   /submitavailability`**
	  - The request body should be JSON object that contains the field `id` paired with the id of the candidate that will be updated, as well as the field `availability` that contains a JSON array of `ITimeslots`. If these timeslots contain fields other thatn `start` and `end`, these excess fields will be clipped and not saved. All `start` times must be before `end` times.
	  - If successful, the response status will be set to `200`.
 	 - If the `id` of the candidate is not found, response status will be set to `404`.
 	 - If unsuccessful for any other reason, response status will be set to `400`.
- **_Authorization_**
  - **`GET    /login`**
	  - Initiates login process with Microsoft via a redirect. At the end of the login process, the token provided by Microsoft is saved in the database.
  - **`POST   /authenticate`**
	  - Checks whether or not the provided authorization token is active in the database. The token expires after 30 minutes.
  - **`GET    /logout`**
	  - Deletes the provided authorization token from the database.
- **_Misc_**
  - **`GET    /health`**
	  - Responds with status set to `200`.
  - **`POST   /saveauth`**
	  - This is an endpoint created specifically for testing and is disabled unless the environment variable `PRODUCTION` is exactly set to `false`.
	  - The token sent in the `token` header is not a Microsoft token, but instead a long string matching the `TEST_SECRET_KEY` environment variable.
	  - This endpoint saves an authorization with Microsoft into the database without the login process. This allows for automated testing without manually logging in.
	  - The body of the request should be a JSON object with a field `token` paired with the Microsoft authorization token that is to be saved in the database.
	  - If successful, the response status will be set to `200`.
 	 - If the provided token does not match the `TEST_SECRET_KEY` variable that is being used in the backend, response status will be set to `401`.
 	 - If unsuccessful for any other reason, response status will be set to `400`.
  - **`POST   /setconfig`**
 	 - This is an endpoint created specifically for testing and is disabled unless the environment variable `PRODUCTION` is exactly set to `false`.
	  - The token sent in the `token` header is not a Microsoft token, but instead a long string matching the `TEST_SECRET_KEY` environment variable.
	  - This endpoint can override any config field (usually environment variables) being used in the backend. This is useful to the test suite, as not all the Microsoft Graph endpoints are useable by the token generated by the test suite, so this endpoint allows the test suite to replace some of them with other endpoints.
	  - The body of the request should be a JSON object with a field `key` paired with the key of the config instance to be overwritten, as well as the field `value` with the value to be set at that key.
	  - If successful, the response status will be set to `200`.
 	 - If the provided token does not match the `TEST_SECRET_KEY` variable that is being used in the backend, response status will be set to `401`.
 	 - If unsuccessful for any other reason, response status will be set to `400`.

**Types**

```typescript
interface ICandidate {
	email: string;
	id?: string;
	phoneNumber?: string;
	firstName?: string;
	lastName?: string;
	position?: string;
	notes?: string;
	availability?: ITimeslot[];
	schedule?: ITimeslot[];
}

interface IRoom {
	id: string;
	name: string,
	eligible: boolean;
	email: string;
	capacity: number;
}

interface IInterviewer {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
}

interface ISchedule {
	candidate: ICandidate;
	meetings: IMeeting[];
}

interface IGetSchedulesOptions {
	preferences: IPreference[];
	candidate: ICandidate;
}

interface IPreference {
	interviewer: IInterviewer;
	preference?: IInterviewer;
	minutes: number;
}

interface ITimeslot {
	start: string; // ISO formatted time
	end: string;   // ISO formatted time
	note?: string;
	// note may include a room number for the ICandidate schedule
}

interface IMeeting extends ITimeslot {
	interviewers: IInterviewer[];
	room: IRoom;
}
```

## Configuration

### Outlook Setup

The Interview Scheduler queries for data from your Microsoft Office Enterprise account regularly to ensure that it does not store anything that's stale. In order for this to work, some small steps need to be taken to ensure your Enterprise account is ready.

1. Ensure that the rooms in your office are registered as Resources on your Enterprise platform. An administrator can register them [here](https://admin.microsoft.com/Adminportal/Home#/ResourceMailbox). As well, for each room, under Resource Scheduling,
	1. Turn on "Automatically process even invitations and cancellations."
	2. Remove "Limit event duration."
	3. Open "Scheduling permissions."
	
	More information can be found [here if logged in as the resource](https://outlook.office365.com/mail/options/calendar/resourceScheduling) and [here](https://kb.wisc.edu/office365/40547#permissions).
	
2. Ensure you have added a your employees who are candidates for conducting an interview together in an Office group. The recommended group name is `Interviewers`. Any group can be retrieved as "Interviewers," however the system will default to `Interviewers`. To change this default, refer to the Environment section below.

3. Give all administrators of the system the requisite permissions in your Azure Portal.
	1. Navigate to Home > Users > User > Assigned Roles
	2. Set the users' permissions. In order for them to effectively leverage the system, they must have permission to manage enterprise apps, view other users' schedules, and edit other users' schedules.

4. Register an app on Azure. Afterward, edit the application's authentication permissions to allow for Microsoft redirects to and from the application.
	1. Navigate to Home > Azure Active Directory > App Registrations > Applicaton > Authentication
	2. Register the following addressed
		- `<UI_URL>`
		- `<UI_URL>/candidates`
		- `<SERVER_URL>`
		- `<SERVER_URL>/callback`

5. Under your Enterprise [Azure portal's](https://portal.azure.com) OAuth scope page, open the needed Microsoft Graph API permissions.
	1. Navigate to Home > Azure Active Directory > App registrations > App name > View API permissions
	2. Turn on the following permissions
	  - Calendars.ReadWrite.Shared **Delegated**
	  - Directory.Read.All **Application**
	  - Group.Read.All **Application**
	  - Group.Selected **Application**
	  - Mail.Send **Application**
	  - Place.Read.All **Application**
	  - User.Read.All **Application**

### Environment

The application relies on several environment variables for further configuration. These environment variables are further detailed under the Development header, and described individually in the `.env.sample`, included in the project directory.

Some evironment variables of note are described here.

- **`INTERVIEWER_GROUP_NAME`**
	- This controls the default name of the group whose members will be retrieved from Outlook when attempting to retrieve all interviewers.
	- If this variable is not set, the system will default it to `Interviewer`.
- **`OAUTH_SCOPES`**
	- This gives the backend permissions to interface with Microsoft Graph. They should match the OAuth scopes described above in Outlook Setup.
- **`PRODUCTION`**
	- If this evironment variable is set to `false`, two endpoints in the system backend will be opened that allow for editing the environment of the backend remotely if a secret key is provided. This is of course only to be used by local testing.
	- If this variable is not set, the system will default it to `true`.
- **`TEST_SECRET_KEY`**
	- This variable allows you to set a password that for using the two test endpoints in the system backend that allow for editing the environment of the backend remotely. These endpoints are only opened by the `PRODUCTION` variable described above.
	- This variable has no default value.

## Deployment

To deploy, create Docker images for the frontend and the backend, and host them on your cloud services platform of choice.

From the project root directory,

- `docker image build -f Dockerfile_frontend -t glvnzschedui .`
- `docker image build -f Dockerfile_backend -t glvnzschedserver .`

To save these images to files to be used on other machines,

- `docker save glvnzschedui:latest | gzip > glvnzschedui.tar.gz`
- `docker save glvnzschedserver:latest | gzip > glvnzschedserver.tar.gz`

More information on hosting Docker images on AWS can be found [here](https://aws.amazon.com/getting-started/tutorials/deploy-docker-containers/).

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

- Create a `.env` file and put it in the root directory of the project. (`touch .env`)
  - This file should **never** be committed to version control.
- Copy `.env.sample` to the new `.env` file. (`cat .env.sample > .env`)
- Modify as necessary to your environment.
  - `.env.sample` includes further documentation for each environment variable.

### Debugging the Backend
You can remotely connect to your local backend service through `chrome://inspect` or by creating a `Attach to node.js` run configuration in Webstorm/IntelliJ.
- `npm run stop-backend` to stop any existing containers using the ports
- (optional) `npm run build-backend` to update the docker image
- `npm run debug-backend` to start an instance of the backend and db that does not persist data

In Webstorm, create an attachment run configuration with `localhost`on port `9229`. This is the default Node inspection port. Add breakpoints and hit debug, the program should now pause when the breakpoint is hit by any external calls.

### Updating Dependencies
Simply run `sh install_dependencies.sh` from the root directory of the project. This will update the dependencies of the `adapter`, `frontend`, and `backend` packages.

### Testing

**Unit Tests**

To run unit tests of the backend, from the root directory run
`npm run test:backend`

**Integration Tests**

- If you already have an instance of the backend running: `npm run test:adapter`
- If you would like to do startup + teardown: `npm run test:integration`. You may have to stop existing containers first (`npm run stop-backend`).

Note for devs: `test:integration` does not re-build the image.

**Customizing the Test Suites**

There are some flags in `integration.spec.ts` that turn certain tests on and off. Some rely the specific integration with the ph14solutions active directory.
Using a different directory to run tests against would require updating those tests, or you can disable them by setting the flags to false.