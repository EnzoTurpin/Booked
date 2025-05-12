const chalk = require("chalk");

console.log("\n");
console.log(chalk.yellow("🔧 BOOKED - SERVEUR API"));
console.log(chalk.cyan("==============================="));
console.log(chalk.green("🚀 Serveur API démarré !"));
console.log(
  chalk.blue("✅ Accessible sur: ") + chalk.white("http://localhost:5000")
);
console.log(chalk.magenta("🔌 Base de données connectée"));
console.log(chalk.red("⏱️  Démarré à: " + new Date().toLocaleTimeString()));
console.log(chalk.cyan("==============================="));
console.log("\n");
