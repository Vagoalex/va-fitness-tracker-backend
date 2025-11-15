import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/legacy/app.module';
import * as request from 'supertest';
import { testAuthDto, testNonExistingUserId } from './constants/auth.constants';
import { ApiMethodTypeEnum } from '../../enums/ApiMethodTypesEnum';
import { REVIEW_NOT_FOUND } from '../../../src/review/constants/review.constants';

describe('AppController (e2e) - auth module tests', () => {
  let app: INestApplication;
  const API_RESOURCE: string = '/auth';
  let createdUserId: string;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`${API_RESOURCE}/register (${ApiMethodTypeEnum.POST}) - success`, async () => {
    return request(app.getHttpServer())
      .post(`${API_RESOURCE}/register`)
      .send(testAuthDto)
      .expect(HttpStatus.CREATED)
      .then(({ body }: request.Response) => {
        createdUserId = body._id;
        expect(createdUserId).toBeDefined();
        return;
      });
  });

  it(`${API_RESOURCE}/register (${ApiMethodTypeEnum.POST}) - fail`, async () => {
    return request(app.getHttpServer())
      .post(`${API_RESOURCE}/register`)
      .send({ ...testAuthDto, password: '' })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it(`${API_RESOURCE}/login (${ApiMethodTypeEnum.POST}) - success`, async () => {
    return request(app.getHttpServer())
      .post(`${API_RESOURCE}/login`)
      .send(testAuthDto)
      .expect(HttpStatus.OK)
      .then(({ body }: request.Response) => {
        accessToken = body.access_token;
        expect(accessToken).toBeDefined();
        return;
      });
  });

  it(`${API_RESOURCE}/login (${ApiMethodTypeEnum.POST}) - fail`, async () => {
    return request(app.getHttpServer())
      .post(`${API_RESOURCE}/login`)
      .send({ ...testAuthDto, password: '13213123' })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it(`${API_RESOURCE}/:id (${ApiMethodTypeEnum.DELETE}) - fail (with bearer token`, () => {
    return request(app.getHttpServer())
      .delete(`${API_RESOURCE}/${testNonExistingUserId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.NOT_FOUND, {
        statusCode: HttpStatus.NOT_FOUND,
        message: REVIEW_NOT_FOUND,
      });
  });

  it(`${API_RESOURCE}/:id (${ApiMethodTypeEnum.DELETE}) - fail (without bearer token)`, () => {
    return request(app.getHttpServer())
      .delete(`${API_RESOURCE}/${createdUserId}`)
      .expect(HttpStatus.UNAUTHORIZED, {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
      });
  });

  it(`${API_RESOURCE}/:id (${ApiMethodTypeEnum.DELETE}) - success`, () => {
    return request(app.getHttpServer())
      .delete(`${API_RESOURCE}/${createdUserId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
  });
});
