import { UserGenderTypes } from '../enums/UserGenderTypes';

const userGenders = [
	UserGenderTypes.MALE,
	UserGenderTypes.FEMALE,
	UserGenderTypes.UNKNOWN,
] as number[];

export const checkUserGenderHelper = (status: unknown) => {
	if (!status) return false;
	if (typeof status !== 'string') return false;
	return userGenders.includes(Number(status));
};
