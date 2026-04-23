import { NextRequest, NextResponse } from "next/server";

// /api/webhook/stripe

export async function POST(request: Request){
    void request
    return NextResponse.json({ error: 'Billing is disabled' }, { status: 410 })

    return NextResponse.json({message: 'Hello, world!'})
}