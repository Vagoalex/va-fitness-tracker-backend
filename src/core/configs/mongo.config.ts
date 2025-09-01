import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getMongoConfig = async (
	configService: ConfigService,
): Promise<MongooseModuleOptions> => {
	return {
		uri: getMongoString(configService),
		...getMongoOptions(),
	};
};

const getMongoString = (configService: ConfigService) => {
	const LOGIN: string = configService.get('MONGO_LOGIN');
	const PASSWORD: string = configService.get('MONGO_PASSWORD');
	const CLUSTER: string = configService.get('MONGO_CLUSTER');

	return `mongodb+srv://${LOGIN}:${PASSWORD}@${CLUSTER}.mongodb.net/`;
};

const getMongoOptions = () => {
	return {
		autoIndex: true,
	};
};
