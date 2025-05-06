'use server'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil',
})

export async function createCheckoutSession(credits: number){
    const {userId} = await auth()
    if(!userId){
        throw new Error('Unauthorized')
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: "inr",
                product_data: {
                    name: `${credits} code credits`
                },
                unit_amount: Math.round((credits / 1) * 100) //cost of credit in paisa, 1Rs = 400 credits 
            },
            quantity: 1
        }],
        customer_creation: 'always',
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/create`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
        client_reference_id: userId.toString(),
        // In your createCheckoutSession function
        metadata: {
            credits: credits.toString() // Ensure this matches what your webhook expects
        }//keeping track of how many they bought 
    })

    return redirect(session.url!)
}