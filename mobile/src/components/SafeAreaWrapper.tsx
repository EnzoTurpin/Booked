import React, { useMemo } from "react";
import { StyleSheet, View, Platform } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { styled } from "nativewind";

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
  bottomTabBarHeight?: number;
}

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);

/**
 * Un composant wrapper qui garantit que le contenu est affiché en toute sécurité,
 * en évitant les encoches, Dynamic Island et autres zones sensibles des appareils.
 * Ajoute un espace en bas pour éviter que le contenu ne soit caché par la barre de navigation.
 */
const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  className = "",
  bottomTabBarHeight = 50, // Hauteur par défaut pour la barre de navigation en bas
}) => {
  const insets = useSafeAreaInsets();

  // Mémoriser la hauteur totale pour éviter des recalculs inutiles
  const totalBottomHeight = useMemo(() => {
    const bottomInset = Platform.OS === "ios" ? insets.bottom : 0;
    return bottomTabBarHeight + (bottomInset > 0 ? 20 : 0);
  }, [insets.bottom, bottomTabBarHeight]);

  return (
    <StyledSafeAreaView
      edges={["top", "left", "right"]}
      className={`flex-1 bg-beige ${className}`}
    >
      <StyledView className="flex-1">{children}</StyledView>

      {/* Espace supplémentaire en bas pour éviter que le contenu ne soit caché par la barre de navigation */}
      <StyledView style={{ height: totalBottomHeight }} />
    </StyledSafeAreaView>
  );
};

export default SafeAreaWrapper;
