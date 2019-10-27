import {IResource} from "adapter/dist/interfaces";
import {ResourceKind} from "./ResourceControllerTypes";

export default interface IResourceFacade {
	get(token: string, kind: ResourceKind): Promise<IResource[]>;
	create(token: string, resource: IResource, kind: ResourceKind): Promise<boolean>;
}