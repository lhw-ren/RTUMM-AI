const { createCanvas } = require('canvas');
const ChartJS = require('chart.js');
const fs = require('fs');
const math = require('mathjs');  // For evaluating math expressions

module.exports = {
  name: "graph",
  description: "Plot a graph for a given equation.",
  prefixRequired: true,
  adminOnly: false,
  async execute(api, event, args) {
    try {
      // Get the equation from user input
      const equation = args.join(" ");
      if (!equation) {
        return api.sendMessage("Please provide an equation to plot.", event.threadID);
      }

      // Define X-axis values (you can change this based on the desired range)
      let xValues = Array.from({ length: 100 }, (_, i) => i - 50); // X from -50 to 49

      // Calculate Y-values for each X based on the equation
      let yValues;
      try {
        yValues = xValues.map(x => math.evaluate(equation, { x }));
      } catch (err) {
        return api.sendMessage("Invalid equation. Please check your input.", event.threadID);
      }

      // Create canvas for the chart
      const width = 800;  // Width of the image
      const height = 600; // Height of the image
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Plot the graph using chart.js
      const myChart = new ChartJS(ctx, {
        type: 'line',
        data: {
          labels: xValues,  // X-axis points
          datasets: [{
            label: `Graph of: ${equation}`,
            data: yValues,  // Y-axis points calculated from equation
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
            },
            y: {
              beginAtZero: false
            }
          }
        }
      });

      // Save the canvas to a file
      const buffer = canvas.toBuffer('image/png');
      const imagePath = 'graph.png';  // Define temporary file path
      fs.writeFileSync(imagePath, buffer);

      // Send the image to the user
      api.sendMessage({ attachment: fs.createReadStream(imagePath) }, event.threadID, () => {
        // Delete the file after sending it
        fs.unlinkSync(imagePath);
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("An error occurred while plotting the graph.", event.threadID);
    }
  }
};
