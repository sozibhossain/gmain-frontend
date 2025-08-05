"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { io, type Socket } from "socket.io-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, MoreHorizontal, Edit2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import PageHeader from "@/components/sheard/PageHeader";

interface User {
  _id: string;
  name: string;
  role: string;
  avatar: {
    public_id: string;
    url: string;
  };
}

interface Message {
  _id: string;
  text: string;
  user: User | string;
  read: boolean;
  date: string;
}

interface Chat {
  _id: string;
  name: string;
  farm: string;
  user: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar: {
    public_id: string;
    url: string;
  };
}

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

export default function MessagesPage() {
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesScrollAreaRef = useRef<HTMLDivElement>(null);

  const token = session?.accessToken;

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesScrollAreaRef.current) {
      const scrollContainer = messagesScrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // Fetch current user profile
  const fetchUserProfile = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${BASE_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Initialize socket connection
  useEffect(() => {
    if (token) {
      socketRef.current = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
        transports: ["websocket"],
      });

      socketRef.current.on("connect", () => {
        console.log("Connected to socket server");
      });

      socketRef.current.on("newMassage", (message: Message) => {
        setSelectedChat((prev) => {
          if (prev) {
            const updatedChat = {
              ...prev,
              messages: [...prev.messages, message],
            };
            return updatedChat;
          }
          return prev;
        });

        // Update chat list with new message
        setChats((prev) =>
          prev.map((chat) => {
            if (chat._id === selectedChat?._id) {
              return {
                ...chat,
                messages: [message],
              };
            }
            return chat;
          })
        );
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [token, selectedChat?._id]);

  // Join chat room when selecting a chat
  useEffect(() => {
    if (selectedChat && socketRef.current) {
      socketRef.current.emit("joinChatRoom", selectedChat._id);
    }
  }, [selectedChat]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (selectedChat?.messages.length) {
      // Use setTimeout to ensure the DOM has updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [selectedChat?.messages]);

  // Fetch user chats
  const fetchChats = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${BASE_URL}/chat/get-chat`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setChats(data.data);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Failed to fetch chats");
    } finally {
      setLoading(false);
    }
  };

  // Fetch single chat details
  const fetchChatDetails = async (chatId: string) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${BASE_URL}/chat/get-single-chat/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setSelectedChat(data.data);
      }
    } catch (error) {
      console.error("Error fetching chat details:", error);
      toast.error("Failed to fetch chat details");
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !token) return;

    try {
      const response = await fetch(`${BASE_URL}/chat/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: selectedChat._id,
          message: newMessage,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage("");
        // Message will be updated via socket
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  // Update message
  const updateMessage = async (messageId: string) => {
    if (!editText.trim() || !selectedChat || !token) return;

    try {
      const response = await fetch(`${BASE_URL}/chat/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: selectedChat._id,
          messageId,
          newText: editText,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setEditingMessage(null);
        setEditText("");
        // Update local state
        setSelectedChat((prev) => {
          if (prev) {
            return {
              ...prev,
              messages: prev.messages.map((msg) =>
                msg._id === messageId ? { ...msg, text: editText } : msg
              ),
            };
          }
          return prev;
        });
        toast.success("Message updated successfully");
      }
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Failed to update message");
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile();
      fetchChats();
    }
  }, [token]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isCurrentUser = (message: Message) => {
    const userId =
      typeof message.user === "string" ? message.user : message.user._id;
    return userId === currentUser?._id;
  };

  const getMessageUser = (message: Message) => {
    return typeof message.user === "string" ? null : message.user;
  };

  const getAvatarUrl = (user: User | null) => {
    if (user?.avatar?.url) {
      return user.avatar.url;
    }
    return "/placeholder.svg?height=40&width=40";
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile();
      fetchChats();
    }
  }, [token]);

  // Auto-select first chat when chats are loaded
  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      const firstChat = chats[0];
      setSelectedChat(firstChat);
      fetchChatDetails(firstChat._id);
    }
  }, [chats, selectedChat, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        image="/asset/messgeHeader.png"
        title="Stay Connected With Your Favorite Farms"
        gradientColor="0, 115, 2"
        gradientOpacity={0.2}
      />

      <div className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-8 gap-4">
          {/* Chat List Sidebar */}
          <div className="col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search Message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="divide-y divide-gray-100">
                {filteredChats.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => {
                      setSelectedChat(chat);
                      fetchChatDetails(chat._id);
                    }}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedChat?._id === chat._id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="/placeholder.svg?height=48&width=48" />
                        <AvatarFallback className="bg-green-500 text-white">
                          {chat.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {chat.name}
                          </h3>
                          {chat.messages.length > 0 && (
                            <span className="text-xs text-gray-500">
                              {formatTime(
                                chat.messages[chat.messages.length - 1].date
                              )}
                            </span>
                          )}
                        </div>
                        {chat.messages.length > 0 && (
                          <p className="text-sm text-gray-500 truncate">
                            {chat.messages[chat.messages.length - 1].text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="col-span-6 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden max-h-[800px]">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-white border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      <AvatarFallback className="bg-green-500 text-white">
                        {selectedChat.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedChat.name}
                      </h2>
                      <p className="text-sm text-gray-500">Farm</p>
                    </div>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full" ref={messagesScrollAreaRef}>
                    <div className="p-4 space-y-4">
                      {selectedChat.messages.map((message) => {
                        const messageUser = getMessageUser(message);
                        const isOwn = isCurrentUser(message);

                        return (
                          <div
                            key={message._id}
                            className={`flex ${
                              isOwn ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwn
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-200 text-gray-900"
                              }`}
                            >
                              {!isOwn && messageUser && (
                                <div className="flex items-center space-x-2 mb-1">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={
                                        getAvatarUrl(messageUser) ||
                                        "/placeholder.svg"
                                      }
                                    />
                                    <AvatarFallback className="bg-blue-500 text-white text-xs">
                                      {messageUser.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <p className="text-xs font-medium">
                                    {messageUser.name}
                                  </p>
                                </div>
                              )}

                              {editingMessage === message._id ? (
                                <div className="space-y-2">
                                  <Input
                                    value={editText}
                                    onChange={(e) =>
                                      setEditText(e.target.value)
                                    }
                                    className="text-sm"
                                  />
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      onClick={() => updateMessage(message._id)}
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingMessage(null);
                                        setEditText("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm">{message.text}</p>
                                  <div className="flex items-center justify-between mt-1">
                                    <span
                                      className={`text-xs ${
                                        isOwn
                                          ? "text-green-100"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {formatTime(message.date)}
                                    </span>

                                    {isOwn && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-green-100 hover:text-white"
                                          >
                                            <MoreHorizontal className="h-3 w-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            onClick={() => {
                                              setEditingMessage(message._id);
                                              setEditText(message.text);
                                            }}
                                          >
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            Edit
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your message"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          sendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a chat from the sidebar to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
