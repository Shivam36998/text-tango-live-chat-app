/** @format */

import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatContainer from "./ChatContainer";
import ChatSidebar from "./ChatSidebar";
import { getChatsLink, backendhost } from "../../../apiconfig";
import ChatWelcome from "./ChatWelcome";
import AddUser from "./AddUser";
import { io } from "socket.io-client";

export default function ChatPage({ userId }) {
  const [isAddUser, setIsAddUser] = useState(false);
  const [newUser, setNewUser] = useState(); // data coming from AddUser component
  const [singleUser, setSingleUser] = useState();
  const [allChat, setAllChat] = useState();

  // GET REQUEST FROM GET CHATS LINK API

  useEffect(() => {
    const getAllChats = (userId) => {
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };
      fetch(`${getChatsLink}/${userId}`, options)
        .then((response) => response.json())
        .then((data) => {
          console.log("ChatPage: all chats => ", data.user);
          setAllChat(data);
        })
        .catch((error) => console.log(error));
    };

    // userId is coming from Login component
    console.log(userId);
    userId && getAllChats(userId);
  }, [userId, newUser]);

  let socket;
  // useEffect(()=> {
    socket = (io(backendhost));
  // }, [])
  if (allChat) {
    socket.emit("setup", userId);
  }
  socket.on("recieveMessage", payload => {
    alert("ram ram")
  });
  socket.on("connected", onlineUsers=>{
    console.log(onlineUsers)
  })


  return (
    <Wrapper>
      <div className="ChatPage">
        <div className="ChatSidebar">
          <ChatSidebar
            setIsAddUser={setIsAddUser}
            newUser={newUser}
            setSingleUser={setSingleUser}
            userId={userId}
            allChat={allChat}
          />
        </div>
        <div className="ChatContainer">
          {isAddUser === false && <ChatWelcome />}
          {isAddUser === true && (
            <AddUser
              setIsAddUser={setIsAddUser}
              setNewUser={setNewUser}
              userId={userId}
            />
          )}
          {isAddUser === null && (
            <ChatContainer
              newUser={newUser}
              singleUser={singleUser}
              userId={userId}
            />
          )}
        </div>
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  .ChatPage {
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: space-between;
    .ChatSidebar {
      width: 35%;
      border-radius: 0 1vw 1vw 0;
      /* border: 2px solid black; */
    }
    .ChatContainer {
      flex: 1;
      border-radius: 1vw 0 0 1vw;
      /* border: 2px solid black; */
    }
  }
`;
