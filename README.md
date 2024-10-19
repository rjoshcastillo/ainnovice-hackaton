## Project Structure

/src │ ├── config │ └── db.config.js - Database configuration │ ├── controllers │ └── _.js - Handles task-specific AI operations │ ├── models │ └── _\_model - Folder for task-specific models and logic │ ├── train.js - Training logic for task-specific model │ ├── model.json - Saved model architecture │ └── weights.bin - Trained model weights │ ├── routes │ └── _.js - API routes for task-specific operations │ ├── utils │ └── _.js - Functions that perform common tasks, such as formatting dates, parsing input data, or validating user input. │ ├── data │ └── \*.csv - Dataset for training models │ └── server.js - Main server file

## Requirements

- Node.js v18.20.4
- TensorFlow.js
- Express.js

## Installation

1. Clone the repository.
2. Install the required dependencies:
   npm install
   install visual studio installer
   - install Desktop Development C++
     install python v3.13
