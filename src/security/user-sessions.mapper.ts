import { UserSessions } from './user-sessions-schema';

export const mapUserSessionToViewModel = (userSession: UserSessions) => {
  return {
    ip: userSession.ip,
    title: userSession.deviceName,
    lastActiveDate: new Date(userSession.issuedAt * 1000).toISOString(),
    deviceId: userSession.deviceId,
  };
};
