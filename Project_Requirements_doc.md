# Project Requirements Document

## 1. Introduction

This document outlines the functional and non-functional requirements for the Image Forgery Detection and Watermarking application. The system is a web-based platform that allows users to upload images, apply watermarks, and use various methods to detect tampering in digital images.

## 2. Functional Requirements

### 2.1. User Management

-   **FR1.1: User Registration:** Users shall be able to create a new account by providing a username, email, and password.
-   **FR1.2: User Login:** Registered users shall be able to log in to the system using their email and password.
-   **FR1.3: User Logout:** Logged-in users shall be able to log out from the system.
-   **FR1.4: Profile Management:** Users shall be able to view and update their profile information.

### 2.2. Image Management

-   **FR2.1: Image Upload:** Authenticated users shall be able to upload images to the system.
-   **FR2.2: Image Gallery:** Users shall be able to view a gallery of their uploaded images.
-   **FR2.3: Image Details:** Users shall be able to view detailed information about a specific image.
-   **FR2.4: Image Deletion:** Users shall be able to delete their uploaded images.

### 2.3. Watermarking

-   **FR3.1: Apply Watermark:** Users shall be able to apply a text or image-based watermark to their uploaded images.
-   **FR3.2: Customize Watermark:** Users shall have options to customize the watermark's position, size, and opacity.

### 2.4. Tamper Detection

-   **FR4.1: Standard Detection:** The system shall provide a standard tamper detection mechanism on uploaded images.
-   **FR4.2: Machine Learning-Based Detection:** The system shall provide an advanced tamper detection mechanism using machine learning models. This includes techniques like ELA (Error Level Analysis), and analysis of metadata.
-   **FR4.3: Advanced Detection:** The system will offer other advanced detection methods.
-   **FR4.4: Detection Results:** The system shall display the results of the tamper detection process to the user in a clear and understandable format.

### 2.5. Analytics

-   **FR5.1: Dashboard:** Users shall have access to a dashboard that provides analytics and statistics related to their images, such as the number of uploads, and detection results.

## 3. Non-Functional Requirements

### 3.1. Usability

-   **NFR1.1: User Interface:** The application shall have a clean, intuitive, and user-friendly interface.
-   **NFR1.2: Responsiveness:** The application shall be responsive and work on various screen sizes, including desktops, tablets, and mobile devices.

### 3.2. Performance

-   **NFR2.1: Response Time:** The system should respond to user actions within a reasonable time. Image processing tasks may take longer but the user should be notified.
-   **NFR2.2: Loading Time:** The application pages should load quickly.

### 3.3. Security

-   **NFR3.1: Authentication:** User authentication shall be secure. Passwords must be hashed before being stored in the database.
-   **NFR3.2: Authorization:** The system shall enforce proper authorization checks to ensure users can only access their own data.
-   **NFR3.3: Data Protection:** All sensitive data should be transmitted over HTTPS.

### 3.4. Scalability

-   **NFR4.1:** The system should be able to handle a growing number of users and images without significant degradation in performance.

## 4. System Architecture

### 4.1. Frontend (Client)

-   **Framework:** React.js
-   **UI Library:** Tailwind CSS
-   **Routing:** React Router
-   **State Management:** React Context API

### 4.2. Backend (Server)

-   **Framework:** Node.js with Express.js
-   **Authentication:** JSON Web Tokens (JWT)
-   **Image Processing:** Libraries for image manipulation and watermarking.
-   **Machine Learning:** Integration with Python scripts or libraries (e.g., TensorFlow.js, OpenCV) for ML-based detection.

### 4.3. Database

-   A NoSQL database like MongoDB will be used to store user information and image metadata. Mongoose will be used as the ODM.

### 4.4. Deployment

-   The application will be designed for easy deployment on cloud platforms like Vercel, Heroku, or AWS. 