import { GraphQLClient } from "graphql-request";
import { storage } from "./utils/storage";

const API_URL = "https://final-year-project-production-aa7c.up.railway.app/graphql";

export default async function getClient() {
  const token = await storage.getItem("token");

  return new GraphQLClient(API_URL, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}
