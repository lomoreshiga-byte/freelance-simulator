import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";

const mPlusRounded1c = M_PLUS_Rounded_1c({
  weight: ["100", "300", "400", "500", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-m-plus-rounded-1c",
});

export const metadata: Metadata = {
  title: "のこるくん | 個人事業主の為の手取りシミュレーター",
  description: "全業種対応の個人事業主専用手取りシミュレーター。税金・社保を引いた「本当に残るお金」を即座に計算します。",
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
