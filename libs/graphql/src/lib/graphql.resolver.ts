import { Query, Resolver } from '@nestjs/graphql';
import { User } from '@nx-nestjs-prisma-template/prisma-graphql-generated';
@Resolver(() => User)
export class GraphqlResolver {
  @Query(() => String, { name: 'HelloGraphQL' })
  async hello() {
    return `I'm working!`;
  }
}
