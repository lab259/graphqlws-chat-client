import React, { Component } from "react";
import Input from "reactstrap/lib/Input";
import Form from "reactstrap/lib/Form";
import FormGroup from "reactstrap/lib/FormGroup";
import Label from "reactstrap/lib/Label";
import FormText from "reactstrap/lib/FormText";
import { STORAGE } from "./constants";
import SendMessageMutation, {
  SEND_MESSAGE,
  SendMessageMutationFn
} from "./mutations/SendMessage";
import MessageList from "./MessageList";
import { ApolloProvider, ApolloConsumer } from "react-apollo";

interface ChatState {
  ready: boolean;
  user: string;
  message: string;
}

export default class Chat extends Component<{}, ChatState> {
  messageInput: React.RefObject<HTMLInputElement>;

  constructor(props: any) {
    super(props);

    this.state = {
      ready: false,
      user: localStorage.getItem(STORAGE.CURRENT_USER) || "",
      message: ""
    };

    this.messageInput = React.createRef();
  }

  handleSend = (mutate: SendMessageMutationFn) => (event: React.FormEvent) => {
    event.preventDefault();

    mutate()
      .then(
        () => {
          this.setState(() => ({
            message: ""
          }));
        },
        reason => {
          console.error(reason);
        }
      )
      .then(() => {
        if (this.messageInput.current) {
          this.messageInput.current.focus();
        }
      });
  };

  handleReady = (event: React.FormEvent) => {
    event.preventDefault();

    const { user } = this.state;

    if (user.length < 6) {
      return;
    }

    localStorage.setItem(STORAGE.CURRENT_USER, user);
    this.setState(() => ({
      ready: true
    }));
  };

  handleInputChange = (key: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target;

    this.setState(prev => ({
      ...prev,
      [key]: value
    }));
  };

  render() {
    const { ready, user, message } = this.state;

    if (!ready) {
      return (
        <Form onSubmit={this.handleReady}>
          <FormGroup>
            <Label for="name">Identify yourself</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter your name"
              value={user}
              onChange={this.handleInputChange("user")}
              autoFocus
            />
            <FormText>At least 6 characters</FormText>
          </FormGroup>
        </Form>
      );
    }

    return (
      <div className="chat-wrapper">
        <ApolloConsumer>
          {client => <MessageList key={user} client={client} />}
        </ApolloConsumer>

        <SendMessageMutation
          mutation={SEND_MESSAGE}
          variables={{ user, text: message }}
        >
          {(mutate, { loading }) => (
            <Form onSubmit={this.handleSend(mutate)}>
              <Input
                id="message"
                name="message"
                placeholder="Enter message"
                disabled={loading}
                value={message}
                onChange={this.handleInputChange("message")}
                innerRef={this.messageInput}
                autoFocus
              />
            </Form>
          )}
        </SendMessageMutation>
      </div>
    );
  }
}
