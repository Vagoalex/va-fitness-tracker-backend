import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '@/common/security/constants/security.constants';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
