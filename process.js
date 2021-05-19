// Helper library written for useful postprocessing tasks with Flat Data
// Has helper functions for manipulating csv, txt, json, excel, zip, and image files
import { readJSON, writeJSON } from "https://deno.land/x/flat@0.0.10/mod.ts";

const filename = Deno.args[0];
const json = await readJSON(filename);

// Step 2: Filter specific data we want to keep and write to a new JSON file
const metrics = Object.keys(json); // convert property values into an array

const metricArray = metrics.map((metric) => ({
  metric: metric,
  value: json[metric],
}));

metricArray.push({ metric: "timestamp", value: new Date() });

console.log(metricArray);

// Step 3. Write a new JSON file with our filtered data
const newFilename = `data-postprocessed.json`; // name of a new file to be saved
await writeJSON(newFilename, metricArray); // create a new JSON file with just the Bitcoin price
console.log("Wrote a post process file");
