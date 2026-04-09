import { inngest } from "./client";
import { supabase } from "../lib/supabase";

/**
 * This function polls the iAquaLink API every minute.
 * It fetches the current status of the pool equipment and stores it in Supabase.
 */
export const pollIAquaLink = (inngest as any).createFunction(
  { 
    id: "poll-iaqualink-data", 
    name: "Poll iAquaLink Data",
    triggers: [{ cron: "* * * * *" }]
  },
  async ({ step }: any) => {
    const data = await step.run("fetch-iaqualink-status", async () => {
      // In a real implementation, you would use the user's encrypted credentials
      // from Supabase to authenticate with the iAquaLink API.
      // For now, we simulate the API response.
      
      // const response = await fetch('https://api.iaqualink.net/v1/devices/...');
      // const status = await response.json();
      
      return {
        pump_rpm: 2450 + Math.floor(Math.random() * 100),
        water_temp: 82 + (Math.random() > 0.5 ? 0.1 : -0.1),
        air_temp: 74,
        heater_status: "on",
        ph: 7.4,
        orp: 620,
        timestamp: new Date().toISOString(),
      };
    });

    await step.run("update-supabase-telemetry", async () => {
      const { error } = await supabase
        .from("telemetry")
        .insert([
          {
            pump_speed: data.pump_rpm,
            heater_temp: data.water_temp,
            air_temp: data.air_temp,
            ph: data.ph,
            orp: data.orp,
            status_flags: { heater: data.heater_status },
            created_at: data.timestamp,
          },
        ]);

      if (error) {
        console.error("Error updating Supabase:", error);
        throw error;
      }
      
      return { success: true };
    });

    return { message: "Telemetry updated successfully" };
  }
);
