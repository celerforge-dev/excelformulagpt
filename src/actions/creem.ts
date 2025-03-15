"use server";

import { db } from "@/db/config";
import { products } from "@/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { env } from "~/env";

// Function to get products from the database
export async function getProducts() {
  const storedProducts = await db.select().from(products);
  return storedProducts;
}

// Function to sync products from the API to the database
export async function syncProducts() {
  // Fetch products from the API
  const response = await fetch(
    `${env.NEXT_PUBLIC_CREEM_BASE_URL}/v1/products/search`,
    {
      headers: {
        "x-api-key": env.CREEM_API_KEY,
      },
    },
  );

  const productData = await response.json();

  // Process and store each product in the database with only the essential fields
  for (const product of productData["items"]) {
    await db
      .insert(products)
      .values({
        id: product.id,
        name: product.name,
        price: product.price,
      })
      .onConflictDoUpdate({
        target: products.id,
        set: {
          name: product.name,
          price: product.price,
        },
      });
  }

  // Revalidate the pricing page to reflect the updated data
  revalidatePath("/pricing");

  // Return the products from the database to ensure we're using the same data
  return await getProducts();
}

// Function to get checkout URL for a product
export async function getProductCheckoutURL(productId: string) {
  const session = await auth();

  if (!session?.user) {
    return undefined;
  }
  console.log(
    JSON.stringify({
      product_id: productId,
      request_id: uuidv4(),
      customer: {
        email: session.user.email,
      },
      success_url: `${env.NEXT_PUBLIC_APP_URL}/?checkout=true`,
    }),
  );

  // Create a checkout URL for the product
  const response = await fetch(
    `${env.NEXT_PUBLIC_CREEM_BASE_URL}/v1/checkouts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.CREEM_API_KEY,
      },
      body: JSON.stringify({
        product_id: productId,
        request_id: uuidv4(),
        customer: {
          email: session.user.email,
        },
        success_url: `${env.NEXT_PUBLIC_APP_URL}/?checkout=true`,
      }),
    },
  );

  if (!response.ok) {
    console.error("Failed to create checkout session", await response.text());
    return undefined;
  }

  const data = await response.json();
  return data.checkout_url;
}
