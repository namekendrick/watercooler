"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateRoom } from "@/features/daily/api/use-create-room";

export default function Home() {
  const { mutate: createRoom, isPending } = useCreateRoom();
  const [name, setName] = useState("");

  const handleCreateRoom = () => {
    createRoom({ name });
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Animated color blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute top-40 right-20 w-[28rem] h-[28rem] bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-[float_8s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute bottom-32 left-108 w-[32rem] h-[32rem] bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-[float_7s_ease-in-out_infinite_0.5s]"></div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 backdrop-blur-sm bg-white/30 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl w-full px-6">
          <div className="text-center space-y-16">
            <div className="space-y-4">
              <h1 className="text-8xl md:text-[10rem] font-black text-gray-900 tracking-tight leading-none">
                watercooler
              </h1>
              <p className="text-3xl text-gray-600 font-light max-w-lg mx-auto">
                A new icebreaker question every day
              </p>
            </div>
            <div className="w-24 h-px bg-gray-400 mx-auto"></div>
            <div className="max-w-lg mx-auto">
              <div className="relative flex items-center bg-white/80 backdrop-blur-sm rounded-md shadow-lg">
                <Input
                  placeholder="Enter your name"
                  className="px-4 shadow-none border-none"
                  disabled={isPending}
                  onChange={(e) => setName(e.target.value)}
                />
                <Button
                  onClick={handleCreateRoom}
                  className="px-8 py-8 rounded-l-none text-base"
                  disabled={isPending}
                >
                  Create room
                </Button>
              </div>
              <p className="text-base font-light text-gray-600 mt-2">
                Create a room and share the link with your team.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0px, 0px) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }
      `}</style>
    </div>
  );
}
