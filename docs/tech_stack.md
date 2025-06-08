# Tech Stack

This document outlines the technology stack used in the Image Forgery Detection and Watermarking application.

## Frontend

-   **Framework:** [React.js](https://reactjs.org/)
-   **UI Library:** [Tailwind CSS](https://tailwindcss.com/)
-   **Routing:** [React Router](https://reactrouter.com/)
-   **State Management:** React Context API
-   **HTTP Client:** [Axios](https://axios-http.com/) (or `fetch` API)
-   **Toasting/Notifications:** [React Hot Toast](https://react-hot-toast.com/)

## Backend

-   **Framework:** [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)
-   **Authentication:** [JSON Web Tokens (JWT)](https://jwt.io/)
-   **Database ORM/ODM:** [Mongoose](https://mongoosejs.com/) for MongoDB
-   **Image Processing:** Libraries like [Sharp](https://sharp.pixelplumbing.com/) or [Jimp](https://github.com/oliver-moran/jimp) for image manipulation and watermarking.
-   **Machine Learning Integration:** The backend integrates with Python scripts for advanced image analysis.
    -   **ML Models:** Potential libraries include OpenCV, Pillow, Scikit-learn, TensorFlow, or PyTorch.

## Database

-   **Database:** [MongoDB](https://www.mongodb.com/) (a NoSQL database)

## Development & Deployment

-   **Package Manager:** [npm](https://www.npmjs.com/)
-   **Version Control:** [Git](https://git-scm.com/)
-   **Deployment Platform:** [Vercel](https://vercel.com/) (indicated by the presence of `.vercel` directories) 