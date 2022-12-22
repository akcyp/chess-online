import { connect } from 'redis';

export const redis = await connect({
  hostname: '0.0.0.0',
  port: 6379,
});
