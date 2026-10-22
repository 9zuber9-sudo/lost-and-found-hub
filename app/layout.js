import { Nunito_Sans, Fraunces, Caveat } from "next/font/google";
import "./globals.css";
import AnimatedBackground from "../components/AnimatedBackground";
import Navbar from "../components/Navbar";
import AuthProvider from "../components/AuthProvider";

// Three fonts with a friendly feel:
// body = Nunito Sans (easy to read), display = Fraunces (soft serif for headings), hand = Caveat (small handwritten notes)
const body = Nunito_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const hand = Caveat({ subsets: ["latin"], variable: "--font-hand", display: "swap" });

export const metadata = {
  title: "Campus Lost & Found",
  description: "Post lost and found items on campus, search them, and get things back to their owners.",
};

// Runs before the page paints so the saved theme (light/dark) shows without a flash
const themeScript = `try{var t=localStorage.getItem("lf-theme");if(t){document.documentElement.setAttribute("data-theme",t)}}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} ${hand.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AnimatedBackground />
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
