"use client";
import Head from 'next/head';
import { useRouter } from "next/router";
import { useSocket } from '@/context/SocketContext';
import { Inter } from "next/font/google";
import Form from "../components/Forms";
import { useEffect, useState } from "react";
const inter = Inter({ subsets: ["latin"] });
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  showMessage,
  clearMessage,
  selectMessage,
  selectMessageType,
} from "@/store/reducers/notificationSlice";
import { Socket } from "socket.io-client";
import { useUser } from '@/context/UserContext';

export default function Home() {
  const dispatch = useDispatch();
  const {socket} = useSocket();
  const message = useSelector(selectMessage);
  const messageType = useSelector(selectMessageType);

  const {totalUsers, setTotalUsers} = useUser();

  useEffect(() => {
    socket.on("userIsJoined",(data)=>{
      if (data.success) {
        localStorage.setItem("totalUsers", JSON.stringify(data.users));
        setTotalUsers(data.users);
    socket.on("UserJoinedMessageBroadcast",(data:any)=>{
      console.log("Joined",data);
      setTimeout(() => {
        dispatch(showMessage({ message: `${data} joined the room`, messageType: 'info' }));
      }, 3000);
    })
      }
      else{
        console.log("User couldn't join");
      }
    });

    socket.on("allUsers",(data)=>{  
        setTotalUsers(data);
    })

    // socket.on("UserJoinedMessageBroadcast",(data:any)=>{
    //   console.log("Joined",data);
    //   setTimeout(() => {
    //     dispatch(showMessage({ message: `${data} joined the room`, messageType: 'info' }));
    //   }, 2000);
    // })
    socket.on("UserLeftMessageBroadcast",(data:any)=>{
      console.log("Left",data);
      dispatch(showMessage({ message: `${data} left the room`, messageType: 'info' }));
    })
  }, [])
  

  const showToastMessage = (message: any, messageType: any) => {
    switch (messageType) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "warning":
        toast.warning(message);
        break;
      default:
        toast.info(message);
    }
  };

  useEffect(() => {
    if (message) {
      showToastMessage(message, messageType);
      dispatch(clearMessage());
    }
  }, [message, messageType, dispatch]);

  return (
    <>
      <Head>
        <title>WhiteWave | Real-Time WhiteBoard Sharing App</title>
        <meta name="description" content="Enjoy a sleek UI, robust chat system, and a variety of drawing options including pen, line, and shapes. Customize your drawings with thickness and color controls, and collaborate in real-time with multiple users. Features like undo/redo and real-time sharing make WhiteWave the ultimate tool for seamless teamwork." />
        <link rel="icon" href="./favicon.ico" />
      </Head>
    <div
      className="h-[100svh] flex justify-center items-center"
      style={{ background: "linear-gradient(24deg, #141e30, #243b55)" }}
    >
      <div className="absolute z-50">
      <ToastContainer position="top-right"/>
      </div>
      <div className="bg-white md:p-36 rounded-3xl mx-5">
        <Form />
      </div>
    </div>
      </>
  );
}
