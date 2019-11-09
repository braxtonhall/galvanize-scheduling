import {interfaces} from "adapter";
import {ResourceKind} from "./Common";

export default interface IResourceFacade {
	list(token: string, kind: ResourceKind): Promise<interfaces.IResource[]>;
	create(token: string, resource: interfaces.IResource, kind: ResourceKind): Promise<interfaces.IResource>;
	delete(token: string, id: string, kind: ResourceKind): Promise<boolean>;
	exists(id: string, kind: ResourceKind): Promise<boolean>;
	get(token: string, id: string, kind: ResourceKind): Promise<interfaces.IResource>;
}