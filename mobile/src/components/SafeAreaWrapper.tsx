import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const StyledSafeAreaView = styled(SafeAreaView);

/**
 * Un composant wrapper qui garantit que le contenu est affiché en toute sécurité,
 * en évitant les encoches, Dynamic Island et autres zones sensibles des appareils.
 */
const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  className = "",
}) => {
  return (
    <StyledSafeAreaView
      edges={["top", "left", "right"]}
      className={`flex-1 bg-beige ${className}`}
    >
      {children}
    </StyledSafeAreaView>
  );
};

export default SafeAreaWrapper;
