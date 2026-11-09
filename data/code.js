/* ==========================================================================
   YOUR CODING PROJECTS. Shown as cards on the Code page and in the rolling
   strip on Home. A project doesn't have to be public: leave out `github`
   and the card simply has no repository link.

   Fields per project
     name      (required)  e.g. "SCANS"
     summary   (required)  one line: what it is
     summaryFr (optional)  French translation, shown below the summary
     language  (optional)  shown with a coloured dot, e.g. "Python"
     github    (optional)  full repository URL, if it's public
     graphic   (optional)  heading icon: "monitoring" or "classification"
     image     (optional)  { src, alt, width, height } example below the description
     website   (optional)  full public website URL
     context   (optional)  a few sentences for the Code page: why it exists,
                           which project or paper it came from, who it's for
     tags      (optional)  ["NMR", "containers"]
     paper     (optional)  { label: "Paper, 2020", href: "publications.html#some-id" }

   Projects may link to a public repository, a public website, or both.
   ========================================================================== */
window.PROJECTS = [
  {
    name: "SwitchBored",
    graphic: "connections",
    summary: "A macOS menu-bar app for monitoring machines and opening remote connections.",
    context: "SwitchBored keeps your machines in one place, with live availability checks and quick access to SSH, SFTP, tmux and VNC. A separate dashboard adds group filtering and connection latency; optional sysadmin features let you inspect logs and manage systemd services over SSH. Per-machine offline notifications help you spot problems, and Python plugins let you add your own shortcuts and monitors.",
    image: {
      src: "assets/projects/switchbored-dashboard.png",
      alt: "SwitchBored dashboard listing machines with online status and SSH, tmux, SFTP and VNC buttons, beside the macOS menu-bar Quick Connect menu.",
      width: 1280,
      height: 550
    },
    language: "Python",
    github: "https://github.com/jtolchard/SwitchBored",
    tags: ["macOS", "Remote access", "Monitoring", "SSH"]
  },
  {
    name: "SCANS",
    graphic: "monitoring",
    summary: "Dashboard monitoring and alerts for NMR laboratories and their equipment.",
    context: "SCANS (Simple Containerised Analysis for NMR Systems) brings together Python scripts, Prometheus and Grafana to collect equipment logs and sensor readings, track changes over time, and raise alerts. Built for NMR laboratories, it can monitor cryogen levels, helium recovery, compressors, servers and environmental sensors.",
    image: {
      src: "assets/projects/scans-helium-monitoring.png",
      alt: "SCANS dashboard showing spectrometer online status and cryogen levels, a helium recovery balloon gauge at 23.1%, and a compressor outlet pressure chart.",
      width: 592,
      height: 315
    },
    language: "Python",
    github: "https://github.com/jtolchard/SCANS",
    tags: ["NMR", "Monitoring", "Grafana", "Prometheus"]
  },
  {
    name: "NACRED",
    language: "Python",
    version: "1.0",
    released: "2026-10-24",
    graphic: "classification",
    image: {
      src: "assets/projects/nacred-result.png",
      alt: "Example NACRED result: NACRES code NB.41 for NMR rotors, tubes and associated caps, with an explanation in French and 95% confidence.",
      width: 592,
      height: 214
    },
    summary: "An AI tool to help find French NACRES codes",
    summaryFr: "Un outil d’IA pour vous aider à trouver les codes NACRES français",
    website: "https://www.nacred.fr/",
    context: "NACRES codes classify purchases in French public research. NACRED uses AI to suggest matching codes from a description of what you need to buy, with manual search and reference material available too.",
    derivation: "(Name origin: \"I couldn't be knackered.\")",
    tags: ["Research purchasing", "NACRES", "Web app"]
  }
];
