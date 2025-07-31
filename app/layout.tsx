import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Helios Faucet",
  description: "A Farcaster frame to claim HLS tokens.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
