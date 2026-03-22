import { SetMetadata } from '@nestjs/common';
import { SECURITY_CONSTANTS } from '@/core/security/constants/security.constants';

export const Public = () => SetMetadata(SECURITY_CONSTANTS.IsPublicKey, true);
