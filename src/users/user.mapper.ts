import { UserDocument } from './users-schema';

export type UserViewModel = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo: {
    isBanned: boolean;
    banDate: string;
    banReason: string;
  };
};

export type MeViewModel = {
  email: string;
  login: string;
  userId: string;
};

export const mapUserToViewModel = (user: UserDocument): UserViewModel => {
  return {
    id: user._id.toString(),
    login: user.login,
    email: user.email,
    createdAt: user.createdAt,
    banInfo: {
      isBanned: user.banInfo.isBanned,
      banDate: user.banInfo.banDate,
      banReason: user.banInfo.banReason,
    },
  };
};

export const mapUserToMeViewModel = (user: UserDocument): MeViewModel => {
  return {
    email: user.email,
    login: user.login,
    userId: user._id.toString(),
  };
};
