import { Controller } from '@nestjs/common';

export const PublicController = (prefix: string) => {
	return Controller(`public/${prefix}`);
};
