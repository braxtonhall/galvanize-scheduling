import {IResource, ICandidate, IInterviewer, IRoom} from "adapter/dist/interfaces";
import Dockerode from "dockerode";
import {Config, ConfigKey} from "../src/Config";
import { Context } from "mocha";

export const MOCK_CANDIDATES: ReadonlyArray<ICandidate> = [
		{
		id: "1",
		email: "christopher@frameonesoftware.com",
		phoneNumber: "(604) 319-5219",
		firstName: "Christopher",
		lastName: "Powroznik",
		position: "Lead Developer",
		notes: "Possibly the greatest candidate of all time."
	},
	{
		id: "2",
		email: "braxton.hall@alumni.ubc.ca",
		phoneNumber: "(604) 555-1234",
		firstName: "Braxton",
		lastName: "Hall",
		position: "Musical Programmer",
		notes: "Very talented at being creative with different mediums."
	},
	{
		id: "3",
		email: "kyeo@gmail.com",
		phoneNumber: "(604) 345-7890",
		firstName: "Kwangsoo",
		lastName: "Yeo",
		position: "Instructor",
		notes: "Good with people, excelled in phone interview."
	},
];

export const MOCK_ROOMS: ReadonlyArray<IRoom> = [ // TODO what are we even storing?
	{
		name: "1",
	},
	{
		name: "2",
	},
	{
		name: "3",
	}
];

const sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

let docker: Dockerode = null;
let dbContainer: Dockerode.Container = null;

export async function startDockerDatabase(suite: Context): Promise<void> {
	if (!docker) {
		console.log("TestUtil::startDockerDatabase creating new Dockerode");
		docker = new Dockerode();
	}
	if (!dbContainer) {
		try {
			console.log("TestUtil::startDockerDatabase creating new dbContainer");
			dbContainer = await docker.createContainer({
				Image:      "amazon/dynamodb-local",
				HostConfig: {
					PortBindings: {
						"8000/tcp": [
							{
								HostIP: "0.0.0.0",
								HostPort: "8000"
							}
						]
					},
				}
			});
			console.log("TestUtil::startDockerDatabase db container created. Starting.");
			await dbContainer.start();
			console.log("TestUtil::startDockerDatabase db container started. Sleeping for internal startup time.");
			await sleep(5);
		} catch (err) {
			console.warn("TestUtil::startDockerDatabase port was busy. Tests will not manage startup and teardown.");
		}
	} else {
		console.log("TestUtil::startDockerDatabase db is already going. Not making a new one.");
	}
	Config.getInstance().set(ConfigKey.dbUrl, "http://localhost:8000");
	Config.getInstance().set(ConfigKey.awsAccessKeyId, suite.test.parent.fullTitle());
	Config.getInstance().set(ConfigKey.awsRegion, "us-west-2");
	Config.getInstance().set(ConfigKey.awsSecretAccessKey, suite.test.parent.fullTitle());
}

export async function stopDockerDatabase(): Promise<void> {
	if (dbContainer) {
		console.log("TestUtil::stopDockerDatabase stopping dbContainer");
		await dbContainer.stop();
		dbContainer = null;
		console.log("TestUtil::stopDockerDatabase dbContainer stopped successfully");
	} else {
		console.log("TestUtil::stopDockerDatabase dbContainer was already stopped");
	}
}
