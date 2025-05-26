import React from "react";

interface ProfileAvatarProps {
  firstName: string;
  lastName: string;
  profileImage?: string;
  size?: "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  firstName,
  lastName,
  profileImage,
  size = "md",
  onClick,
}) => {
  // Générer les initiales
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  // Générer une couleur de fond basée sur le nom (pour la consistance)
  const stringToThemeColor = (str: string) => {
    // Utiliser les couleurs de notre thème naturel
    const themeColors = [
      "#8A9A5B", // vert sauge
      "#A67B5B", // brun
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
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-2xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-offwhite font-medium cursor-pointer overflow-hidden`}
      style={{ backgroundColor: bgColor }}
      onClick={onClick}
      title={`${firstName} ${lastName}`}
    >
      {profileImage ? (
        <img
          src={profileImage}
          alt={`${firstName} ${lastName}`}
          className="w-full h-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
};

export default ProfileAvatar;
