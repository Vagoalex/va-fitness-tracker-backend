import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { disconnect } from 'mongoose';
import { ApiMethodTypeEnum } from '../../enums/ApiMethodTypesEnum';
import { REVIEW_NOT_FOUND } from '../../../src/review/constants/review.constants';
import {
	testCreateReviewDto,
	testNonExistingProductId,
	testProductId,
} from './constants/review.constants';
import { testExistedUserAuthDto } from '../auth/constants/auth.constants';

describe('AppController (e2e) - review module tests', () => {
	let app: INestApplication;
	const API_RESOURCE: string = '/review';
	let createdReviewId: string;
	let accessToken: string;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		const { body } = await request(app.getHttpServer())
			.post('/auth/login')
			.send(testExistedUserAuthDto);

		accessToken = body.access_token as string;
	});

	it(`${API_RESOURCE}/create (${ApiMethodTypeEnum.POST}) - success`, async () => {
		return request(app.getHttpServer())
			.post(`${API_RESOURCE}/create`)
			.send(testCreateReviewDto)
			.expect(HttpStatus.CREATED)
			.then(({ body }: request.Response) => {
				createdReviewId = body._id;
				expect(createdReviewId).toBeDefined();
				return;
			});
	});

	it(`${API_RESOURCE}/create (${ApiMethodTypeEnum.POST}) - fail`, async () => {
		return request(app.getHttpServer())
			.post(`${API_RESOURCE}/create`)
			.send({ ...testCreateReviewDto, rating: 6, title: 2, name: null })
			.expect(HttpStatus.BAD_REQUEST);
	});

	it(`${API_RESOURCE}/by-product/:productId (${ApiMethodTypeEnum.GET}) - success`, async () => {
		return request(app.getHttpServer())
			.get(`${API_RESOURCE}/by-product/${testProductId}`)
			.expect(HttpStatus.OK)
			.then(({ body }: request.Response) => {
				expect(body.length).toBe(1);
				return;
			});
	});

	it(`${API_RESOURCE}/by-product/:productId (${ApiMethodTypeEnum.GET}) - fail`, async () => {
		return request(app.getHttpServer())
			.get(`${API_RESOURCE}/by-product/${testNonExistingProductId}`)
			.expect(HttpStatus.OK)
			.then(({ body }: request.Response) => {
				expect(body.length).toBe(0);
				return;
			});
	});

	it(`${API_RESOURCE}/:id (${ApiMethodTypeEnum.DELETE}) - success`, () => {
		return request(app.getHttpServer())
			.delete(`${API_RESOURCE}/${createdReviewId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.expect(HttpStatus.OK);
	});

	it(`${API_RESOURCE}/:id (${ApiMethodTypeEnum.DELETE}) - fail`, () => {
		return request(app.getHttpServer())
			.delete(`${API_RESOURCE}/${testNonExistingProductId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.expect(HttpStatus.NOT_FOUND, {
				statusCode: HttpStatus.NOT_FOUND,
				message: REVIEW_NOT_FOUND,
			});
	});

	afterAll(async () => {
		await disconnect();
	}, 100000);
});
