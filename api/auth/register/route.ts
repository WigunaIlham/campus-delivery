import {NextRequest, NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const {email, password, full_name, phone, role} = await request.json();

    const {data: authData, error: authError} = await supabaseServer.auth.signUp(
      {
        email,
        password,
      }
    );

    if (authError) {
      return NextResponse.json({error: authError.message}, {status: 400});
    }

    if (authData.user) {
      const {error: profileError} = await supabaseServer
        .from("profiles")
        .insert([
          {
            id: authData.user.id,
            role,
            full_name,
            phone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      if (profileError) {
        await supabaseServer.auth.admin.deleteUser(authData.user.id);

        return NextResponse.json({error: profileError.message}, {status: 400});
      }

      if (role === "kurir") {
        await supabaseServer.from("courier_locations").insert([
          {
            courier_id: authData.user.id,
            coordinates: [0, 0],
            is_available: true,
            last_updated: new Date().toISOString(),
          },
        ]);
      }

      return NextResponse.json({success: true});
    }

    return NextResponse.json({error: "Registration failed"}, {status: 400});
  } catch (error: any) {
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
