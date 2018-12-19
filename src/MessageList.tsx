import React, { Component } from "react";
import ApolloClient from "apollo-client";

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
  onMessage?: ZenObservable.Subscription;
  onJoin?: ZenObservable.Subscription;
  onLeft?: ZenObservable.Subscription;

  container: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);

    this.state = {
      events: [
        { type: "join", payload: { name: "Felipe" } },
        { type: "join", payload: { name: "Chico" } },
        { type: "join", payload: { name: "Marçal" } },
        {
          type: "message",
          payload: { text: "Olá, todos", user: { name: "Felipe" } }
        },
        { type: "join", payload: { name: "Jota" } },
        {
          type: "message",
          payload: { text: "Eaí, man", user: { name: "Jota" } }
        },
        { type: "join", payload: { name: "Felipe" } },
        { type: "join", payload: { name: "Chico" } },
        { type: "join", payload: { name: "Marçal" } },
        {
          type: "message",
          payload: { text: "Olá, todos", user: { name: "Felipe" } }
        },
        { type: "join", payload: { name: "Jota" } },
        {
          type: "message",
          payload: { text: "Eaí, man", user: { name: "Jota" } }
        }
      ]
    };

    this.container = React.createRef();
  }

  componentDidMount() {
    const container = this.container.current;
    if (container) {
      container.scrollTop = container.scrollHeight - container.offsetHeight;
    }
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
