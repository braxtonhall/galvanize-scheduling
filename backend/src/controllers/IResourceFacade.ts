import {IResource} from "adapter/dist/interfaces";
import {ResourceKind} from "./ResourceControllerTypes";

export default interface IResourceFacade {
	list(token: string, kind: ResourceKind): Promise<IResource[]>;
	create(token: string, resource: IResource, kind: ResourceKind): Promise<boolean>;
	delete(token: string, resource: IResource, kind: ResourceKind): Promise<boolean>;
}