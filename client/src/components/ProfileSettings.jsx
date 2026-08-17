import { useState, useEffect } from 'react'
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function TermsOfService({ onNavigate }) {

  const { user } = useAuth();

    return (
      <div className="page-content">

                <div className="profile-card">
                  <div className="profile-header">

                      <h1 className="general-heading">Profile Settings</h1>
                      <hr></hr>
                      <br></br>
                      <div className="avatar-backdrop">
                        {user?.profile_path && (
                        <img className="avatar-portrait" src={`http://localhost:3001/profiles/${user.profile_path}`}></img>
                        )}
                       </div>
                      <br></br>
                      <hr></hr>
                      <br></br>
                  </div>
                </div>

                <div className="profile-card">
                  <div className="profile-content">
                      <h2><b> Add / Remove Categories </b></h2>
                      <br></br>
                      <p> Categories are the Green Section Names on the Home Page (ie.. INFORMATION, GAMEPLAY, COMMUNITY). 
                        From here you are able to add / remove categories. If you choose to remove a category on the backend, be sure to remove any rows under it in other tables
                        (topics, threads, posts) </p>
                      <br></br>
                      <p> + Add Categories </p>

                      

                      <br></br>
                      <p> - Remove Categories </p>
                      <br></br>
                      <hr></hr>
                      <br></br>
                      <h2><b> Add / Remove Topics </b></h2>
                      <br></br>
                      <p> Topics are the white Sections assigned to a category on the Home Page (ie.. Announcements, Rules & Guidelines, General Discussion, etc...).
                        From here you are able to add / remove topics. If you choose to remove a topic on the backend, be sure to remove any rows under it in other tables
                        (threads, posts)
                      </p>
                      <br></br>
                      <hr></hr>
                      <br></br>
                      <h2><b> Ban Users from Forum</b></h2>
                      <br></br>
                      <p> Here you will be able to ban Specific Users from Interacting on the Forums </p>
                      <br></br>
                      <hr></hr>
                      <br></br>


                      <button className="btn-submit-reply" onClick={() => onNavigate('home')}>Return to Homepage</button>
                  </div>
                </div>

          </div>
    )
  
}