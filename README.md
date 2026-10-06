<h1> Terra Talk </h1>

Terra Talk is an open source forum application created for server owners (minecraft, hytale, or any server that could use a forum site)!

<div style="display: inline-grid">
     <img width="49%" height="49%" alt="Image" src="https://github.com/user-attachments/assets/b11061b4-7994-4797-a4a2-64fea9c8e02c" />
     <img width="49%" height="49%" alt="Image" src="https://github.com/user-attachments/assets/646d2bc9-fa67-4e12-9c48-54a9e0164d53" />
</div>

<img width="49%" height="49%" alt="Image" src="https://github.com/user-attachments/assets/97630543-ac30-4e0d-92ce-262ffc5e9b5c" />

<h2> Forum Settings </h2>
Owners can manage the forum settings to customize the forum site how ever they want! From the title to the theme colors, there are no limits to any specific game or features the forum could be for!
<br></br>
<div style="display: inline-grid">
     <img width="49%" height="49%" alt="Image" src="https://github.com/user-attachments/assets/ef48eec3-ecf7-4816-a57d-9dd24b79e6bf" />
     <img width="49%" height="49%" alt="Image" src="https://github.com/user-attachments/assets/890e9bcb-8ad7-4939-beee-6576497705f3" />
</div>

<h2> Profile Settings </h2>
Users can customize their avatar, username, email, or password in Profile Settings
<br></br>
<div style="display: inline-grid">
     <img width="49%" height="49%" alt="Image" src="https://github.com/user-attachments/assets/d0f68892-dc45-462a-b0fc-08567ad38cc5" />
     <img width="49%" height="49%" alt="Image" src="https://github.com/user-attachments/assets/99f267a8-b50a-4681-8c60-af489065f68b" />
</div>

<h2> Member Page / Search Page</h2>
Logged in Users are able to click to a Member Page on the Header where they can see a list of existing users and open up a Member Profile.
Each user has a calculated number of likes, replies, and threads from engaging with the forum. Next to the Member Page is a Search Page
that can pull up topics, threads, posts, or members with typed in keywords.
<br></br>
<div style="display:inline-grid">
   <img width="49%" height="49%" alt="Image" src="https://github.com/user-attachments/assets/ba559260-09a1-4596-9714-4769513c50ce" />
   <img width="49%" height="49%" alt="Image" src="https://github.com/user-attachments/assets/f4b6ec26-5d68-47f0-af29-939aee49bd0d" />
   <img width="49%" height="49%" alt="Image" src="https://github.com/user-attachments/assets/ffaebacb-ba05-44b9-ace8-64af1670b838" />
</div>

<h2> Threads / Posts </h2>
Once you select a topic from the Forum Homepage, you can either click a thread to view its full message and any posts that have replied to it
or create a new thread of your own to start a conversation. The admin account or users set to admin are able to pin / unpin threads.

Inside a Thread, you are able to post to reply to the initial thread message. Both of these can be quoted which takes the text from
the quoted message, liked which adds a like to the user that created the thread or post, or you can report it which sends a notification to
the admins in Forum Settings.
<br></br>
<div style="display:inline-grid">
   <img width="49%" height="49%" alt="Image" src="https://github.com/user-attachments/assets/5d89d82a-823e-48c5-8619-ac98ed366279" />
   <img width="49%" height="49%" alt="Image" src="https://github.com/user-attachments/assets/d2c4d10b-bfb1-4491-9dd3-04b9cb394045" />
   <img width="49%" height="49%" alt="Image" src="https://github.com/user-attachments/assets/fc26131e-04b5-4af7-becb-e9a05ccdd4c9" />
</div>

<h2> Terms of Service </h2>
In the forum is a Terms of Service Template. As of this version, you will need to manually edit the html page to add your applicable information
to the TOS page. Users from the Forum Settings can also be banned for any activity that is inappropiate or criminal in nature. 
It is also worth stating to only use this forum site for activities that are legal and not malicious in any way. I do not condone
misuse or illegal use of this forum site project.
<br></br>
<img width="1148" height="917" alt="Image" src="https://github.com/user-attachments/assets/881b7b8e-e992-47d4-99a4-ec22341aa9e2" />

<h2> Development </h2>
This is a full stack application created with React, Express.js, and sqlite3. Production of this Forum Site was done in part with
Claude and Claude Code using Docker to isolate a single workspace folder for scoped development.
<br></br>
This Project also includes a License file with GNU GPL v3 ensuring free use. It is not intended for commercial projects.

<h2> Default Admin Credentials </h2>
Username: admin
<br></br>
Email: admin@example.com
<br></br>
Password: HelloForum
<br></br>
!!!Please be sure to change the email and password once logged in from your Profile Settings!!!

<h2> Installation Steps </h2>
**later versions may simplify this deployment process**

<h3> Running in Development </h3>
1. in your project directory run npm install inside client and server
<br></br>
cd client > npm install > cd .. > cd server > npm install
<br></br>
2. install vite@latest
3. execute npm run dev in both the client and server folder

<h3> Running in Production </h3>
1. Copy server/.env.example to server/.env and fill in real values (especially JWT_SECRET — use a long random string)
<br></br>
2. Build the frontend:
<br></br>
cd client && npm run build
<br></br>
3. Start the server:
<br></br>
cd server && node index.js
<br></br>
4. Visit http://localhost:3001 (or your configured PORT)
<br></br>



It is my hope that you may get alot of use out of this forum and should you have suggestions, please reach out to my github at https://github.com/mikedapt

