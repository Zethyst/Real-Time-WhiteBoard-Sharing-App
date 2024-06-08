"use client";
import Image from "next/image";
import { useRouter } from "next/router";
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

export default function Home() {
  const dispatch = useDispatch();
  const message = useSelector(selectMessage);
  const messageType = useSelector(selectMessageType);

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
    <div
      className="h-[100vh] flex justify-center items-center"
      style={{ background: "linear-gradient(24deg, #141e30, #243b55)" }}
    >
        <ToastContainer/>
      <div className="bg-white p-36 rounded-3xl">
        <Form />
      </div>
    </div>
  );
}
