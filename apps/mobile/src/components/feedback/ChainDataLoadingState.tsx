import { View } from "react-native";

import { spacing } from "../../theme";
import { LoadingBlock, SurfaceCard } from "../primitives";

export const ChainDataLoadingState = () => {
  return (
    <SurfaceCard>
      <View style={{ gap: spacing[3] }}>
        <LoadingBlock height={14} width="35%" />
        <LoadingBlock height={28} width="60%" />
        <LoadingBlock height={14} width="90%" />
        <LoadingBlock height={14} width="75%" />
      </View>
    </SurfaceCard>
  );
};
