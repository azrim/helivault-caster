import { Metadata } from "next";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const host = headers().get('host');
  const protocol = host?.startsWith('localhost') ? 'http' : 'https';
  const appUrl = `${protocol}://${host}`;

  const imageUrl = `${appUrl}/images/initial.svg`;
  const postUrl = `${appUrl}/api/claim`;

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
