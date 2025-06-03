const chalk = require("chalk");

console.log("\n");
console.log(chalk.magenta("🌟 BOOKED - CLIENT"));
console.log(chalk.cyan("==============================="));
console.log(chalk.yellow("📱 Interface utilisateur démarrée !"));
console.log(
  chalk.green("✅ Accessible sur: ") + chalk.white("http://localhost:3000")
);
console.log(chalk.blue("⏱️  Démarré à: " + new Date().toLocaleTimeString()));
console.log(chalk.cyan("==============================="));
console.log("\n");
