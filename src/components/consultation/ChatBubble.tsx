"use client";

import React from "react";
import { Bot, User } from "lucide-react";
import FileUploadChip, { AttachedFile } from "./FileUploadChip";

export interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
  attachments?: AttachedFile[];
}

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}>
      <div className={`flex gap-3 max-w-[90%] md:max-w-[75%] lg:max-w-[65%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div
          className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full flex items-center justify-center mt-1 shadow-md ${
            isUser
              ? "bg-zinc-800 border border-zinc-700 text-zinc-300"
              : "bg-gradient-to-tr from-indigo-500 to-purple-500 border border-indigo-400/30 text-white"
          }`}
        >
          {isUser ? <User className="w-4 h-4 md:w-5 md:h-5" /> : <Bot className="w-4 h-4 md:w-5 md:h-5" />}
        </div>

        <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
          <div
            className={`px-4 py-3 md:px-5 md:py-3.5 rounded-2xl shadow-md ${
              isUser
                ? "bg-indigo-600 text-white rounded-tr-sm"
                : "glass bg-white/5 border border-white/10 text-zinc-100 rounded-tl-sm"
            }`}
          >
            <p className="text-[14px] md:text-[15px] leading-relaxed whitespace-pre-wrap">{message.text}</p>

            {/* Attachments inside bubble */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-3 pt-2 border-t border-white/10 flex flex-wrap gap-2">
                {message.attachments.map((file) => (
                  <FileUploadChip key={file.id} file={file} readOnly={true} />
                ))}
              </div>
            )}
          </div>
          <span className="text-[10px] md:text-[11px] text-zinc-500 mt-1.5 font-medium px-1">{message.time}</span>
        </div>
      </div>
    </div>
  );
}
