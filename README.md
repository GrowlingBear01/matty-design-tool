# **Matty \- Online Graphic Design Tool**

Welcome to Matty, a full-stack web application that provides a powerful and intuitive online graphic design editor. Built with the MERN stack, this tool allows users to create, save, and export their designs, featuring a rich toolkit including text styling, image uploads, shapes, templates, and more.

## **Table of Contents**

* [About The Project](https://www.google.com/search?q=%23about-the-project)  
* [Key Features](https://www.google.com/search?q=%23key-features)  
* [Tech Stack](https://www.google.com/search?q=%23tech-stack)  
* [Getting Started](https://www.google.com/search?q=%23getting-started)  
  * [Prerequisites](https://www.google.com/search?q=%23prerequisites)  
  * [Installation & Setup](https://www.google.com/search?q=%23installation--setup)  
* [Project Structure](https://www.google.com/search?q=%23project-structure)  
* [Future Enhancements](https://www.google.com/search?q=%23future-enhancements)

## **About The Project**

Matty was developed as a comprehensive solution for individuals and teams who need a simple yet powerful tool for creating graphics for social media, presentations, and other digital platforms. The project's goal was to build a complete Minimum Viable Product (MVP) based on a detailed project plan, showcasing a full range of full-stack development skills, from user authentication and database management to a complex, interactive frontend canvas.

## **Key Features**

* ✅ **Full User Authentication:** Secure user registration and login system using JWT for session management.  
* ✅ **Personalized Dashboard:** A "My Designs" gallery for each user to view, manage, and reload their saved work.  
* ✅ **Rich Canvas Editor:**  
  * **Add & Style Text:** Add text blocks and modify their content, font size, color, and family via a properties panel.  
  * **Double-Click to Edit:** Intuitive in-place editing for text directly on the canvas.  
  * **Image Uploads:** Securely upload images, which are hosted on Cloudinary.  
  * **Basic Shapes:** Add and style rectangles and circles with customizable fill colors.  
* ✅ **Template Browser:** Start designs from a selection of beautiful, pre-made templates.  
* ✅ **Undo/Redo Functionality:** A complete history stack for all actions, allowing for a seamless and forgiving editing experience.  
* ✅ **Save & Load:** Securely save design progress to a MongoDB Atlas database and load it back into the editor.  
* ✅ **Multiple Export Options:** Download final designs as high-quality **PNG** images or print-ready **PDF** documents.  
* ✅ **Modern UI/UX:** A professional, multi-panel layout with a smooth toast notification system for user feedback.

## **Tech Stack**

This project is built using the MERN stack and is fully containerized with Docker.

| Category | Technology / Service |
| :---- | :---- |
| **Frontend** | React, Vite, TailwindCSS, Konva.js, react-konva |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (hosted on MongoDB Atlas) |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs for hashing |
| **Image Hosting** | Cloudinary |
| **PDF Export** | jspdf, html2canvas |
| **Deployment** | Docker, Docker Compose |

## **Getting Started**

To get a local copy up and running, follow these simple steps.

### **Prerequisites**

* You must have [Node.js](https://nodejs.org/) installed on your machine.  
* You must have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### **Installation & Setup**

1. **Clone the repository:**  
   git clone \[https://github.com/GrowlingBear01/matty-design-tool.git\](https://github.com/GrowlingBear01/matty-design-tool.git)  
   cd matty-design-tool

2. **Set up Backend Environment Variables:**  
   * Navigate to the server directory.  
   * Create a .env file by copying the example: cp .env.example .env  
   * Open the new .env file and fill in your secret keys for:  
     * MONGO\_URI  
     * CLOUDINARY\_CLOUD\_NAME, CLOUDINARY\_API\_KEY, CLOUDINARY\_API\_SECRET  
     * JWT\_SECRET (can be any long, random string)  
3. **Install Dependencies:**  
   * In the server directory, run: npm install  
   * In the client directory, run: npm install  
4. **Start the Application:**  
   * From the **root directory**, start the MongoDB database with Docker:  
     docker-compose up \-d

   * In a new terminal, start the **backend server** (from the server directory):  
     npm run dev

   * In another terminal, start the **frontend client** (from the client directory):  
     npm run dev

   * Open your browser and navigate to http://localhost:5173.

## **Project Structure**

The project is organized in a monorepo structure with two main directories:

* **/client**: Contains the entire React frontend application, including all components, pages, and the Konva.js editor logic.  
* **/server**: Contains the Node.js and Express backend, including API routes, middleware, Mongoose models, and connection logic.

## **Future Enhancements**

The project is now a complete MVP. The next phase of development could include features from the original project roadmap, such as:

* **Real-time Collaboration:** Allow multiple users to edit the same design simultaneously using WebSockets.  
* **Advanced Image Editing:** Add image filters for brightness, contrast, and grayscale.  
* **Design Version History:** Allow users to view and restore previous saved versions of their designs.