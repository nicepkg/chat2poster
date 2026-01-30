import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chat2Poster - Turn AI chats into share-worthy posters",
  description:
    "Convert your AI conversations from ChatGPT, Claude, and Gemini into beautiful, shareable images.",
  keywords: ["AI", "ChatGPT", "Claude", "Gemini", "poster", "export", "image"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
