import { GraphQLGenDefinition } from 'graphqlgen-json-schema';
import { CodeFileLike } from './types';
/**
 * Bootstrap a graphqlgen config for the user to finish configuring.
 */
declare const writeConfigScaffolding: () => void;
/**
 * Output the generated resolver types.
 */
declare const writeTypes: (types: string, config: GraphQLGenDefinition) => void;
/**
 * Output scaffolded resolvers.
 */
declare const writeResolversScaffolding: (resolvers: CodeFileLike[], config: GraphQLGenDefinition) => void;
export { writeTypes, writeConfigScaffolding, writeResolversScaffolding };
