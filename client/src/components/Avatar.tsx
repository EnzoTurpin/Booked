import React from "react";

interface AvatarProps {
  firstName: string;
  lastName: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  firstName,
  lastName,
  size = "md",
  onClick,
}) => {
  // Générer les initiales
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  // Générer une couleur en alternant entre les teintes de notre thème
  const stringToThemeColor = (str: string) => {
    // Utiliser les couleurs de notre thème naturel
    const themeColors = [
      "#A8B9A3", // vert sauge
      "#8C6E5D", // brun doux
    ];

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Sélectionner une couleur de notre thème
    const colorIndex = Math.abs(hash) % themeColors.length;
    return themeColors[colorIndex];
  };

  const bgColor = stringToThemeColor(`${firstName}${lastName}`);

  // Déterminer la taille
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-offwhite font-medium cursor-pointer`}
      style={{ backgroundColor: bgColor }}
      onClick={onClick}
      title={`${firstName} ${lastName}`}
    >
      {initials}
    </div>
  );
};

export default Avatar;
