import React, { Component } from "react";
import Loader from "react-dots-loader";
import "react-dots-loader/index.css";

import "./App.css";
import Icon from "./images/favicon.png";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      messages: [],
      input: "",
      persona: "Socrates",
      style: "default",
      isiPhone: false,
      inputFocused: false,
      chatbotMessageStyles: {},
      waitingForResponse: false,
    };

    this.initialInnerHeight = window.innerHeight;
    // Bind sendMessage function to component instance
    this.sendMessage = this.sendMessage.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        loading: false,
        messages: [
          ...this.state.messages,
          {
            sender: "bot",
            message: "Hi. I am Clare, your StreetSmarts ChatBot",
          },
          {
            sender: "bot",
            message:
              "I answer questions based on interesting startup articles and frameworks collected by the Houghton Street Ventures team over the last eight years. I hope this helps those looking to start and scale a venture-backed business.",
          },
        ],
      });
    }, 1000);

    this.detectIphone();
    window.addEventListener("resize", this.updateChatbotMessageStyles);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateChatbotMessageStyles);
  }

  detectIphone() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes("iphone")) {
      this.setState({ isIphone: true });
    }
  }

  updateChatbotMessageStyles = () => {
    var self = this;
    setTimeout(function () {
      var innerHeight = window.innerHeight;
      var keyboardHeight = self.initialInnerHeight - innerHeight;
      var keyboardHeightString = keyboardHeight + "px";
      if (self.state.isIphone) {
        self.setState({
          chatbotMessageStyles: {
            height: keyboardHeightString,
            paddingTop: keyboardHeightString,
          },
        });
      }
    }, 500);
  };

  updateStyle = (style) => {
    this.setState({
      style: style,
    });
  };

  updatePersona = (persona) => {
    this.setState({
      persona: persona,
    });
  };

  handleChange = (e) => {
    let inputValue = e.target.value;
    let inputColor = "white";
    if (inputValue.startsWith("/")) {
      inputColor = "rgb(255, 154, 236)";
    }
    this.setState({ input: inputValue, inputColor: inputColor });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    // Add user message to messages list
    this.setState(
      {
        messages: [
          ...this.state.messages,
          {
            sender: "user",
            message: this.state.input,
          },
        ],
      },
      () => {
        // Send message to API
        this.sendMessage();
      }
    );
    console.log(this.state.messages, "message");
  };

  handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      this.handleSubmit(e);
    }
  };

  async sendMessage() {
    var messages = this.state.messages;

    this.setState({ input: "", waitingForResponse: true });

    const res = await fetch("https://askadamapi.houghtonstreet.com/ask", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: this.state.input,
      }),
    });
    console.log(messages);
    console.log(this.state.input);

    const data = await res.json();
    console.log(data, "Server Response");

    var newMessages = [...this.state.messages];
    newMessages.push({
      sender: "bot",
      message: data.response,
    });
    console.log(newMessages, "new");

    this.setState({
      messages: newMessages,
      waitingForResponse: false,
    });
  }

  render() {
    return (
      <div className="chatbot-container">
        <div className="title">
          <h2>StreetSmarts ChatBot</h2>
          <img src={Icon} alt="icon" width="50px" />
        </div>

        <div
          className="chatbot-messages"
          style={this.state.chatbotMessageStyles}
        >
          {this.state.loading ? (
            <Loader size={10} color="#e4512a" />
          ) : (
            this.state.messages.map((message, index) => (
              <div key={index}>
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      message.sender === "bot" ? "flex-start" : "flex-end",
                    alignItems: "baseline",
                  }}
                >
                  <div
                    className={`chatbot-message ${message.sender}`}
                    ref={(el) => {
                      if (index === this.state.messages.length - 1 && el) {
                        this.messagesEnd = el;
                        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    {message.type && message.type === "source" ? (
                      <div>
                        {"For more information see: "}
                        <a
                          href={message.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {message.title}
                        </a>
                      </div>
                    ) : (
                      message.message
                    )}
                  </div>
                </div>

                {index === this.state.messages.length - 1 &&
                  (this.state.waitingForResponse ? (
                    <Loader size={10} color="#e4512a" />
                  ) : (
                    <form onSubmit={this.handleSubmit}>
                      <input
                        value={this.state.input}
                        onChange={this.handleChange}
                        onKeyDown={this.handleKeyDown}
                        placeholder="Type here"
                      />
                      <button type="submit">Done</button>
                    </form>
                  ))}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
}

export default App;
