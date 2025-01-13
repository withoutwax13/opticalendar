import { NextResponse } from "next/server";
import supabase from "../../../services/supabaseClient";

export const GET = async () => {
  const { data, error } = await supabase.from("Schedule").select("*");

  if (error) {
    console.error(error.message);
    return NextResponse.json(error.message);
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

export const PUT = async (req: Request) => {
  const { data, error } = await supabase
    .from("Schedule")
    .update(req.body)
    .match({ id: req.body.id });

  if (error) {
    console.error(error.message);
    return NextResponse.json(error.message);
  } else {
    return NextResponse.json(data);
  }
};

export const DELETE = async (req: Request) => {
  const { data, error } = await supabase
    .from("Schedule")
    .delete()
    .match({ id: req.body.id });

  if (error) {
    console.error(error.message);
    return NextResponse.json(error.message);
  } else {
    return NextResponse.json(data);
  }
};