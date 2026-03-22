import { Link } from 'react-router-dom'
import { Briefcase, Twitter, Linkedin, Github, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-12 px-4 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-bold mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="gradient-text text-lg">InternHub</span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Connecting ambitious students with transformative internship opportunities.
            </p>
            <div className="flex gap-3 mt-4">
              {[
                { Icon: Twitter, link: "https://twitter.com/yourprofile" },
                { Icon: Linkedin, link: "https://www.linkedin.com/in/anurag-verma-60b726294/" },
                { Icon: Github, link: "https://github.com/anuragverma808575-tech/" }
              ].map(({ Icon, link }, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:text-brand-600 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'Platform', links: [['Browse Internships', '/internships'], ['For Companies', '/register?role=company'], ['Pricing', '#'], ['Blog', '#']] },
            { title: 'Students', links: [['Sign Up', '/register'], ['Browse Jobs', '/internships'], ['Track Applications', '/applications'], ['Resume Tips', '#']] },
            { title: 'Company', links: [['Post Internships', '/register?role=company'], ['Find Talent', '#'], ['Pricing', '#'], ['Contact', '#']] },
          ].map(section => (
            <div key={section.title}>
              <h4 className="font-semibold text-sm mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <p>© 2026 InternHub. All rights reserved.</p>

        </div>
      </div>
    </footer>
  )
}
