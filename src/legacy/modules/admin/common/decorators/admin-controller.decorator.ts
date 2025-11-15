import { Controller } from '@nestjs/common';

export const AdminController = (prefix: string) => {
	return Controller(`admin/${prefix}`);
};
