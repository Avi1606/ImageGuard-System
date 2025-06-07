# ImageGuard - Image Protection and Tampering Detection System

ImageGuard is a full-stack web application designed to help users protect their images through watermarking and to detect unauthorized usage or tampering through advanced image analysis, including both perceptual hashing and machine learning-based feature extraction.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Local Development Setup](#local-development-setup)
- [Usage](#usage)

---

## Features

- **User Authentication:** Secure user registration and login system.
- **Image Uploading:** Users can upload their images to be protected.
- **Watermarking:** Add visible watermarks to images with customizable text, position, and opacity.
- **Image Hashing:** Generates multiple perceptual hashes for each uploaded image to facilitate fast and effective similarity searches.
- **ML-Based Tampering Detection:** Utilizes a Python backend with OpenCV and scikit-learn to perform deep analysis of images, identify similarities, and provide a "tamper score".
- **User Dashboard:** A central hub for users to view statistics, such as the number of protected images, and to access key features.
- **Image Gallery:** A dedicated space for users to view and manage their uploaded and protected images.

---

## Technology Stack

### Backend
- **Node.js** with **Express.js**: For the main server logic and API.
- **Python** with **Flask**: For the machine learning microservice.
- **MongoDB**: As the primary database for storing user and image data.
- **Mongoose**: As the ODM for interacting with MongoDB.
- **JSON Web Tokens (JWT)**: For securing the API and managing user sessions.
- **OpenCV, scikit-learn, numpy**: For image processing and machine learning tasks in the Python service.

### Frontend
- **React.js**: For building the user interface.
- **Axios**: For making API requests to the backend.
- **Tailwind CSS**: for styling the application.
- **React Router**: For handling client-side routing.

---

## Project Structure

The project is organized into two main parts: a `client` directory for the frontend and a `server` directory for the backend.

```
/
|-- client/         # React frontend application
|   |-- public/
|   |-- src/
|       |-- components/
|       |-- contexts/
|       |-- pages/
|   |-- package.json
|
|-- server/         # Node.js and Python backend
|   |-- middleware/
|   |-- ml_models/  # Contains the Python ML service
|   |-- models/
|   |-- routes/
|   |-- utils/
|   |-- package.json
|   |-- requirements.txt
|
|-- .gitignore
|-- README.md
```

---

## Local Development Setup

To run this project locally, you will need to have Node.js, npm, and Python installed on your machine.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <project-directory>
```

### 2. Set Up the Backend

- **Navigate to the server directory:**
  ```bash
  cd server
  ```

- **Install Node.js dependencies:**
  ```bash
  npm install
  ```

- **Install Python dependencies:**
  ```bash
  pip install -r requirements.txt
  ```

- **Create a `.env` file** in the `server` directory and add your environment variables, such as your MongoDB connection string:
  ```
  MONGODB_URI=<your_mongodb_connection_string>
  JWT_SECRET=<your_jwt_secret>
  ```

- **Start the backend server:** (This will run both the Node.js and Python services)
  ```bash
  npm run dev
  ```
The backend will be running on `http://localhost:5000` and the Python ML service on `http://localhost:5001`.

### 3. Set Up the Frontend

- **Open a new, separate terminal window.**
- **Navigate to the client directory:**
  ```bash
  cd client
  ```

- **Install frontend dependencies:**
  ```bash
  npm install
  ```

- **Start the frontend development server:**
  ```bash
  npm start
  ```
The frontend application will open in your browser at `http://localhost:3000`.

---

## Usage

Once both the backend and frontend are running, you can:
1.  **Register** for a new account or **Login** with existing credentials.
2.  **Upload** images you wish to protect.
3.  Go to the **Watermark** page to apply watermarks to your images.
4.  Use the **ML Detection** feature to check if an image has been tampered with or matches any of your protected images.
5.  View your protected images in the **Gallery**. 