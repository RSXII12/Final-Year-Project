import { Stack } from "expo-router";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { AuthProvider } from "../context/AuthContext";

const client = new QueryClient();

export default function RootLayout() {
  return (
    <AuthProvider>
      <QueryClientProvider client={client}>
        <Stack>
          <Stack.Screen name="index" options={{ title: "Exercises" }} />
        </Stack>
      </QueryClientProvider>
    </AuthProvider>
  );
}
