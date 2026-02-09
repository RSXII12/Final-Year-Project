import { Drawer } from "expo-router/drawer";
import { DrawerToggleButton } from "@react-navigation/drawer";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerLeft: () => <DrawerToggleButton />,
      }}
    >
      <Drawer.Screen
        name="workout-calendar"
        options={{
          title: "Workout Calendar",
        }}
      />

      <Drawer.Screen
        name="PlanCreator"
        options={{
          title: "Workout & Nutrition Planning",
        }}
      />

      {/* Exercise details (hidden from drawer list) */}
      <Drawer.Screen
        name="exercise/[id]"
        options={{
          title: "Exercise",
          drawerItemStyle: { display: "none" },
          headerLeft: () => null, // allow default back button instead of drawer toggle on exercise details screen
        }}
      />

    </Drawer>
  );
}
