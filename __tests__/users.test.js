const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

const fakeUser = {
  firstName: 'Momo',
  lastName: 'Stu',
  email: 'Momo@stu.com',
  password: 'meow'
};

describe('authentication and authorization routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  it('POST /api/v1/users should create a new user', async () => {
    const res = await request(app).post('/api/v1/users').send(fakeUser);
    const { firstName, lastName, email } = fakeUser;

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      firstName,
      lastName,
      email
    });
  });

  it('POST /api/v1/users/sessions should log a user in', async () => {
    await request(app).post('/api/v1/users').send(fakeUser);
    const res = await request(app).post('/api/v1/users/session').send(fakeUser);
    expect(res.status).toBe(200);
    expect(res.body.message).toEqual('Signed in successfully!');
  });
  afterAll(() => {
    pool.end();
  });
});
