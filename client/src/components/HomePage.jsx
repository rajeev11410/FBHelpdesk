import React from 'react';
import IntegrationBox from './Integationcomponent';
import '../css/HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="welcome-message">
        <span className="welcome-line1">Welcome to</span>
        <br/>
        <span className="welcome-line2">FB DM Helpdesk</span>
        <br/>
        <IntegrationBox/>
      </div>
    </div>
  );
};

export default HomePage;
