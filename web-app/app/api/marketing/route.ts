import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper: convert "" → null
const normalize = (value: any) =>
  value === "" || value === undefined || value === null ? null : value;

// -------------------------
// GET — Lists or List Members
// -------------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const listid = searchParams.get("listid");

    // Get customers in a list
    if (listid) {
      const { data, error } = await supabase
        .from("customeremaillist")
        .select("customerid, customer:customerid ( custname, email )")
        .eq("listid", listid);

      if (error) throw error;

      const customers = data.map((row: any) => ({
        customerid: row.customerid,
        custname: row.customer.custname,
        email: row.customer.email,
      }));

      return NextResponse.json(customers);
    }

    // Get all lists with counts
    const { data, error } = await supabase
      .from("emaillist")
      .select(
        `listid, listtitle, createddate,
         customeremaillist(count)`
      )
      .order("listid", { ascending: true });

    if (error) throw error;

    const lists = data.map((row: any) => ({
      listid: row.listid,
      listtitle: row.listtitle,
      createddate: row.createddate,
      count: row.customeremaillist?.[0]?.count ?? 0,
    }));

    return NextResponse.json(lists);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// -------------------------
// POST — Create custom list via SQL function
// -------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const listTitle = body.listtitle; // CORRECT FIELD

    // Normalize UI values: "" → null
    const lastPurchase = normalize(body.lastPurchaseBefore);
    const minSpent = normalize(body.minSpent);
    const hasReturned = normalize(body.hasReturned);
    const category = normalize(body.category);

    // Call SQL function
    const { data, error } = await supabase.rpc("create_custom_emaillist", {
      in_listtitle: listTitle,
      in_last_purchase_before: lastPurchase,
      in_min_spent: minSpent,
      in_has_returned: hasReturned,
      in_category: category,
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      listid: data.listid,            // CORRECT FIELD NAME
      count: data.matched_count,      // CORRECT FIELD NAME
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// -------------------------
// DELETE — Remove list
// -------------------------
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const listid = searchParams.get("listid");

    if (!listid) {
      return NextResponse.json({ error: "Missing listid" }, { status: 400 });
    }

    const { error } = await supabase
      .from("emaillist")
      .delete()
      .eq("listid", listid);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}