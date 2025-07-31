import { NextRequest, NextResponse } from 'next/server';
import { NeynarAPIClient, isApiErrorResponse, Configuration } from "@neynar/nodejs-sdk";
import { createKysely } from '@vercel/postgres';
import { ethers } from 'ethers';

interface Database {
    faucet_claims: {
        id: number;
        fid: number;
        last_claimed_at: Date;
    };
}

const db = createKysely<Database>({
    connectionString: process.env.STORAGE_URL,
});

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || '';
const FAUCET_PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY || '';
const HELIOS_RPC_URL = process.env.HELIOS_RPC_URL || '';
const APP_URL = process.env.VERCEL_URL || 'http://localhost:3000';

const COOLDOWN_PERIOD_HOURS = 6;

export async function POST(req: NextRequest) {
    const neynarClient = new NeynarAPIClient(new Configuration({apiKey: NEYNAR_API_KEY}));
    const body = await req.json();

    try {
        const { action } = await neynarClient.validateFrameAction(body.trustedData.messageBytes);

        if (!action) {
            return new NextResponse(getFrameHtml({
                imageUrl: `${APP_URL}/images/error.svg`,
                message: "Invalid frame action"
            }), { status: 400 });
        }

        const { fid } = action.interactor;

        // 1. Check cooldown
        const result = await db
            .selectFrom('faucet_claims')
            .select('last_claimed_at')
            .where('fid', '=', fid)
            .executeTakeFirst();

        if (result) {
            const lastClaimedAt = new Date(result.last_claimed_at);
            const cooldownEndTime = new Date(lastClaimedAt.getTime() + COOLDOWN_PERIOD_HOURS * 60 * 60 * 1000);

            if (new Date() < cooldownEndTime) {
                return new NextResponse(getFrameHtml({
                    imageUrl: `${APP_URL}/images/cooldown.svg`,
                    message: `You have already claimed. Try again after ${cooldownEndTime.toLocaleTimeString()}.`
                }), { status: 200 });
            }
        }

        // 2. Get user's wallet address
        const userResponse = await neynarClient.fetchBulkUsers({ fids: [fid] });
        const user = userResponse.users[0];
        const recipientAddress = user?.verified_addresses.eth_addresses[0];

        if (!recipientAddress) {
            return new NextResponse(getFrameHtml({
                imageUrl: `${APP_URL}/images/error.svg`,
                message: "No verified wallet address found for your Farcaster account."
            }), { status: 200 });
        }

        // 3. Send HLS
        const provider = new ethers.JsonRpcProvider(HELIOS_RPC_URL);
        const wallet = new ethers.Wallet(FAUCET_PRIVATE_KEY, provider);
        const amount = ethers.parseEther("0.5");

        const tx = await wallet.sendTransaction({
            to: recipientAddress,
            value: amount,
        });

        await tx.wait();

        // 4. Update database
        await db
            .insertInto('faucet_claims')
            .values({ fid, last_claimed_at: new Date() })
            .onConflict((oc) => oc
                .column('fid')
                .doUpdateSet({ last_claimed_at: new Date() })
            )
            .execute();

        // 5. Return success frame
        return new NextResponse(getFrameHtml({
            imageUrl: `${APP_URL}/images/success.svg`,
            message: `Successfully sent 0.5 HLS!`,
            buttonText: "View Transaction",
            buttonLink: `https://explorer.helioschainlabs.org/tx/${tx.hash}`
        }), { status: 200 });

    } catch (error) {
        console.error(error);
        let message = "An error occurred.";
        if (isApiErrorResponse(error)) {
            message = error.response.data.message;
        }
        return new NextResponse(getFrameHtml({
            imageUrl: `${APP_URL}/images/error.svg`,
            message: message
        }), { status: 500 });
    }
}

function getFrameHtml(options: {
    imageUrl: string;
    message: string;
    buttonText?: string;
    buttonLink?: string;
}) {
    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${options.imageUrl}" />
            <meta property="og:image" content="${options.imageUrl}" />
            <meta property="fc:frame:post_url" content="${APP_URL}/api/claim" />
    `;

    if (options.buttonText && options.buttonLink) {
        html += `
            <meta property="fc:frame:button:1" content="${options.buttonText}" />
            <meta property="fc:frame:button:1:action" content="link" />
            <meta property="fc:frame:button:1:target" content="${options.buttonLink}" />
        `;
    } else {
        html += `
            <meta property="fc:frame:button:1" content="Try Again" />
        `;
    }

    html += `
        </head>
        <body>
            <p>${options.message}</p>
        </body>
        </html>
    `;
    return html;
}
