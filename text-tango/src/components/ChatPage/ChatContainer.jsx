import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { IconButton } from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { Stack, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MessageBox from "./MessageBox";
import { io } from "socket.io-client";

import {
  backendhost,
  deleteChatLink,
  deleteMessageLink,
  newChatMessageLink,
  updateChatLink,
} from "../../../apiconfig";
// import { Chat } from "@mui/icons-material";

export default function ChatContainer({ newUser, singleUser, userId }) {
  console.log("singleUser => ", singleUser.messages);
  console.log("singleUser => ", singleUser);
  const [isProfileShow, setIsProfileShow] = useState(false);
  const [isSend, setIsSend] = useState(1);
  const [msg, setMsg] = useState();

  // for empty array
  const [allMsgArray, setAllMsgArray] = useState(singleUser.messages);

  // for array of objects
  const [allMsgDataArray, setAllMsgDataArray] = useState(singleUser.messages);

  // to push msg in above array of objects
  const [allMsgObjArray, setAllMsgObjArray] = useState(
    allMsgDataArray.map(msgObj => msgObj.message)
  );

  /*   const updateChat = (newName, userId, chatId) => {
    const data = { newName, userId, chatId };
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
    fetch(updateChatLink, options)
      .then(response => response.json())
      .then(data => {
        // use your data here
        console.log(data);
      })
      .catch(error => console.log(error));
  }; */

  /*   const deleteChatMessage = (userId, chatId, messageId) => {
    const data = { userId, chatId, messageId };
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
    fetch(deleteMessageLink, options)
      .then(response => response.json())
      .then(data => {
        // use your data here
        console.log(data);
      })
      .catch(error => console.log(error));
  }; */

  // # POST REQUEST TO SEND MESSAGE
  const saveNewChatMessage = (userId, secondUserId, chatId, send, message) => {
    const data = { userId, secondUserId, chatId, send, message };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
    fetch(newChatMessageLink, options)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (msg) {
          // if singleUser.messages is empty array
          if (singleUser.messages.length === 0) {
            allMsgArray.push(msg);
            console.log("updated allMsgArray => ", allMsgArray);
          }
          // if singleUser.messages is array of objects
          else {
            allMsgObjArray.push(msg);
            console.log("updated allMsgObjArray => ", allMsgObjArray);
          }
        }
      })
      .catch(error => console.log(error));
  };

  let socket;
    socket = io(backendhost);
  const socketHandler = ( payload) => {
    socket.emit("sendMessage", payload);
  }
   socket.on("recieveMessage", (payload) => {
     alert("ram ram");
   });

  // # HANDLE SEND MESSAGE
  const handleSendMessage = e => {
    e.preventDefault();
    saveNewChatMessage(
      userId,
      singleUser.secondUserId,
      singleUser.chatId,
      isSend,
      msg
    );
    const payload = {
      text: "ram ram bhai",
      senderId: userId,
      chatId: singleUser.chatId,
      receiverId: singleUser.secondUserId,
    };
    socketHandler(payload);
    e.target.msgbox.value = "";
  };

  /*  // # DELETE REQUEST TO DELETE SINGLE CHAT
  const deleteChat = (userId, chatId) => {
    const data = { userId, chatId };
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
    fetch(deleteChatLink, options)
      .then(response => response.json())
      .then(data => {
        console.log("ChatContainer, Delete Chat", data);
      })
      .catch(error => console.log(error));
  };

  // # HANDLE DELETE SINGLE CHAT
  const handleDelete = e => {
    console.log("Clicked on delete Chat");
    deleteChat(userId, singleUser._id);
  }; */
  console.log("all msg array => ", allMsgArray);
  return (
    <Wrapper>
      <div className="ChatContainer">
        {/* header */}
        <header>
          <div className="user" onClick={() => setIsProfileShow(true)}>
            <img
              src="https://th.bing.com/th/id/OIP.Z2S76NihaMgTZl0wTxAM2wHaHa?rs=1&pid=ImgDetMain"
              alt="profile-picture"
            />
            <h1>{singleUser.name}</h1>
          </div>
          <div className="online-status">
            <div></div>
            <p>online</p>
          </div>
        </header>

        {/* popup section*/}
        <section className={isProfileShow ? "profile show-profile" : "profile"}>
          <h1>
            {/*    {singleUser.name.split(" ")[0][0].toUpperCase() +
              singleUser.name.split(" ")[0].slice(1).toLowerCase() +
              " " +
              singleUser.name.split(" ")[1][0].toUpperCase() +
              singleUser.name.split(" ")[1].slice(1).toLowerCase()} */}
            {singleUser.name}
          </h1>
          <Stack>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              startIcon={<DeleteIcon />}
              sx={{
                fontWeight: "bold",
                color: "#007aff",
                backgroundColor: "#fff",
                ":hover": {
                  backgroundColor: "#fff",
                },
              }}
            >
              Delete User
            </Button>
          </Stack>
        </section>

        {/* main */}
        <main
          className={isSend ? "msg-right" : null}
          onClick={() => setIsProfileShow(false)}
        >
          {/* for empty array in singleUser.messages */}
          {singleUser.messages.length === 0 &&
            allMsgArray.map((msg, index) => (
              <MessageBox msg={msg} isSend={isSend} key={index} />
            ))}

          {/* for array of objects in singleUser.messages */}
          {allMsgObjArray &&
            allMsgObjArray.map((msg, index) => (
              <MessageBox msg={msg} isSend={isSend} key={index} />
            ))}
        </main>

        {/* footer */}
        <footer>
          <form onSubmit={e => handleSendMessage(e)}>
            <input
              id="msgbox"
              type="text"
              placeholder="Type your message here..."
              onChange={e => setMsg(e.target.value)}
            />
            <div className="send">
              <IconButton type="submit">
                <SendRoundedIcon />
              </IconButton>
            </div>
          </form>
        </footer>
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  .ChatContainer {
    header {
      height: 15vh;
      color: #1a1a1a;
      display: flex;
      justify-content: space-between;
      background-color: #f8f9fb;
      padding: 2vw;
      border-radius: 1vw 0 0 0vw;
      box-shadow: 0.2vw 0.1vw 0.7vw #ddd;
      .user {
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 2vw;
        img {
          border-radius: 50%;
          height: 4vw;
          width: 4vw;
        }
        h1 {
          font-size: 2.5vw;
        }
      }
      .online-status {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5vw;
        div {
          height: 1vw;
          width: 1vw;
          border-radius: 50%;
          background-color: green;
        }
      }
    }
    .profile {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      color: #fff;
      border-radius: 1vw 1vw 1vw 1vw;
      background-color: #007aff;
      padding: 2vw 2vw 2vw 2vw;
      width: 30vw;
      height: 30vw;
      position: absolute;
      top: 0;
      margin-left: 0.3vw;
      transition: all ease 0.5s;
      transform: translateY(-100%);
      h1 {
        font-size: 3vw;
        text-align: center;
      }
    }
    .show-profile {
      transform: translateY(0);
    }
    main {
      height: 74vh;
      padding: 2vw;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: 1vw;
      overflow: scroll;
      overflow-x: hidden;
    }
    .msg-right {
      align-items: flex-end;
    }

    footer {
      height: 10vh;
      form {
        background-color: #ebebeb;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 1vw;
        padding: 1vw;
        input {
          background-color: transparent;
          outline: none;
          border: none;
          width: 100%;
          height: 100%;
          padding-left: 1vw;
        }
        /*         ::placeholder {
        } */
        .send {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #007aff;
          border-radius: 50%;
          svg {
            font-size: 2vw;
            color: #fff;
          }
        }
      }
    }
  }
`;
