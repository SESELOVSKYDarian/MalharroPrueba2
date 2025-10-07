// src/app/layout.js
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "../../malharrooficial/css/bootstrap.min.css";
import "../../malharrooficial/css/styles.css";
import "../../malharrooficial/css/paginainicio.css";
import "../../malharrooficial/css/3prueba-design-system.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter" });

export const metadata = {
  title: "EAV Martín Malharro",
  description: "Frontend Next.js + Strapi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.variable}`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
