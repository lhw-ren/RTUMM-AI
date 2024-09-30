const math = require('mathjs');

module.exports = {
  name: "math",
  description: "Solve math equations and perform calculations.",
  prefixRequired: false,  // No need the prefix
  adminOnly: false,      // Set to false so everyone can use it
  async execute(api, event, args) {
    try {
      if (!args.length) {
        return api.sendMessage("Please provide a math equation to solve.", event.threadID);
      }

      const equation = args.join(" ");
      let result;

      try {
        result = math.evaluate(equation);
      } catch (err) {
        return api.sendMessage("Invalid math expression.", event.threadID);
      }

      return api.sendMessage(`The result of \`${equation}\` is: ${result}`, event.threadID);
    } catch (err) {
      console.error(err);
      return api.sendMessage("An error occurred while solving the math equation.", event.threadID);
    }
  }
};
