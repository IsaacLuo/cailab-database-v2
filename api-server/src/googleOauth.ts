import secret from '../secret.json'
import config from '../config.json'
if (process.env.NODE_ENV === undefined) {
  process.env.NODE_ENV = 'development'
}

const {googleClient} = secret as any;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(
  googleClient.id,
  googleClient.secret,
  config[process.env.NODE_ENV].host + googleClient.callbackURL,
)
export default async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: client.id,
  });
  const payload = ticket.getPayload();
  const email = payload.email;
  const name = payload.name;
  return {name, email};
}