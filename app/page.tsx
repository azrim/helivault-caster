import type { Metadata } from "next";

const APP_URL = process.env.VERCEL_URL || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const imageUrl = `${APP_URL}/images/initial.svg`;
  const postUrl = `${APP_URL}/api/claim`;

  return {
    title: "Helios Faucet",
    other: {
      "fc:frame": "vNext",
      "fc:frame:image": imageUrl,
      "fc:frame:post_url": postUrl,
      "fc:frame:button:1": "Claim 0.5 HLS",
    },
  };
}

export default function Page() {
  return (
    <div>
      <h1>Helios Faucet Frame</h1>
      <p>This page is a Farcaster frame. View it in a Farcaster client to use the faucet.</p>
    </div>
  );
}
