const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');

const fakeUser = {
  firstName: 'Momo',
  lastName: 'Stu',
  email: 'Momo@defense.gov',
  password: 'meow'
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? fakeUser.password;
  const agent = request.agent(app);
  const user = await UserService.create({ ...fakeUser, userProps });
  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
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

  it('POST should sign in an existing user', async () => {
    await request(app).post('/api/v1/users').send(fakeUser);
    const res = await request(app).post('/api/v1/users/sessions').send({ email: 'Momo@defense.gov', password: 'meow' });
    expect(res.status).toBe(200);
  });
  afterAll(() => {
    pool.end();
  });
});
