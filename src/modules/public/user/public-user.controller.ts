import { PublicController } from '../common/decorators/public-controller.decorator';
import { PublicUserService } from './public-user.service';
import { UserController } from '../../shared/user/user.controller';

@PublicController('user')
export class PublicUserController extends UserController {
	constructor(protected readonly userService: PublicUserService) {
		super(userService);
	}
}
