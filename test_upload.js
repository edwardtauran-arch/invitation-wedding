const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const filename = `${Date.now()}_test.txt`;
  const { data, error } = await supabase.storage
    .from("wedding-assets")
    .upload(filename, Buffer.from("hello"), {
      contentType: "text/plain",
      upsert: true,
    });

  console.log("Upload result:", data, error);

  if (data) {
    const { data: publicUrlData } = supabase.storage
      .from("wedding-assets")
      .getPublicUrl(filename);
    console.log("Public URL:", publicUrlData);
  }
}

run();
