import { NextResponse, type NextRequest } from "next/server";
import { criarSupabaseServerClient } from "@/services/supabaseServerClient";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const proximo = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await criarSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${proximo}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?erro=falha_autenticacao`);
}
