import {IResource} from "adapter/dist/interfaces";
import {ResourceKind} from "./Common";

export default interface IResourceFacade {
	list(token: string, kind: ResourceKind): Promise<IResource[]>;
	create(token: string, resource: IResource, kind: ResourceKind): Promise<boolean>;
	delete(token: string, id: string, kind: ResourceKind): Promise<boolean>;
}