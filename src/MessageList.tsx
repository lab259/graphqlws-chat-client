import React, { Component } from "react";
import ApolloClient from "apollo-client";
import gql from "graphql-tag";

type EventType = "join" | "left" | "message";

interface User {
  name: string;
}

interface Message {
  text: string;
  user: User;
}

interface Props {
  client: ApolloClient<any>;
}

interface State {
  events: Array<{
    type: EventType;
    payload: Message | User;
  }>;
}

export default class MessageList extends Component<Props, State> {
  onMessage: ZenObservable.Subscription;
  onUserInteraction: ZenObservable.Subscription;

  container: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);

    const { client } = this.props;

    this.state = {
      events: []
    };

    this.container = React.createRef();

    this.onMessage = client
      .subscribe<OnMessageResult>({ query: ON_MESSAGE })
      .subscribe(
        ({ data }) => {
          this.handleOnMessage(data.onMessage);
        },
        error => {
          console.error(error);
        }
      );

    this.onUserInteraction = client
      .subscribe<OnUserInteractionResult>({ query: ON_USER_INTERACTION })
      .subscribe(
        ({ data }) => {
          if (data.onJoin) {
            this.handleOnJoin(data.onJoin);
          }
          if (data.onLeft) {
            this.handleOnLeft(data.onLeft);
          }
        },
        error => {
          console.error(error);
        }
      );
  }

  handleOnMessage = (message: Message) => {
    this.setState(
      ({ events }) => ({
        events: [...events, { type: "message", payload: message }]
      }),
      this.scrollToRecent
    );
  };

  handleOnJoin = (user: User) => {
    this.setState(
      ({ events }) => ({
        events: [...events, { type: "join", payload: user }]
      }),
      this.scrollToRecent
    );
  };

  handleOnLeft = (user: User) => {
    this.setState(
      ({ events }) => ({
        events: [...events, { type: "left", payload: user }]
      }),
      this.scrollToRecent
    );
  };

  scrollToRecent = () => {
    const container = this.container.current;
    if (container) {
      container.scrollTop = container.scrollHeight - container.offsetHeight;
    }
  };

  componentWillUnmount() {
    this.onMessage.unsubscribe();
    this.onUserInteraction.unsubscribe();
  }

  render() {
    const { events } = this.state;

    return (
      <div ref={this.container} className="chat-container">
        {events.map((event, index) => {
          if (event.type === "join") {
            const user = event.payload as User;

            return (
              <div key={index} className="event event--join text-muted">
                <p>{user.name} joined</p>
              </div>
            );
          }

          if (event.type === "left") {
            const user = event.payload as User;

            return (
              <div key={index} className="event event--left text-muted">
                <p>{user.name} just left</p>
              </div>
            );
          }

          const message = event.payload as Message;

          return (
            <div key={index} className="event event--message">
              <div className="author text-muted">{message.user.name}</div>
              <p>{message.text}</p>
            </div>
          );
        })}
      </div>
    );
  }
}

interface OnUserInteractionResult {
  data: { onJoin?: User; onLeft?: User };
}
const ON_USER_INTERACTION = gql`
  subscription {
    onJoin {
      name
    }
    onLeft {
      name
    }
  }
`;

interface OnMessageResult {
  data: { onMessage: Message };
}
const ON_MESSAGE = gql`
  subscription {
    onMessage {
      text
      user {
        name
      }
    }
  }
`;
