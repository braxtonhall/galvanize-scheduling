import { interfaces } from "adapter";

export interface IResourceController {
	list(token: string): Promise<interfaces.IResource[]>;
	create(token: string, resource: interfaces.IResource): Promise<interfaces.IResource>;
	delete(token: string, id: string): Promise<boolean>;
	exists(id: string): Promise<boolean>;
}

export interface ICandidateController extends IResourceController {

}

export interface IInterviewerController extends IResourceController {

}

export interface IRoomController extends IResourceController {

}
