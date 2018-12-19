import gql from "graphql-tag";
import { Mutation, MutationFn } from "react-apollo";

interface Data {
  send: {
    text: string;
    user: {
      name: string;
    };
  };
}

interface Variables {
  user: string;
  text: string;
}

export default class SendMessageMutation extends Mutation<Data, Variables> {}
export type SendMessageMutationFn = MutationFn<Data, Variables>;

export const SEND_MESSAGE = gql`
  mutation($user: String!, $text: String!) {
    send(user: $user, text: $text) {
      text
      user {
        name
      }
    }
  }
`;
