# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Admin Access

The application has a built-in, one-time mechanism to grant administrative privileges to the user with the email `stakithire@gmail.com`.

To gain admin access, simply sign in to the application using that Google account. A server-side script will automatically detect the login, assign the 'admin' role, and then sign you out. When you sign back in, you will have admin rights, and an "Admin" link will appear in the site footer.

This process is designed to be automatic and secure for the initial setup.

## Deployment with Firebase App Hosting

To deploy this application and make it live on the internet, you need to connect it to Firebase App Hosting and a GitHub repository.

### Step 1: Create a GitHub Repository

1.  Go to [GitHub.com](https://github.com) and create a **new, empty repository**. Do not add a README, .gitignore, or license file.
2.  Copy the URL of your new repository (e.g., `https://github.com/your-username/your-repo-name.git`).

### Step 2: Upload Your Code to GitHub

There are two ways to upload your code: using the command line (recommended for developers) or uploading manually through the GitHub website.

#### Option A: Manual Upload (Easiest Method)

This is the easiest way to get your code onto GitHub without using the command line.

1.  **Download your project:** Download the complete source code of this project as a ZIP file from your workspace.
2.  **Unzip the file:** Extract the contents of the ZIP file on your computer. This will create a folder with all your project files.
3.  **IMPORTANT - Prepare for Upload:** Before you upload, you must **delete the `node_modules` folder** if it exists. This folder contains thousands of dependency files and is the reason for the upload error. It is not needed on GitHub.
4.  **Go to your GitHub repository:** Navigate to the empty repository you created in Step 1.
5.  **Upload files:** Click the **"uploading an existing file"** link.
6.  **Drag and Drop:** Drag all the *other* files and folders (including `src`, `public`, `package.json`, `.gitignore`, etc.) into the browser window. **Make sure you do NOT drag the `node_modules` folder.**
7.  **Commit changes:** Once the upload is complete, type a commit message like "Initial commit" and click the "Commit changes" button.

#### Option B: Command Line (Git)

1.  Open a terminal in your project's root directory.
2.  Initialize Git: `git init -b main`
3.  Add all files: `git add .`
4.  Commit the files: `git commit -m "Initial commit"`
5.  Link to your repository: `git remote add origin <YOUR_GITHUB_REPO_URL>`
6.  Push the code: `git push -u origin main`

### Step 3: Connect Firebase to GitHub

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and navigate to your project's **App Hosting** section.
2.  Follow the prompts to **"Connect to GitHub"**.
3.  Authorize Firebase and select the repository you just created and pushed code to.
4.  Choose your `main` branch for deployment.
5.  Firebase will automatically build and deploy your site. Any future pushes to the `main` branch will trigger a new deployment.
