import { GraphQLClient } from "graphql-request";
import { storage } from "./utils/storage";

const API_URL = "https://distinguished-serenity-production.up.railway.app/graphql";

let client;

export default function getClient() {
  if (!client) {
    client = new GraphQLClient(API_URL, {
      credentials: "include",
      headers: async () => {
        const token = await storage.getItem("token");
        return {
          Authorization: token ? `Bearer ${token}` : "",
        };
      },
    });
  }

  return client;
}
