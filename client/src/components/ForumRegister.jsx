import { useState, useEffect } from 'react'
import { api } from '../api';

export default function ForumRegister({ onNavigate }) {
  return (
    <div className="page-content">
          <div className="forum-layout">
            <div className="forum-main">
              <button className="btn-submit-reply" onClick={() => onNavigate('home')}>Return to Homepage</button>
            </div>
          </div>
        </div>
  )
}