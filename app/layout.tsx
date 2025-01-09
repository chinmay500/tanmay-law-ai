// app/layout.tsx
import type { Metadata } from "next";
import { Work_Sans, Source_Code_Pro } from "next/font/google";
import "./globals.css";

const workSans = Work_Sans({
    subsets: ["latin"],
    variable: "--font-work-sans",
    display: "swap",
    adjustFontFallback: true,
});

const sourceCode = Source_Code_Pro({
    subsets: ["latin"],
    variable: "--font-source-code",
    display: "swap",
    adjustFontFallback: true,
});

export const metadata: Metadata = {
    title: "Indian Law Assistant",
    description: "Your AI-powered legal assistant for Indian law queries",
    keywords: ["Indian law", "legal assistant", "AI", "law bot"],
    authors: [{ name: "Your Name" }],
    viewport: "width=device-width, initial-scale=1",
    themeColor: "#ffffff",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${workSans.variable} ${sourceCode.variable} font-sans antialiased`}
            >
                {children}
            </body>
        </html>
    );
}