export type OauthDataType = {
  provider: 'google' | 'facebook';
  providerId: string;
  email: string;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
};
