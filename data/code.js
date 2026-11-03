/* ==========================================================================
   YOUR CODING PROJECTS. Shown as cards on the Code page and in the rolling
   strip on Home. A project doesn't have to be public: leave out `github`
   and the card simply has no repository link.

   Fields per project
     name      (required)  e.g. "SCANS"
     summary   (required)  one line: what it is
     language  (optional)  shown with a coloured dot, e.g. "Python"
     github    (optional)  full repository URL, if it's public
     context   (optional)  a few sentences for the Code page: why it exists,
                           which project or paper it came from, who it's for
     tags      (optional)  ["NMR", "containers"]
     paper     (optional)  { label: "Paper, 2020", href: "publications.html#some-id" }

   The first two entries come from your public GitHub repositories.
   ========================================================================== */
window.PROJECTS = [
  {
    name: "SwitchBored",
    summary: "A macOS menu-bar app for quick access to monitoring and managing connections (SSH, SFTP, VNC) across multiple machines.",
    language: "Python",
    github: "https://github.com/jtolchard/SwitchBored",
    tags: ["macOS", "SSH", "menu bar"]
  },
  {
    name: "SCANS",
    summary: "Simple Containerised Analysis for NMR Systems.",
    language: "Python",
    github: "https://github.com/jtolchard/SCANS",
    tags: ["NMR", "containers", "analysis"]
  }
];
