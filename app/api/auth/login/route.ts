import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  })
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Authentication service unavailable" },
        {
          status: 503,
          headers: corsHeaders,
        },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { email, password } = await request.json()

    // Authenticate user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        {
          status: 400,
          headers: corsHeaders,
        },
      )
    }

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (userError) {
      return NextResponse.json(
        { error: "User profile not found" },
        {
          status: 404,
          headers: corsHeaders,
        },
      )
    }

    return NextResponse.json(
      {
        user: userData,
        token: authData.user.id,
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Login failed" },
      {
        status: 500,
        headers: corsHeaders,
      },
    )
  }
}
