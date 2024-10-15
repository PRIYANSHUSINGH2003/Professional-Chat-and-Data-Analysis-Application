require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { exec } = require('child_process');
const csv = require('csv-parser');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;
const KAGGLE_USERNAME = process.env.KAGGLE_USERNAME;
const KAGGLE_API_KEY = process.env.KAGGLE_API_KEY;
const DATA_DIR = './data'; // Centralized data directory path

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ dest: path.join(DATA_DIR, 'uploads') });

let dataset = [];
let datasetUrl = ''; // Default dataset URL

// Function to clear the dataset directory
const clearDataDirectory = () => {
  return new Promise((resolve, reject) => {
    fs.rm(DATA_DIR, { recursive: true, force: true }, (err) => {
      if (err) {
        console.error(`Error removing data directory: ${err.message}`);
        reject(`Error removing data directory: ${err.message}`);
        return;
      }
      fs.mkdir(DATA_DIR, { recursive: true }, (err) => {
        if (err) {
          console.error(`Error creating data directory: ${err.message}`);
          reject(`Error creating data directory: ${err.message}`);
          return;
        }
        resolve();
      });
    });
  });
};

// Function to download and process Kaggle data
const downloadAndProcessKaggleData = (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      await clearDataDirectory(); // Clear data directory before downloading

      const kaggleCmd = `kaggle datasets download -d ${url} -p ${DATA_DIR} --unzip`;
      exec(kaggleCmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error downloading Kaggle dataset: ${error.message}`);
          console.error(`stderr: ${stderr}`);
          reject(`Error downloading Kaggle dataset: ${error.message}`);
          return;
        }

        console.log(`Dataset downloaded: ${stdout}`);

        // Check the contents of the data directory
        fs.readdir(DATA_DIR, (err, files) => {
          if (err) {
            console.error(`Error reading data directory: ${err.message}`);
            reject(`Error reading data directory: ${err.message}`);
            return;
          }

          console.log('Files in data directory:', files);

          // Assuming there's only one CSV file in the directory
          const csvFile = files.find((file) => file.endsWith('.csv'));
          if (!csvFile) {
            reject('CSV file not found in the data directory.');
            return;
          }

          // Read and process the CSV file
          const results = [];
          fs.createReadStream(path.join(DATA_DIR, csvFile))
            .pipe(csv())
            .on('data', (data) => {
              results.push(data);
            })
            .on('end', () => {
              dataset = results;
              resolve(dataset);
            })
            .on('error', (err) => {
              console.error(`Error processing CSV file: ${err.message}`);
              reject(`Error processing CSV file: ${err.message}`);
            });
        });
      });
    } catch (err) {
      reject(err.message);
    }
  });
};

// Endpoint to update the dataset URL and process new data
app.post('/api/update-dataset-url', async (req, res) => {
  const { datasetUrl: newDatasetUrl } = req.body;

  if (!newDatasetUrl) {
    return res.status(400).send('Dataset URL is required.');
  }

  try {
    datasetUrl = newDatasetUrl; // Update the dataset URL
    await downloadAndProcessKaggleData(datasetUrl);
    res.send('Dataset URL updated and processed successfully.');
  } catch (error) {
    console.error('Error processing dataset:', error.message);
    res.status(500).send('Error processing dataset');
  }
});

// Endpoint to get the dataset
app.get('/api/dataset', (req, res) => {
  console.log('Current dataset:', dataset);
  if (dataset.length === 0) {
      return res.status(404).send('Dataset not found or is empty.');
  }
  res.json(dataset);
});

// Endpoint to delete the current dataset
app.post('/api/delete-dataset', async (req, res) => {
  try {
    dataset = []; // Clear the dataset in memory
    await clearDataDirectory(); // Clear data directory
    res.send('Dataset deleted successfully.');
  } catch (error) {
    console.error('Error deleting dataset:', error.message);
    res.status(500).send('Error deleting dataset');
  }
});

// Endpoint to upload a dataset file manually
app.post('/api/upload-dataset', upload.single('datasetFile'), (req, res) => {
  try {
    const file = req.file;
    if (!file || file.mimetype !== 'text/csv') {
      return res.status(400).send('Please upload a CSV file.');
    }

    const filePath = path.join(DATA_DIR, 'uploaded.csv');
    fs.rename(file.path, filePath, (err) => {
      if (err) {
        console.error(`Error moving uploaded file: ${err.message}`);
        return res.status(500).send('Error processing uploaded file.');
      }

      // Process the uploaded CSV file
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          dataset = results;
          res.send('Dataset uploaded and processed successfully.');
        })
        .on('error', (err) => {
          console.error(`Error processing uploaded CSV file: ${err.message}`);
          res.status(500).send('Error processing uploaded file.');
        });
    });
  } catch (error) {
    console.error('Error uploading dataset:', error.message);
    res.status(500).send('Error uploading dataset');
  }
});

// Existing endpoint to handle chat requests
app.post('/api/chat', async (req, res) => {
  const { userInput } = req.body;

  try {
    if (userInput.includes('phone_number')) {
      // Filter entries where phone_number is missing
      const missingPhoneNumbers = dataset.filter((entry) => !entry.phone_number);
      const resultString = missingPhoneNumbers.map((row) => JSON.stringify(row)).join('\n');
      res.json({ content: `Entries where phone_number is missing:\n${resultString}` });
    } else if (userInput.includes('columns') || userInput.includes('column names')) {
      // Return column names
      if (dataset.length > 0) {
        const columnNames = Object.keys(dataset[0]);
        res.json({ content: `The columns in the dataset are:\n${columnNames.join(', ')}` });
      } else {
        res.json({ content: 'Dataset is empty or not loaded correctly.' });
      }
    } else if (userInput.includes('data') || userInput.includes('entries')) {
      // Return a preview of the dataset
      const preview = dataset.slice(0, 5).map((row) => JSON.stringify(row)).join('\n');
      res.json({ content: `Here is a preview of the dataset:\n${preview}` });
    } else {
      res.json({ content: 'Please ask a question related to the dataset. You can ask about columns, data preview, or missing phone numbers.' });
    }
  } catch (error) {
    console.error('Error processing request:', error.message);
    res.status(500).send('Error processing request');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
