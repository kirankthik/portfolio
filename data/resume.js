// The professional view. Plain, clear wording. The islands view has its own text in world.js.
const topic = (slug) => `https://help.zoho.com/portal/en/community/topic/${slug}`;

export default {
  name: 'Kiran Ponnusamy',
  madeBy: 'Fable',
  role: 'Senior Technical Writer',
  where: 'Zoho · Chennai, India',
  statement: 'I write documentation that makes complex software easy to use.',
  summary:
    'Senior Technical Writer at Zoho, working on help documentation and product announcements for Zoho CRM. My background spans engineering and education, and I now build AI-assisted tools and workflows that make documentation faster to produce and easier to maintain.',
  contact: [
    { icon: 'mail', label: 'kirankthik@gmail.com', href: 'mailto:kirankthik@gmail.com' },
    { icon: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/kiran-ponnusamy-a6b942234' },
    { icon: 'github', label: 'GitHub', href: 'https://github.com/kirankthik' },
  ],

  // the band under the hero: [from, to] in decimal years
  band: [
    { kind: 'study', label: 'Engineering', title: 'BE, SSN College of Engineering', span: [2010.45, 2014.3] },
    { kind: 'work', label: 'Infosys', title: 'System Engineer, Infosys', span: [2014.35, 2016.45] },
    { kind: 'break', label: '', title: 'Career break', span: [2016.45, 2017.0] },
    { kind: 'volunteer', label: '', title: 'Volunteer, Kibbutz Lotan', span: [2017.0, 2017.55] },
    { kind: 'break', label: 'Break', title: 'Career break', span: [2017.55, 2019.5] },
    { kind: 'study', label: 'MA Education', title: 'MA, Azim Premji University', span: [2019.5, 2021.55] },
    { kind: 'volunteer', label: '', title: 'Intern, Isha Vidhya', span: [2021.58, 2021.75] },
    { kind: 'break', label: '', title: 'Between roles', span: [2021.75, 2022.38] },
    { kind: 'work', label: 'Zoho', title: 'Technical Writer, then Senior Technical Writer, Zoho', span: [2022.38, 2026.86], now: true },
  ],

  experience: [
    {
      title: 'Senior Technical Writer',
      org: 'Zoho',
      period: 'May 2026 – Present',
      place: 'Chennai',
      points: [
        'Take on the more complex and time-critical documentation work for Zoho CRM.',
        'Write help documentation, feature announcements and use case content.',
        'Build AI-assisted tools and workflows for the documentation process.',
      ],
    },
    {
      title: 'Technical Writer',
      org: 'Zoho',
      period: 'May 2022 – May 2026',
      place: 'Chennai',
      points: [
        'Wrote help documentation and community announcements for Zoho CRM, covering areas such as data import, process flows and cross-data-centre customization.',
        'Authored use case walkthroughs for the Kiosk Studio series and a long-form ebook on simplifying complex processes.',
        'Created explanatory diagrams for feature announcements.',
        'Brought AI into my writing workflow, from light editing to end-to-end drafting.',
      ],
    },
    {
      title: 'Intern',
      org: 'Isha Vidhya',
      period: 'Aug 2021 – Sep 2021',
      place: 'Coimbatore',
      points: [
        'Observed English language classes during the pandemic and wrote a field report with recommendations for improving online teaching.',
        'Taught grade 2 classes remotely and reviewed digital teaching material for errors in formatting and content.',
      ],
    },
    {
      title: 'Volunteer',
      org: 'Kibbutz Lotan',
      period: 'Jan 2017 – Jul 2017',
      place: 'Israel',
      points: ['Full-time volunteer in landscaping, maintenance and the dairy.'],
    },
    {
      title: 'System Engineer',
      org: 'Infosys',
      period: 'May 2014 – Jun 2016',
      place: 'Chennai · Bengaluru',
      points: [
        'Owned the Release Management module of an internal project management tool: stakeholder contact, requirements, changes and testing.',
        'Tested an automation project for a major bank, later as sole tester, then built in-house automation tools with the prototype team.',
      ],
    },
  ],

  work: [
    { title: 'Import data into a CRM module', kind: 'Help article', href: 'https://help.zoho.com/portal/en/kb/crm/data-administration/import-data/articles/import-data-into-a-crm-module', note: 'Reference documentation for importing data into Zoho CRM.' },
    { title: 'Import data into the Calls module', kind: 'Announcement', href: topic('you-can-now-import-data-into-the-calls-module-in-crm'), note: 'A feature announcement kept deliberately brief.' },
    { title: 'Copy customization across data centres', kind: 'Announcement', href: topic('zoho-crms-copy-customization-functionality-now-works-across-dcs-for-customized-accounts-and-more'), note: 'Feature announcement with an original explanatory diagram.' },
    { title: 'Kiosk Studio Session 2: a call script kiosk', kind: 'Use case', href: topic('kiosk-studio-session-2-boost-cold-call-efficiency-with-a-call-script-kiosk'), note: 'An in-depth, hands-on use case walkthrough.' },
    { title: 'Process flows: early access', kind: 'Announcement', href: topic('early-access-2023-use-process-flows-to-guide-your-crm-users-through-complex-tasks'), note: 'Early-access announcement for guiding users through complex tasks.' },
    { title: 'CRM × WorkDrive file storage', kind: 'Announcement', href: topic('crm-x-workdrive-file-storage-for-new-crm-signups-is-now-powered-by-workdrive'), note: 'Announcement of a storage change; my first use of AI in editing.' },
    { title: 'Kiosk Studio Session 13', kind: 'Use case', href: topic('kiosk-studio-session-13'), note: 'Use case post produced with an AI-assisted workflow from start to finish.' },
    { title: 'Complex processes, simple experiences', kind: 'Ebook', href: topic('complex-processes-simple-experiences'), note: 'Long-form ebook produced on a tight deadline with an AI-assisted workflow.' },
  ],

  projects: [
    { title: 'Formatting shortcut', tag: 'Workflow tool', note: 'A Mac shortcut that moves content between two authoring tools while keeping its formatting, removing a repetitive manual step from publishing.' },
    { title: 'Documentation dashboard', tag: 'Workflow tool', note: 'A dashboard for downloading, searching and sizing a large help centre, so that planning starts from data.' },
    { title: 'Agent-written documentation', tag: 'Experiment', note: 'An ongoing experiment in having a group of AI agents draft documentation from scratch.' },
    { title: 'Twenty-Four Needs', tag: 'Interactive', href: 'creations/human-needs/', note: 'A first-principles map of human needs, agreed by a panel of seven AI agents and explorable in 3D.' },
    { title: 'The Copy and the Exit', tag: 'Essay', href: 'creations/value-and-care/', note: 'An essay on value and care, written through structured debate between AI agents.' },
    { title: 'This site', tag: 'Web', href: 'creations/this-map/', note: 'A résumé with two views, including an explorable 3D map, built in conversation with AI.' },
  ],

  education: [
    { title: 'MA, Education', org: 'Azim Premji University', period: '2019 – 2021', note: 'Grade 8.36' },
    { title: 'BE, Mechanical Engineering', org: 'SSN College of Engineering', period: '2010 – 2014', note: 'Grade 8.6' },
  ],
};
