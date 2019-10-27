export default class DynamoDBController {
	private static instance: DynamoDBController = null;
	
	public static getInstance(): DynamoDBController {
		if (!this.instance) {
			this.instance = new DynamoDBController();
		}
		return this.instance;
	}
	
	constructor() {
		// TODO
		// init the database if needed I dunno
	}
	
	public performQuery(): any[] { // TODO
		return [];
	}
}