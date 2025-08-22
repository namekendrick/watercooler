"use client";

import Image from "next/image";
import Link from "next/link";
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
    <div className="h-full relative bg-[#f7edd9]">
      <Image
        src="/images/watercoolerbg.png"
        alt=""
        className="object-contain hidden sm:block"
        fill
      />

      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="text-xl font-bold">
          watercooler.
        </Link>
      </div>

      <div className="relative z-10 h-full min-h-screen flex flex-col items-center justify-center px-4 sm:hidden">
        <div className="text-center space-y-8">
          <h1 className="max-w-xs mx-auto text-3xl font-black bg-gradient-to-r from-[#3c599d] to-blue-300 bg-clip-text text-transparent tracking-tighter leading-none">
            A new icebreaker question every day.
          </h1>
          <div className="w-full max-w-sm mx-auto">
            <div className="relative flex items-center bg-white/20 backdrop-blur-md rounded-xl shadow-xl border border-white/30 h-16 py-2">
              <Input
                placeholder="Enter your name"
                className="px-4 py-4 shadow-none border-none font-bold bg-transparent placeholder:text-gray-600 text-lg"
                disabled={isPending}
                onChange={(e) => setName(e.target.value)}
              />
              <Button
                onClick={handleCreateRoom}
                className="px-6 py-4 h-full bg-gradient-to-r from-[#3c599d] to-blue-400 hover:from-[#3c599d] hover:to-blue-500 text-white rounded-xl mr-2 text-base font-bold transition-all duration-200"
                disabled={isPending}
              >
                Create Room
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 h-full min-h-screen hidden sm:block">
        <div className="max-w-2xl mx-auto pt-20 md:pt-32 pb-8 text-center px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-[#3c599d] to-blue-300 bg-clip-text text-transparent tracking-tighter leading-none">
            A new icebreaker question every day.
          </h1>
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-4 mt-60">
          <div className="w-full max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white/20 backdrop-blur-md rounded-xl shadow-xl border border-white/30 h-16 sm:h-20 py-2">
              <Input
                placeholder="Enter your name"
                className="px-4 sm:px-6 py-4 shadow-none border-none font-bold bg-transparent placeholder:text-gray-600 text-base sm:text-xl"
                style={{ fontSize: "1.25rem" }}
                disabled={isPending}
                onChange={(e) => setName(e.target.value)}
              />
              <Button
                onClick={handleCreateRoom}
                className="px-6 sm:px-8 py-4 h-full bg-gradient-to-r from-[#3c599d] to-blue-400 hover:from-[#3c599d] hover:to-blue-500 text-white rounded-xl mr-2 text-base sm:text-xl font-bold transition-all duration-200"
                disabled={isPending}
              >
                Create Room
              </Button>
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
