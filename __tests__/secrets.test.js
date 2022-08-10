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
  it('should get list of secrets if user is signed in', async () => {
    const [agent] = await registerAndLogin();
    const res = await agent.get('/api/v1/secrets');
    expect(res.status).toBe(200);
    expect(res.body[0]).toEqual({
      title: expect.any(String),
      description: expect.any(String),
      created_at: expect.any(String)
    });
  });
  it('should add a new secret if user is logged in', async () => {
    const [agent] = await registerAndLogin();
    const newSecret = {
      title: 'Cats',
      description: 'Cats are also spy drones'
    };
    const res = await agent.post('/api/v1/secrets').send(newSecret);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      created_at: expect.any(String),
      ...newSecret
    });
  });
  afterAll(() => {
    pool.end();
  });
});
