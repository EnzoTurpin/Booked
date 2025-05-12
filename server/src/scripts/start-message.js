const chalk = require("chalk");
const figlet = require("figlet");

// Fonction pour créer une bordure
const createBorder = (length = 60, char = "=") => {
  return char.repeat(length);
};

// Fonction pour centrer le texte
const centerText = (text, width = 60) => {
  const spaces = Math.max(0, Math.floor((width - text.length) / 2));
  return " ".repeat(spaces) + text;
};

// Affichage du logo
console.log("\n");
console.log(
  chalk.green(
    figlet.textSync("BOOKED", {
      font: "Standard",
      horizontalLayout: "fitted",
      width: 80,
    })
  )
);

// Informations sur l'application
console.log("\n");
console.log(chalk.cyan(createBorder()));
console.log(chalk.white(centerText("SYSTÈME DE GESTION DE RENDEZ-VOUS")));
console.log(chalk.cyan(createBorder()));
console.log("\n");

// Informations de démarrage
const date = new Date();
console.log(
  chalk.yellow("📅 Date : ") + chalk.white(date.toLocaleDateString())
);
console.log(
  chalk.yellow("⏰ Heure : ") + chalk.white(date.toLocaleTimeString())
);
console.log(
  chalk.yellow("🔧 Environnement : ") +
    chalk.white(process.env.NODE_ENV || "development")
);
console.log("\n");

// URLs d'accès
console.log(chalk.magenta(createBorder(60, "-")));
console.log(chalk.green("🌐 CLIENT : ") + chalk.white("http://localhost:3000"));
console.log(chalk.green("🚀 API    : ") + chalk.white("http://localhost:5000"));
console.log(chalk.magenta(createBorder(60, "-")));
console.log("\n");

// Message de démarrage
console.log(chalk.cyan(centerText("Démarrage des services...")));
console.log("\n");
