import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const WEBHOOK_SECRET = process.env.COINBASE_WEBHOOK_SECRET || "whsec_your_webhook_secret_here"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-cc-webhook-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    // Verify webhook signature
    const expectedSignature = crypto.createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex")

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)

    // Handle different webhook events
    switch (event.type) {
      case "charge:confirmed":
        console.log("Payment confirmed:", event.data)
        // Notify extension of confirmed payment
        break
      case "charge:failed":
        console.log("Payment failed:", event.data)
        break
      case "charge:delayed":
        console.log("Payment delayed:", event.data)
        break
      default:
        console.log("Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
