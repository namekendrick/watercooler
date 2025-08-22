import { Nunito } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/providers";

import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
});

export const metadata = {
  title: "Virtual Watercooler | Daily icebreaker questions for your team",
  description: "Daily icebreaker questions for your team",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${nunito.className} antialiased`}>
        <Providers>{children}</Providers>
        <Toaster richColors />
      </body>
    </html>
  );
}
