export interface UserJwtPayloadModel {
	userId: string;
	email: string;
	iat?: number;
	exp?: number;
}
