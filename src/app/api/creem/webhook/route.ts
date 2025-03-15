import { db } from "@/db/config";
import { subscriptions, users } from "@/db/schema";
import * as crypto from "crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "~/env";

// Define types for webhook events
interface WebhookEvent {
  id: string;
  eventType: string;
  created_at: number;
  object: Record<string, unknown>;
}

interface CheckoutEvent extends WebhookEvent {
  object: {
    id: string;
    object: string;
    status: string;
    request_id?: string;
    order?: {
      id: string;
      customer: string;
      product: string;
      amount: number;
      currency: string;
      status: string;
      type: string;
      created_at: string;
      updated_at: string;
      mode: string;
    };
    product?: {
      id: string;
      name: string;
      description: string;
      image_url: string | null;
      price: number;
      currency: string;
      billing_type: string;
      billing_period: string;
      status: string;
      tax_mode: string;
      tax_category: string;
      default_success_url: string;
      created_at: string;
      updated_at: string;
      mode: string;
    };
    customer?: {
      id: string;
      object: string;
      email: string;
      name: string;
      country: string;
      created_at: string;
      updated_at: string;
      mode: string;
    };
    subscription?: {
      id: string;
      object: string;
      product: string;
      customer: string;
      collection_method: string;
      status: string;
      canceled_at: string | null;
      created_at: string;
      updated_at: string;
      metadata?: Record<string, string>;
      mode: string;
    };
    custom_fields: unknown[];
    metadata?: Record<string, string>;
    mode: string;
  };
}

interface SubscriptionEvent extends WebhookEvent {
  object: {
    id: string;
    object: string;
    product:
      | string
      | {
          id: string;
          name: string;
          description: string;
          image_url: string | null;
          price: number;
          currency: string;
          billing_type: string;
          billing_period: string;
          status: string;
          tax_mode: string;
          tax_category: string;
          default_success_url: string;
          created_at: string;
          updated_at: string;
          mode: string;
        };
    customer:
      | string
      | {
          id: string;
          object: string;
          email: string;
          name: string;
          country: string;
          created_at: string;
          updated_at: string;
          mode: string;
        };
    collection_method: string;
    status: string;
    last_transaction_id?: string;
    last_transaction_date?: string;
    next_transaction_date?: string;
    current_period_start_date?: string;
    current_period_end_date?: string;
    canceled_at: string | null;
    created_at: string;
    updated_at: string;
    metadata?: Record<string, string>;
    mode: string;
    items?: Array<{
      object: string;
      id: string;
      product_id: string;
      price_id: string;
      units: number;
      created_at: string;
      updated_at: string;
      mode: string;
    }>;
  };
}

function generateSignature(payload: string, secret: string): string {
  const computedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return computedSignature;
}

export async function POST(request: Request) {
  try {
    // Get the signature from the headers
    const receivedSignature = request.headers.get("x-creem-signature");
    if (!receivedSignature) {
      return NextResponse.json(
        { error: "Missing signature header" },
        { status: 401 },
      );
    }

    // Get the raw request body as text for signature verification
    const rawBody = await request.text();

    // Parse the body as JSON for processing
    const body = JSON.parse(rawBody) as WebhookEvent;

    // Generate the signature for verification
    const computedSignature = generateSignature(
      rawBody,
      env.CREEM_WEBHOOK_SECRET,
    );

    // Verify the signature
    if (receivedSignature !== computedSignature) {
      console.error("Signature verification failed");
      return NextResponse.json(
        { error: "Signature verification failed" },
        { status: 401 },
      );
    }

    // Process the webhook event based on the event type
    const eventType = body.eventType;
    console.log(`Processing webhook event: ${eventType}`);

    switch (eventType) {
      case "checkout.completed":
        // Handle successful checkout
        await handleCheckoutCompleted(body as CheckoutEvent);
        break;
      case "subscription.active":
      case "subscription.paid":
        // Handle subscription creation or payment
        await handleSubscriptionActive(body as SubscriptionEvent);
        break;
      case "subscription.update":
        // Handle subscription updates
        await handleSubscriptionUpdated(body as SubscriptionEvent);
        break;
      case "subscription.canceled":
        // Handle subscription cancellation
        await handleSubscriptionCanceled(body as SubscriptionEvent);
        break;
      case "subscription.trialing":
        // Handle subscription in trial period
        await handleSubscriptionTrialing(body as SubscriptionEvent);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Helper function to find user by customer email
async function findUserByCustomerEmail(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  return user;
}

// Handler functions for different webhook events
async function handleCheckoutCompleted(event: CheckoutEvent) {
  console.log("Checkout completed:", event);

  // If there's a subscription in the checkout event, process it
  if (event.object.subscription && event.object.customer) {
    const subscription = event.object.subscription;
    const customer = event.object.customer;
    const product = event.object.product;

    // Find the user by customer email
    const user = await findUserByCustomerEmail(customer.email);

    if (!user) {
      console.error(`No user found for customer email: ${customer.email}`);
      return;
    }

    // Store the subscription in the database
    await db
      .insert(subscriptions)
      .values({
        id: subscription.id,
        user_id: user.id,
        product_id: typeof product === "object" ? product.id : product || "",
        customer_id: customer.id,
        status: subscription.status,
        collection_method: subscription.collection_method,
        canceled_at: subscription.canceled_at
          ? new Date(subscription.canceled_at)
          : null,
        metadata: subscription.metadata || {},
        mode: subscription.mode,
      })
      .onConflictDoUpdate({
        target: subscriptions.id,
        set: {
          status: subscription.status,
          updated_at: new Date(),
        },
      });
  }
}

async function handleSubscriptionActive(event: SubscriptionEvent) {
  console.log("Subscription active/paid:", event);

  const subscription = event.object;
  const customer =
    typeof subscription.customer === "object" ? subscription.customer : null;
  const product =
    typeof subscription.product === "object" ? subscription.product : null;

  if (!customer) {
    console.error("Customer information not available in subscription event");
    return;
  }

  // Find the user by customer email
  const user = await findUserByCustomerEmail(customer.email);

  if (!user) {
    console.error(`No user found for customer email: ${customer.email}`);
    return;
  }

  // Store or update the subscription in the database
  await db
    .insert(subscriptions)
    .values({
      id: subscription.id,
      user_id: user.id,
      product_id: product ? product.id : (subscription.product as string),
      customer_id: customer.id,
      status: subscription.status,
      collection_method: subscription.collection_method,
      current_period_start: subscription.current_period_start_date
        ? new Date(subscription.current_period_start_date)
        : null,
      current_period_end: subscription.current_period_end_date
        ? new Date(subscription.current_period_end_date)
        : null,
      last_transaction_id: subscription.last_transaction_id,
      last_transaction_date: subscription.last_transaction_date
        ? new Date(subscription.last_transaction_date)
        : null,
      next_transaction_date: subscription.next_transaction_date
        ? new Date(subscription.next_transaction_date)
        : null,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at)
        : null,
      metadata: subscription.metadata || {},
      mode: subscription.mode,
    })
    .onConflictDoUpdate({
      target: subscriptions.id,
      set: {
        status: subscription.status,
        current_period_start: subscription.current_period_start_date
          ? new Date(subscription.current_period_start_date)
          : undefined,
        current_period_end: subscription.current_period_end_date
          ? new Date(subscription.current_period_end_date)
          : undefined,
        last_transaction_id: subscription.last_transaction_id,
        last_transaction_date: subscription.last_transaction_date
          ? new Date(subscription.last_transaction_date)
          : undefined,
        next_transaction_date: subscription.next_transaction_date
          ? new Date(subscription.next_transaction_date)
          : undefined,
        updated_at: new Date(),
      },
    });
}

async function handleSubscriptionUpdated(event: SubscriptionEvent) {
  console.log("Subscription updated:", event);

  const subscription = event.object;

  // Update the subscription in the database
  await db
    .update(subscriptions)
    .set({
      status: subscription.status,
      current_period_start: subscription.current_period_start_date
        ? new Date(subscription.current_period_start_date)
        : undefined,
      current_period_end: subscription.current_period_end_date
        ? new Date(subscription.current_period_end_date)
        : undefined,
      last_transaction_id: subscription.last_transaction_id,
      last_transaction_date: subscription.last_transaction_date
        ? new Date(subscription.last_transaction_date)
        : undefined,
      next_transaction_date: subscription.next_transaction_date
        ? new Date(subscription.next_transaction_date)
        : undefined,
      updated_at: new Date(),
    })
    .where(eq(subscriptions.id, subscription.id));
}

async function handleSubscriptionCanceled(event: SubscriptionEvent) {
  console.log("Subscription canceled:", event);

  const subscription = event.object;

  // Update the subscription status in the database
  await db
    .update(subscriptions)
    .set({
      status: "canceled",
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at)
        : new Date(),
      updated_at: new Date(),
    })
    .where(eq(subscriptions.id, subscription.id));
}

async function handleSubscriptionTrialing(event: SubscriptionEvent) {
  console.log("Subscription trialing:", event);

  const subscription = event.object;
  const customer =
    typeof subscription.customer === "object" ? subscription.customer : null;
  const product =
    typeof subscription.product === "object" ? subscription.product : null;

  if (!customer) {
    console.error("Customer information not available in subscription event");
    return;
  }

  // Find the user by customer email
  const user = await findUserByCustomerEmail(customer.email);

  if (!user) {
    console.error(`No user found for customer email: ${customer.email}`);
    return;
  }

  // Store or update the subscription in the database
  await db
    .insert(subscriptions)
    .values({
      id: subscription.id,
      user_id: user.id,
      product_id: product ? product.id : (subscription.product as string),
      customer_id: customer.id,
      status: "trialing",
      collection_method: subscription.collection_method,
      current_period_start: subscription.current_period_start_date
        ? new Date(subscription.current_period_start_date)
        : null,
      current_period_end: subscription.current_period_end_date
        ? new Date(subscription.current_period_end_date)
        : null,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at)
        : null,
      metadata: subscription.metadata || {},
      mode: subscription.mode,
    })
    .onConflictDoUpdate({
      target: subscriptions.id,
      set: {
        status: "trialing",
        current_period_start: subscription.current_period_start_date
          ? new Date(subscription.current_period_start_date)
          : undefined,
        current_period_end: subscription.current_period_end_date
          ? new Date(subscription.current_period_end_date)
          : undefined,
        updated_at: new Date(),
      },
    });
}
