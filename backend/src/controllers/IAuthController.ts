export default interface IAuthController {
	saveAuth(token: string): boolean;
	checkAuth(token: string): boolean;
	removeAuth(token: string): boolean;
}