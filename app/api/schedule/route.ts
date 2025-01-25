import { NextResponse } from "next/server";
import supabase from "../../../services/supabaseClient";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id");

  if (!userId) {
    return NextResponse.json(
      { error: "Missing id parameter" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("Schedule")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error(error.message);
    return NextResponse.json({ error: error.message }, { status: 404 });
  } else {
    return NextResponse.json(data);
  }
};

export const POST = async (req: Request) => {
  const body = await req.json();
  const { data, error } = await supabase.from("Schedule").insert([body]);

  if (error) {
    console.error(error.message);
    return NextResponse.json(error.message);
  } else {
    return NextResponse.json(data);
  }
};

export const PATCH = async (req: Request) => {
  // request body
  // id: id of the schedule
  // schedule_data: new schedule data
  const { id, schedule_data } = await req.json();
  const { data, error } = await supabase
    .from("Schedule")
    .update({ schedule_data: schedule_data })
    .eq("id", id)
    .select();

  if (error) {
    console.error(error.message);
    return NextResponse.json(error.message);
  } else {
    // returns updated schedule data
    // but not updating the database in supabase
    return NextResponse.json(data);
  }
};

export const DELETE = async (req: Request) => {
  const { id } = await req.json();
  const { data, error } = await supabase
    .from("Schedule")
    .delete()
    .match({ id });

  if (error) {
    console.error(error.message);
    return NextResponse.json(error.message);
  } else {
    return NextResponse.json(data);
  }
};
