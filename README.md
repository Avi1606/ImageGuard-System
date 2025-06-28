# ImageGuard - Image Protection and Detection System

ImageGuard is a full-stack web application designed to help users protect their images through invisible watermarking and detect unauthorized usage through advanced perceptual hashing and similarity analysis.


## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Local Development Setup](#local-development-setup)
- [Usage](#usage)

---

## Features

- **User Authentication:** Secure user registration and login system.
- **Automatic Image Protection:** Images are automatically protected with invisible watermarks upon upload using LSB (Least Significant Bit) steganography.
- **Perceptual Hashing:** Generates perceptual hashes for each uploaded image to enable robust similarity detection.
- **Smart Detection System:** Uses perceptual hash similarity to detect if an uploaded image is a copy or variant of any protected image (even if resized, compressed, or slightly modified).
- **User Dashboard:** A central hub for users to view statistics and access key features.
- **Image Gallery:** View and download protected images with preview functionality.
- **Robust Detection:** Can identify "ours" vs "not ours" images with high accuracy, even for modified copies.

---

## Technology Stack

### Backend
- **Node.js** with **Express.js**: For the main server logic and API.
- **MongoDB**: As the primary database for storing user and image data.
- **Mongoose**: As the ODM for interacting with MongoDB.
- **JSON Web Tokens (JWT)**: For securing the API and managing user sessions.
- **Jimp**: For image processing and LSB steganography.
- **Sharp**: For image metadata extraction and hash generation.

### Frontend
- **React.js**: For building the user interface.
- **Axios**: For making API requests to the backend.
- **Tailwind CSS**: For styling the application.
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
|-- server/         # Node.js backend
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- utils/
|   |-- package.json
|
|-- .gitignore
|-- README.md
```

---

## Local Development Setup

To run this project locally, you will need to have Node.js and npm installed on your machine.

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

- **Create a `.env` file** in the `server` directory. You will need to add your own MongoDB connection string and a JWT secret for the application to work.
  ```
  # Replace with your own MongoDB connection string
  MONGODB_URI=<your_mongodb_connection_string>
  
  # Replace with a long, random string for JWT
  JWT_SECRET=<your_jwt_secret>
  ```

- **Start the backend server:**
  ```bash
  npm run dev
  ```
The backend will be running on `http://localhost:5000`.

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

1. **Register** for a new account or **Login** with existing credentials.
2. **Upload** images you wish to protect - they are automatically protected with invisible watermarks.
3. **Use the Detection feature** to check if an uploaded image is a copy or variant of any of your protected images.
4. **View your protected images** in the Gallery and download them as needed.
5. **Monitor your protection statistics** in the Dashboard.

### How It Works

- **Upload:** When you upload an image, the system automatically embeds an invisible watermark using LSB steganography and saves it as a PNG file.
- **Detection:** When you upload an image for detection, the system compares its perceptual hash to all protected images in the database. If the similarity is above 90%, it's recognized as "ours."
- **Protection:** The invisible watermark and perceptual hashing work together to provide robust protection against unauthorized usage.

### Key Features

- **Invisible Protection:** Images are protected without visible watermarks, maintaining their original appearance.
- **Robust Detection:** Can detect copies even if they've been resized, compressed, or slightly modified.
- **Simple Interface:** Easy-to-use upload and detection system with clear "ours" vs "not ours" results. 