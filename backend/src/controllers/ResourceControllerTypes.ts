import { IInterviewer, IRoom, ICandidate, IResource } from "adapter/dist/interfaces";

export interface IResourceController {
	list(token: string): Promise<IResource[]>;
	create(token: string, resource: IResource): Promise<boolean>;
	delete(token: string, id: string): Promise<boolean>;
}

export interface ICandidateController extends IResourceController {

}

export interface IInterviewerController extends IResourceController {

}

export interface IRoomController extends IResourceController {
	
}
