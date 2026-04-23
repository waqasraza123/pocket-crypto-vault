import { View, type StyleProp, type ViewStyle } from "react-native";

import { colors } from "../../theme";

export interface DividerProps {
  style?: StyleProp<ViewStyle>;
}

export const Divider = ({ style }: DividerProps) => {
  return <View style={[{ height: 1, width: "100%", backgroundColor: colors.border }, style]} />;
};
