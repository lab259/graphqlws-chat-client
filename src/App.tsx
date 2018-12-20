import React, { Component } from "react";
import { ApolloClient } from "apollo-client";
import { split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloProvider } from "react-apollo";
import Chat from "./Chat";
import { STORAGE } from "./constants";

const httpLink = new HttpLink({
  uri: "http://localhost:8085/graphql"
});

const wsLink = new WebSocketLink({
  uri: "ws://localhost:8085/subscriptions",
  options: {
    reconnect: true,
    lazy: true,
    connectionParams: () => {
      const currentUser = localStorage.getItem(STORAGE.CURRENT_USER);
      return {
        authToken: currentUser || "Anonymous"
      };
    }
  }
});

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const cache = new InMemoryCache();
const client = new ApolloClient({ link, cache });

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <main>
          <h1>
            Simple Chat
            <div className="github-buttons">
              <a
                className="github-button"
                href="https://github.com/lab259/graphqlws-chat-client"
                data-icon="octicon-star"
                data-size="large"
                aria-label="Star lab259/graphqlws-chat-client on GitHub"
              >
                Star
              </a>
              <a
                className="github-button"
                href="https://github.com/lab259/graphqlws-chat-client/fork"
                data-icon="octicon-repo-forked"
                data-size="large"
                aria-label="Fork lab259/graphqlws-chat-client on GitHub"
              >
                Fork
              </a>
            </div>
          </h1>
          <Chat />
        </main>
      </ApolloProvider>
    );
  }
}

export default App;
