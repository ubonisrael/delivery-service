import { useEffect, useRef, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalculateDistanceFee } from "../../components/fee-form";
import { useSocket } from "@/context/socketContext";

const messageSchema = z
  .object({
    message: z
      .string()
      .min(1, { message: "Message must contain at least one character" }),
  })
  .required();

export default function Page() {
  const { chatId, user, setUser, chatName, members, type } =
    useLoaderData() as {
      chatId: string;
      chatName: string;
      user: any;
      setUser: (obj: any) => void;
      members: any[];
      type: string;
    };
  const { socket } = useSocket();

  const [messages, setMessages] = useState<any>([]);
  const [message, setMessage] = useState("");
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message,
    },
  });
  const scroll = useRef<HTMLSpanElement | null>(null);
  const navigate = useNavigate();

  function onSubmit(values: z.infer<typeof messageSchema>) {
    if (values.message.trim()) {
      const msg = { ...values, chatRoom: chatId };

      socket.emit("send_message", msg);
      form.reset();
    }
  }

  const handleMemberClick = async (memberId: string) => {
    // create a new chat with member
    socket.emit("create_private_chat", { memberId }, async (response) => {
      // check if chat exists
      const chatExists = user.chats.find((chat) => chat._id === response._id);
      if (!chatExists) {
        // if it doesn't exist update user state
        setUser((prev) => ({
          ...prev,
          chats: [
            ...prev.chats,
            { name: response.name, type: response.type, _id: response._id },
          ],
        }));
      }
      // navigate(`/chat/${response.name}`);
    });
  };

  useEffect(() => {
    socket.emit("join_room", chatId, (response) => {
      setMessages(response.messages);
    });

    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("join_room");
      socket.off("receive_message");
    };
  }, [chatId]);

  useEffect(() => {
    if (scroll && scroll.current) {
      scroll.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="w-full">
      <div className="relative w-full h-full">
        <h1 className="font-semibold text-lg p-2 uppercase">
          {chatName.replace(/_/g, " ")}
        </h1>
        <div className="w-full h-[560px] grid grid-cols-[5fr_2fr] gap-1 bg-black/5">
          <div className="w-full h-full">
            <div className="w-full h-[492px] overflow-y-auto flex flex-col gap-4 p-2">
              {messages.length ? (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`${
                      msg.sender._id === user._id
                        ? "bg-green-50 self-end"
                        : "bg-blue-50"
                    } w-[300px] p-2 border rounded`}
                  >
                    <p className="text-xs font-medium">
                      {msg.sender._id === user._id ? (
                        "you"
                      ) : (
                        <>{msg.sender.name}</>
                      )}
                    </p>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                ))
              ) : (
                <p>There are no messages in this chat.</p>
              )}
              <span ref={scroll}></span>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full grid grid-cols-[9fr_1fr] gap-2 p-4 bg-slate-200"
              >
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Enter your message"
                          {...field}
                          className="bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="cursor-pointer">
                  Send
                </Button>
              </form>
            </Form>
          </div>
          <div className="w-full h-full overflow-y-auto">
            {type === "general" ? (
              <>
                <p className="text-sm italic">
                  Click on a member to start a private conversation
                </p>
                <ul className="w-full flex flex-col gap-2">
                  {members
                    .filter((member) => member._id != user._id)
                    .map((member, index) => (
                      <li
                        key={index}
                        onClick={() => handleMemberClick(member._id)}
                        className="w-full bg-white p-2 border rounded flex justify-between items-center cursor-pointer"
                      >
                        <p className="text-xs font-medium">
                          <span>{member.name}</span> ||{" "}
                          <span>{member.role}</span>
                        </p>
                      </li>
                    ))}
                </ul>
              </>
            ) : (
              <CalculateDistanceFee
                location={(() => {
                  const m = members
                    .filter((member) => member._id != user._id)
                    .map((member) => member.location.coordinates)[0];
                  return { longitude: m[0], latitude: m[1] };
                })()}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
