import multer from "multer";
import path from "path";
import fs from "fs";

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, "../../uploads");
const profileImagesDir = path.join(uploadsDir, "profile");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(profileImagesDir)) {
  fs.mkdirSync(profileImagesDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profileImagesDir);
  },
  filename: function (req, file, cb) {
    // Générer un nom unique : timestamp + userId (si disponible) + extension
    const userId = (req as any).userId || "user";
    const uniqueSuffix = Date.now() + "-" + userId;
    const fileExt = path.extname(file.originalname);
    cb(null, uniqueSuffix + fileExt);
  },
});

// Filtrer les types de fichiers acceptés
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    // Accepter le fichier
    cb(null, true);
  } else {
    // Rejeter le fichier
    cb(
      new Error(
        "Format de fichier non supporté. Veuillez utiliser JPEG, PNG, ou WebP."
      )
    );
  }
};

// Création du middleware multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB en octets
  },
});

// Export du middleware
export const profileImageUpload = upload.single("profileImage");

// Fonction pour obtenir l'URL d'une image de profil
export const getProfileImageUrl = (filename: string): string => {
  return `${
    process.env.SERVER_URL || "http://localhost:5000"
  }/uploads/profile/${filename}`;
};

// Fonction pour obtenir le chemin absolu d'une image de profil
export const getProfileImagePath = (filename: string): string => {
  return path.join(profileImagesDir, filename);
};

// Fonction pour supprimer une image de profil
export const deleteProfileImage = (filename: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const imagePath = getProfileImagePath(filename);
    fs.unlink(imagePath, (err) => {
      if (err) {
        // Si l'erreur est que le fichier n'existe pas, on considère que c'est OK
        if (err.code === "ENOENT") {
          resolve();
        } else {
          reject(err);
        }
      } else {
        resolve();
      }
    });
  });
};
