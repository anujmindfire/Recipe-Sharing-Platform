# Recipe Sharing Application

## Description
The Recipe Sharing Application is a platform that allows users to share, discover, and manage various recipes. Users can search for recipes, filter them based on different criteria, and share their own creations with the community.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)

## Installation

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anujmindfire/Recipe-Sharing-Platform.git
   cd Recipe-Sharing-Platform
   
2. **Install backend dependencies: Navigate to the serverside folder and install the necessary dependencies:**
   ```bash
   cd serverside
   npm install

3. **Set up environment variables: Create a .env file in the root directory with the following content:**
   ```bash
   MONGOURL='mongodb+srv://anuj:pmujU1WPJ8QXLrwh@demodatabase.qqtcuhe.mongodb.net/recipesharing'
   PORT=5301
   SUPERSECRET='recipesharing'
   REFRESHSECRET='recipesharingrefreshtoken!!!!!'

   # AWS SERVER IMAGE 
   BUCKET='dhwani-staging'
   ACCESSKEY='AKIAZO4LYB4X5MGM32PD'
   SECRETACCESSKEY='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'
   REGION='ap-south-1'
4. **Start the backend server: Run the following command in the serverside folder:**
   ```bash
   npm start

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd clientside

2. **Install frontend dependencies:**
   ```bash
   npm install
   
3. **Start the frontend application:**
   ```bash
   npm start

The frontend should now be accessible at http://localhost:3000.

## Usage
Once both the backend and frontend servers are running, you can:

Search for recipes.
Apply filters based on ratings, preparation time, and cooking time.
View and share your own recipes.
Ensure that the backend server (API) is running and properly connected to the frontend for full functionality.
   



