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
        { error: "Registration service unavailable" },
        {
          status: 503,
          headers: corsHeaders,
        },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { email, password, alias, anonymousId } = await request.json()

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
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

    // Create user profile in users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email,
        username: alias,
        display_name: alias,
        anonymous_id: anonymousId,
      })
      .select()
      .single()

    if (userError) {
      return NextResponse.json(
        { error: userError.message },
        {
          status: 400,
          headers: corsHeaders,
        },
      )
    }

    // Generate session token
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    })

    return NextResponse.json(
      {
        user: userData,
        token: authData.user.id,
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Registration failed" },
      {
        status: 500,
        headers: corsHeaders,
      },
    )
  }
}
