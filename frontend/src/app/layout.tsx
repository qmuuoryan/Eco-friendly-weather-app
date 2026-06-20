import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeatherAI Eco Agri Dashboard",
  description: "Weather intelligence for sustainable agriculture.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
