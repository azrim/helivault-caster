# Helios Faucet Configuration and Deployment Guide

The codebase for the Helios Faucet Farcaster Mini App is complete. Follow these steps to configure and deploy the application.

---

### **1. Configure Environment Variables**

You need to create a `.env.local` file in the root of the `helios-faucet` project to run it locally. This file will contain the necessary secrets.

1.  **Create the file:**
    ```bash
    touch .env.local
    ```

2.  **Add the following content to `.env.local`**, replacing the placeholder values with your actual secrets:
    ```
    # Your secret key from a wallet funded with Helios testnet tokens
    FAUCET_PRIVATE_KEY="YOUR_HELIOS_WALLET_PRIVATE_KEY"

    # The RPC endpoint for the Helios testnet
    HELIOS_RPC_URL="https://testnet1.helioschainlabs.org"

    # Your API key from neynar.com
    NEYNAR_API_KEY="YOUR_NEYNAR_API_KEY"

    # The connection string for your Vercel Postgres database
    POSTGRES_URL="YOUR_VERCEL_POSTGRES_CONNECTION_STRING"
    ```

---

### **2. Set Up the Database**

The application requires a table in a Vercel Postgres database to track faucet claims and enforce cooldown periods.

1.  **Navigate to your Vercel project's dashboard.**
2.  Go to the **Storage** tab and create or connect a Postgres database.
3.  Go to the **Query** tab within the database interface.
4.  **Execute the following SQL command** to create the `faucet_claims` table:
    ```sql
    CREATE TABLE faucet_claims (
        id SERIAL PRIMARY KEY,
        fid INTEGER NOT NULL UNIQUE,
        last_claimed_at TIMESTAMP NOT NULL
    );
    ```

---

### **3. Deploy to Vercel**

1.  **Push your code to a GitHub repository.**
2.  **Create a new project on Vercel** and connect it to your GitHub repository.
3.  **Configure Environment Variables in Vercel:**
    *   In your Vercel project settings, navigate to the **Environment Variables** tab.
    *   Add the same key-value pairs as in your `.env.local` file. Vercel will automatically add the `POSTGRES_` variables when you connect the database.
    *   You also need to add one more variable for the frame's post URL to work correctly:
        *   `VERCEL_URL`: Set this to the URL of your Vercel deployment (e.g., `my-faucet.vercel.app`).

4.  **Trigger a deployment.** Vercel will automatically build and deploy your application.

Once deployed, you can test the faucet by pasting your application's URL into a Farcaster client like Warpcast.
