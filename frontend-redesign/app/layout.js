import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AnimatedBackground from "../components/AnimatedBackground";
import Navbar from "../components/Navbar";

// Load the font once; it is exposed as the CSS variable --font-jakarta
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata = {
  title: "Campus Lost & Found",
  description: "Post lost and found items on campus, search them, and get things back to their owners.",
};

// Runs before the page paints so the saved theme (light/dark) shows without a flash
const themeScript = `try{var t=localStorage.getItem("lf-theme");if(t){document.documentElement.setAttribute("data-theme",t)}}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AnimatedBackground />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
