# MotiMate-
# Task & Project Manager (Node.js/EJS/MongoDB)

A web application built with Node.js, Express, EJS, and MongoDB for managing personal or small team tasks and projects. Inspired by tools like Todoist, this application provides core functionalities for organizing your work, tracking progress, and managing deadlines.

## ✨ Key Features

*   **User Authentication:** Secure user registration and login using Passport.js (Local Strategy).
*   **Password Management:** Users can change their password via their profile page.
*   **Project Management:** Create, view, edit, and delete projects.
*   **Task Management:** Create, view, edit, and delete tasks within or outside projects.
*   **Task Properties:** Assign due dates and priorities (Low, Medium, High, Critical) to tasks. Mark tasks as complete.
*   **Dashboard Overview:** Get a quick summary of task statistics (total, completed, pending, completed today) and view upcoming tasks.
*   **Profile Page:** View basic user information and change password.
*   **Notifications (In-App):** A notification bell system (currently uses mock data, requires backend API integration for real notifications like overdue tasks).
*   **Theme Switching:** Toggle between light and dark modes.
*   **Responsive Design:** Basic responsiveness for usability on different screen sizes.

## 💻 Technology Stack

*   **Backend:** Node.js, Express.js
*   **Templating Engine:** EJS (Embedded JavaScript templates)
*   **Database:** MongoDB with Mongoose (Object Data Modeling)
*   **Authentication:** Passport.js (passport-local)
*   **Password Hashing:** bcryptjs
*   **Session Management:** express-session
*   **Flash Messages:** connect-flash
*   **Middleware:** method-override (for PUT/DELETE requests from forms)
*   **Environment Variables:** dotenv
*   **Styling:** CSS3 (Potentially Font Awesome for icons)
*   **Frontend JavaScript:** Vanilla JavaScript (for DOM manipulation, theme switching, notifications)
*   **(Optional/Included):**
    *   Socket.IO (for potential real-time features - basic setup included)
    *   node-cron (for potential scheduled tasks - basic setup included)

## Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (which includes npm)
*   [MongoDB](https://www.mongodb.com/try/download/community) (or a MongoDB Atlas account)
*   [Git](https://git-scm.com/) (optional, for cloning)

## 🚀 Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-folder-name>
    ```
    Replace `<your-repository-url>` with the actual URL of your Git repository and `<repository-folder-name>` with the name of the folder created by cloning.

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Create Environment Variables File:**
    Create a file named `.env` in the root directory of the project. This file will store sensitive configuration details.

4.  **Configure Environment Variables:**
    Add the following variables to your `.env` file, replacing the placeholder values:

    ```dotenv
    # MongoDB Connection String
    # Example for local MongoDB: MONGODB_URI=mongodb://localhost:27017/taskmanagerdb
    # Example for MongoDB Atlas: MONGODB_URI=mongodb+srv://<username>:<password>@<your-cluster-url>/<database-name>?retryWrites=true&w=majority
    MONGODB_URI=<your_mongodb_connection_string>

    # Session Secret (choose a long, random string)
    SESSION_SECRET=<your_strong_random_session_secret>

    # Port (optional, defaults to 3000 if not set)
    # PORT=3000

    # Node Environment (optional, defaults to development)
    # NODE_ENV=development
    ```

    *   **MONGODB_URI:** Your connection string for MongoDB.
    *   **SESSION_SECRET:** A secret key used to sign the session ID cookie. Make this long and random for security.

## ▶️ Running the Application

1.  **Start the Server:**
    ```bash
    npm start
    ```
    (This assumes you have a `start` script in your `package.json` like `"start": "node app.js"`. If not, use `node app.js`).

2.  **Access the Application:**
    Open your web browser and navigate to `http://localhost:3000` (or the port you specified in the `.env` file or the default port if `PORT` isn't set).

## 📖 How to Use

1.  **Register/Login:** Access the application via your browser. If you are a new user, register for an account. Otherwise, log in with your credentials.
2.  **Dashboard:** After login, you will be redirected to the dashboard, which provides an overview of your tasks and links to other sections.
3.  **Manage Projects:** Navigate to the "Projects" section to create new projects, view existing ones, edit details, or delete them. Deleting a project will also delete all associated tasks.
4.  **Manage Tasks:** Go to the "Tasks" section to view all your tasks. You can add new tasks, edit existing ones (title, description, due date, priority), mark them as complete, or delete them. (Note: Task creation might be linked to projects depending on your implementation).
5.  **Notifications:** Click the bell icon in the top right (on the dashboard) to view notifications (currently mock data, needs backend API).
6.  **Profile:** Click "My Profile" (usually linked from the dashboard) to view your account details and use the form to change your password.
7.  **Theme:** Use the toggle switch (usually in the header or top corner of pages) to switch between light and dark themes.
8.  **Logout:** Use the "Logout" button to securely end your session.



## Live Link-https://motimate-app.onrender.com
