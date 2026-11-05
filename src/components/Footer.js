import React, { useEffect, useState } from 'react';

const clock = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' });
const now = () => `It’s ${clock.format(new Date()).toLowerCase()} in Mehsana`;

const Footer = () => {
  const [time, setTime] = useState(now);

  useEffect(() => {
    const tick = window.setInterval(() => setTime(now()), 30000);
    return () => window.clearInterval(tick);
  }, []);

  return (
    <footer>
      <div className="wrap">
        <div className="foot">
          <span>© {new Date().getFullYear()} Divy Patel</span>
          <span>{time}</span>
          <a className="link" href="#top">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
