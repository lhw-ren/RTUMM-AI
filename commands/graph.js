const { createCanvas } = require('canvas');
const Chart = require('chart.js');
const fs = require('fs');
const path = require('path');
const math = require('mathjs');

module.exports = {
  name: "graph",
  description: "Plot a graph from a math equation.",
  prefixRequired: false,
  adminOnly: false,
  async execute(api, event, args) {
    if (!args.length) {
      return api.sendMessage("Please provide a math equation to graph.", event.threadID);
    }

    const equation = args.join(" ");
    const width = 800;  // Graph width
    const height = 600;  // Graph height
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    try {
      // Evaluate the equation over a range of x-values
      const xValues = Array.from({ length: 101 }, (_, i) => i - 50);  // x values from -50 to 50
      const yValues = xValues.map(x => {
        try {
          return math.evaluate(equation, { x });
        } catch (err) {
          return NaN;
        }
      });

      // Set up the chart
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: xValues,
          datasets: [{
            label: `Graph of ${equation}`,
            data: yValues,
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: false
          }]
        },
        options: {
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              title: {
                display: true,
                text: 'x'
              }
            },
            y: {
              title: {
                display: true,
                text: 'y'
              }
            }
          }
        }
      });

      // Save the graph to a file
      const graphPath = path.join(__dirname, "cache", `${Date.now()}_graph.png`);
      const out = fs.createWriteStream(graphPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      out.on('finish', () => {
        api.sendMessage({
          body: `Here's the graph of \`${equation}\`:`,
          attachment: fs.createReadStream(graphPath)
        }, event.threadID, () => {
          fs.unlinkSync(graphPath);  // Clean up the file after sending
        });
      });

    } catch (err) {
      console.error(err);
      return api.sendMessage("An error occurred while plotting the graph.", event.threadID);
    }
  }
};
