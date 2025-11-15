import { UserStatusTypes } from '../enums/UserStatusTypes';

const userStatuses = [UserStatusTypes.ACTIVE, UserStatusTypes.BLOCKED] as number[];

export const checkUserStatusHelper = (status: unknown) => {
	if (!status) return false;
	if (typeof status !== 'string') return false;
	return userStatuses.includes(Number(status));
};
