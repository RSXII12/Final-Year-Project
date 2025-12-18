import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  return (
    <Drawer>
      <Drawer.Screen
        name="index"
        options={{ title: "Home" }}
      />

      <Drawer.Screen
        name="workout-calendar"
        options={{ title: "Workout Calendar" }}
      />

      <Drawer.Screen
        name="[name]"
        options={{ title: "Profile" }}
      />
    </Drawer>
  );
}
