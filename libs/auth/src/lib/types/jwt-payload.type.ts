export type JwtPayloadType = {
  userId: number;
  email:string;
  username: string;
  permissions: string[];
  roles: string[];
};
