import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";

const mPlusRounded1c = M_PLUS_Rounded_1c({
  weight: ["100", "300", "400", "500", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-m-plus-rounded-1c",
});

export const metadata: Metadata = {
  title: "生活防衛資金シミュレーター",
  description: "Freelance Lifestyle Defense Fund Simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${mPlusRounded1c.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
