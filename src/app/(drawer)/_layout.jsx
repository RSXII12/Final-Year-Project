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

      {/* hidden dynamic route */}
      <Drawer.Screen
        name="[name]"
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />
    </Drawer>
  );
}
