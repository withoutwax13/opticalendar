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
  const { user_id, schedule_data, id } = body;
  if (!user_id) {
    return NextResponse.json(
      { error: "Missing user_id in request body" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.from("Schedule").insert([
    {
      user_id: user_id,
      schedule_data: schedule_data,
      id: id,
    },
  ]);

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
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const deleteType = searchParams.get("deleteType");
  if (!id || !deleteType) {
    return NextResponse.json(
      { error: "Missing id or deleteType parameter" },
      { status: 400 }
    );
  }
  if (deleteType === "single") {
    const { data, error } = await supabase
      .from("Schedule")
      .delete()
      .match({ id: id });

    if (error) {
      console.error(error.message);
      return NextResponse.json(error.message);
    } else {
      return NextResponse.json(data);
    }
  } else if (deleteType === "group") {
    // delete whole group of recurring schedules
    // column schedule_data is a json column
    // one of the keys in the json is recurringGroupId
    const { data, error } = await supabase
      .from("Schedule")
      .delete()
      .match({ "schedule_data->>recurringGroupId": id });

    if (error) {
      console.error(error.message);
      return NextResponse.json(error.message);
    } else {
      return NextResponse.json(data);
    }
  }
};
