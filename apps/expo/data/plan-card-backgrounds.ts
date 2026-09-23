/* eslint-disable @typescript-eslint/no-var-requires */
import type { ImageSourcePropType } from "react-native";

import type { PlanCategory } from "./android-reward";

// Static requires must stay in source code so Metro can bundle the assets.
export const PLAN_CARD_BACKGROUNDS: Record<PlanCategory, ImageSourcePropType> = {
  focus: require("../assets/images/card-backgrounds/concentracion-r.png") as ImageSourcePropType,
  exercise: require("../assets/images/card-backgrounds/outside-r.png") as ImageSourcePropType,
  sleep: require("../assets/images/card-backgrounds/sueno-r.png") as ImageSourcePropType,
  meditation: require("../assets/images/card-backgrounds/outside-r.png") as ImageSourcePropType,
  hobby: require("../assets/images/card-backgrounds/lectura-r.png") as ImageSourcePropType,
  work: require("../assets/images/card-backgrounds/concentracion-r.png") as ImageSourcePropType,
};
