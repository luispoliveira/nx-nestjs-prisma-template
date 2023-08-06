import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class LoginInput {
  @Field(() => String, { nullable: false })
  @IsString()
  username!: string;

  @Field(() => String, { nullable: false })
  @IsString({})
  password!: string;
}
