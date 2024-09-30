# Recipe Sharing Application

## Description
The Recipe Sharing Application is a platform that allows users to share, discover, and manage various recipes. Users can search for recipes, filter them based on different criteria, and share their own creations with the community.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)

## Installation
To run the application locally, follow these steps:

1. **Clone the repository:**
   ```bash
   https://github.com/anujmindfire/Recipe-Sharing-Platform.git
   cd Recipe-Sharing-Platform

2. Install dependencies: Make sure you have Node.js and npm installed. Then, run:

npm install

3. Set up environment variables: Create a .env file in the root directory with the following contents:

MONGOURL='mongodb+srv://anuj:pmujU1WPJ8QXLrwh@demodatabase.qqtcuhe.mongodb.net/recipesharing'
PORT=5301
SUPERSECRET='recipesharing'
REFRESHSECRET='recipesharingrefreshtoken!!!!!'

# AWS SERVER IMAGE 
BUCKET='dhwani-staging'
ACCESSKEY='AKIAZO4LYB4X5MGM32PD'
SECRETACCESSKEY='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'
REGION='ap-south-1'

npm start

## Usage
Once the application is running, you can access it at http://localhost:5301. You will be able to:

1. Search for recipes
2. Apply filters based on ratings, preparation time, and cooking time
3. View and share your own recipes

Frontend Setup and Start Instructions

1. Ensure Node.js and npm are Installed: Make sure you have Node.js and npm (Node Package Manager) installed on your machine. You can check if they are installed by running the following commands in your terminal:

node -v
npm -v

2. Navigate to the Frontend Directory: If your frontend code is in a separate directory (like clientside), navigate to that directory. For example:

cd clientside

3. Install Dependencies: If you haven’t installed the frontend dependencies yet, run the following command:

npm install

4. Start the Frontend Application: To start the frontend application, run:

npm start

This command will start the development server and usually open your default web browser to http://localhost:3000.

5. Check API Integration: Ensure your backend server (API) is running as well, so that the frontend can communicate with it. Follow the instructions in the previous README.md for starting the backend if necessary.

project folder looks like this:

/recipesharing
    /clientside
    /serverside
     -- .env
    README.md
