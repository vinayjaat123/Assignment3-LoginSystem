# Assignment 3 Login System

**Project Name:** Assignment 3 Login System  
**Student Name:** Vinay  
**Student ID:** 5147018  
**Instructor:** Cathy Chen  
**Course:** Software Engineering  

## Project Description

This project is an improved version of the web-based login system originally developed in Assignment 2. For Assignment 3, the system was evaluated using Black-Box Testing techniques, including Equivalence Partitioning and Boundary Value Analysis, to test email validation, password validation, valid login, invalid login, and boundary conditions for input length. Defects found during testing were fixed, and the updated system was managed using Git and GitHub workflow practices such as branching, committing, pushing, creating a pull request, reviewing, and merging changes.

The application includes user registration, user login, and a dashboard that allows the user to save profile information, personal notes, and tasks. The system uses a frontend, backend, and SQLite database.

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js with Express
- Database: SQLite
- Security: bcrypt
- Version Control: Git and GitHub

## Main Features

- User registration
- User login
- Password hashing
- Dashboard after login
- Profile saving
- Notes saving
- Task management
- SQLite database storage
- Email validation improvements
- Password boundary validation
- Duplicate registration handling
- Black-box testing and defect correction

## How to Run the Project

1. Open terminal in the backend folder.
2. Run:

```bash
npm install
```

3. Run:

```bash
node server.js
```

4. Open browser and go to:

```bash
http://localhost:3000
```

5. Register a new user or log in with an existing user account.

## Project Files

- `backend/server.js`
- `backend/users.db`
- `backend/package.json`
- `frontend/index.html`
- `frontend/dashboard.html`
- `frontend/images/`

## Testing and Revision Summary

In Assignment 3, the login system from Assignment 2 was tested using Black-Box Testing methods. Test cases were designed for valid and invalid input scenarios, including email format validation, password length validation, successful login, failed login, and input boundary conditions. When test failures were identified, the defects were analyzed and the code was revised. The affected test cases were then rerun to verify that the fixes worked correctly.

## Git and GitHub Workflow Summary

The revised system was managed using Git and GitHub. A feature branch was created for the testing and validation updates. Changes were committed with meaningful commit messages and pushed to GitHub. A Pull Request was created to review the changes, self-review comments were added, and the changes were merged after review. This workflow was used to demonstrate task tracking, version control, and basic collaborative development practices required for Assignment 3.

## Repository Link

[GitHub Repository](https://github.com/vinayjaat123/Assignment3-LoginSystem)

## Note

This project was reviewed, tested, and revised before final submission. Passwords are stored using bcrypt hashing instead of plain text. A future improvement would be session-based authentication for stronger route protection. Assignment 3 strengthened the project by adding structured black-box testing, defect fixing, and GitHub workflow evidence in addition to the original Assignment 2 implementation.
