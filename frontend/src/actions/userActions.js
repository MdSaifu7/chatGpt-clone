import React from "react";
import axios from "../api/axiosConfig";
async function registerUser(userData) {
  try {
    const response = await axios.post("/api/auth/register", userData);
    console.log(response);

    return response.data.user;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
}

async function loginUser(credentials) {
  try {
    const response = await axios.post("/api/auth/login", credentials);
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}

async function createChat(title) {
  try {
    const response = await axios.post("/api/chat", { title });
    return response.data.chat;
  } catch (error) {
    console.error("Chat creation failed:", error);
    throw error;
  }
}

async function getMessage(chatId) {
  try {
    const response = await axios.get(`/api/chat/messages/${chatId}`);
    console.log("Messages fetched: ", response.data);
    return response.data.allChats;
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    throw error;
  }
}

async function getChat() {
  try {
    const response = await axios.get(`/api/chat/getchat`);
    console.log("Chats fetched: ", response.data);
    return response.data.allChats;
  } catch (error) {
    console.error("Failed to fetch chats:", error);
    throw error;
  }
}

async function deleteChat(chatId) {
  try {
    // const response =
    await axios.post("/api/chat/delete", { chatId });
    // return response.data.chat;
  } catch (error) {
    console.error("Chat deletion failed:", error);
    throw error;
  }
}

export { registerUser, loginUser, createChat, deleteChat, getMessage, getChat };
