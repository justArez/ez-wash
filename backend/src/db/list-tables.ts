import postgres from "postgres";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(import.meta.dirname, "../../.env") });

async function verify() {
  const sql = postgres(process.env.DATABASE_URL!, { prepare: false });
  try {
    await sql`ALTER TABLE loyalty_customers ADD COLUMN IF NOT EXISTS password text;`;
    console.log("✅ Column password verified/added in Supabase");

    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'loyalty_customers'
      ORDER BY ordinal_position;
    `;
    console.log(
      "LOYALTY_CUSTOMERS_COLUMNS:",
      columns.map((c: any) => `${c.column_name} (${c.data_type})`),
    );
  } catch (err: any) {
    console.error("ERROR:" + err.message);
  } finally {
    await sql.end({ timeout: 1 });
  }
}

verify();
