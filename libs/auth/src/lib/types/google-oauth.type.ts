export type GoogleOauthDataType = {
  provider: 'google';
  providerId: string;
  email: string;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
};
