import { GraphQLClient } from "graphql-request";
import { storage } from "./utils/storage";
import Constants from "expo-constants";

// 🔥 Auto-detect LAN IP from Expo
let LAN_IP = null;

try {
  const host = Constants.expoConfig?.hostUri;
  if (host) {
    LAN_IP = host.split(":")[0];  // extracts 192.168.x.x
  }
} catch (e) {
  console.log("Failed to auto-detect LAN IP:", e);
}

// Fallback if LAN_IP isn't available (rare)
const API_URL = LAN_IP
  ? `http://${LAN_IP}:4000/graphql`
  : "http://10.0.2.2:4000/graphql";   // emulator fallback

console.log("📡 API Using:", API_URL);

export default async function getClient() {
  const token = await storage.getItem("token");

  console.log("GRAPHQL CLIENT TOKEN:", token);

  return new GraphQLClient(API_URL, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}
