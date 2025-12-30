import { Linkedin, Instagram } from 'lucide-react';

export default function Footer(){
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <div className="brand-title">daisychained</div>
          <div className="brand-email">humans@daisychained.co.uk</div>
        </div>

        <div className="socials">
          <a href="#" aria-label="LinkedIn"><Linkedin /></a>
          <a href="#" aria-label="Instagram"><Instagram /></a>
        </div>
      </div>
    </footer>
  );
}
