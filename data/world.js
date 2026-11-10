// The whole map lives in this file. Edit text here; the 3D world rebuilds from it.
//
// island fields
//   id         unique, also the shareable link (…/#id)
//   kind       'chapter' | 'force' | 'creation' | 'frontier' | 'plot'
//   position   at(right, down, height): where it sits on screen in the opening view
//   radius     island size
//   palette    { top, earth, rock, accent }  any CSS hex colours
//   landmark   which model stands on the island (see js/islands.js → LANDMARKS)
//   era        the hour of the sky over this island: 0 = night, 0.72 = dawn, 1 = morning
//   year       label on the timeline
//   body       paragraphs;  highlights: bullet points;  tags: small chips
//   sections   [{ heading, items: [{ title, href, note }] }]
//   href, cta  for creations: where "step inside" goes
//
// paths: { from, to, style: 'stones' | 'light' }

const dawn = { top: '#a9dba8', earth: '#e0ab7e', rock: '#a98fb5', accent: '#ff8a6b' };
const sand = { top: '#f1dcae', earth: '#e3b98f', rock: '#b9a3c4', accent: '#f2a65a' };
// screen-aligned placement for the isometric view: right, toward-the-viewer, height
const at = (u, w, h) => [+((u + w) / Math.SQRT2).toFixed(2), h, +((w - u) / Math.SQRT2).toFixed(2)];
const topic = (slug) => `https://help.zoho.com/portal/en/community/topic/${slug}`;

export default {
  person: {
    name: 'Kiran Ponnusamy',
    headline: 'Senior Technical Writer · Zoho',
    tagline: 'Ex-unemployed. Read a sign saying "Mind your head" and still ran into it.',
    intro: 'A map of a career, and of the things I have made along the way.',
    links: [
      { label: 'Email', href: 'mailto:kirankthik@gmail.com' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kiran-ponnusamy-a6b942234' },
      { label: 'GitHub', href: 'https://github.com/kirankthik' },
    ],
  },

  islands: [
    // ───────── the trail ─────────
    {
      id: 'ssn',
      era: 0.0, year: '2010',
      kind: 'chapter',
      kicker: 'SSN College of Engineering',
      title: 'Mechanical Engineering',
      period: 'Jun 2010 – Apr 2014',
      position: at(-45, -37, 0),
      radius: 4.6,
      palette: { ...dawn, top: '#c5e0a0', accent: '#5b8def' },
      landmark: 'gear',
      body: ['Bachelor of Engineering. Grade: 8.6.'],
    },
    {
      id: 'infosys',
      era: 0.1, year: '2014',
      kind: 'chapter',
      kicker: 'Infosys',
      title: 'System Engineer',
      period: 'May 2014 – Jun 2016 · Chennai / Bengaluru',
      position: at(-28, -34, 0.8),
      radius: 5,
      palette: { ...dawn, accent: '#5b8def' },
      landmark: 'office',
      highlights: [
        'Chennai: responsible for the Release Management module of an internal project management tool. Point of contact for stakeholders, gathering user requirements, and creating and testing modifications.',
        'Bangalore: started as a tester on an automation project for a major bank, then became the sole tester for the rest of the project. After that, joined the prototype team, where we created rudimentary in-house tools for automation.',
      ],
    },
    {
      id: 'went-home',
      era: 0.2, year: '2016',
      kind: 'chapter',
      kicker: 'Career break · Coimbatore',
      title: 'Quit and went home',
      period: 'Jun 2016 – Dec 2016',
      position: at(-13, -37, 1.5),
      radius: 3.4,
      palette: { ...dawn, top: '#bfe0b0' },
      landmark: 'home',
      body: [
        'Quit my job and returned home. I was trying to figure out whether to pursue higher education or travel abroad. I was leaning towards higher education when the volunteering opportunity opened up.',
      ],
    },
    {
      id: 'kibbutz',
      era: 0.28, year: '2017',
      kind: 'chapter',
      kicker: 'Kibbutz Lotan · Israel',
      title: 'Volunteer',
      period: 'Jan 2017 – Jul 2017',
      position: at(3, -43, 2.2),
      radius: 4.8,
      palette: sand,
      landmark: 'kibbutz',
      highlights: [
        'Landscaping and maintenance.',
        'Dairy milker: completing the milking at the appropriate times after setting up the parlor, showering the cows in summer, taking care of and transferring the calves, and assisting the maintenance in-charge with non-routine tasks.',
      ],
    },
    {
      id: 'buridan',
      era: 0.34, year: '2017',
      kind: 'chapter',
      kicker: 'Career break · Coimbatore',
      title: 'Buridan’s Ass with a nice family',
      period: 'Jul 2017 – Jul 2019',
      position: at(21, -37, 3),
      radius: 4.4,
      palette: { ...dawn, top: '#cfe3a4', accent: '#f2a65a' },
      landmark: 'donkey',
      body: [
        'Returned from travel abroad. Being an ultimate worrier, I spent a lot of time trying to figure out what to do next (job or study or start a business) while imagining the doomsday scenarios that would ensue if a choice was made (or not made).',
        'On the flip side, told a million stories to my niece and spent a lot of time with my grandparents.',
      ],
    },
    {
      id: 'azim-premji',
      era: 0.46, year: '2019',
      kind: 'chapter',
      kicker: 'Azim Premji University',
      title: 'MA in Education',
      period: 'Jul 2019 – Jul 2021',
      position: at(38, -29, 3.8),
      radius: 5,
      palette: { ...dawn, top: '#9fd6b4', accent: '#c06ae0' },
      landmark: 'campus',
      body: ['Master of Arts, Education. Grade: 8.36.'],
    },
    {
      id: 'isha-vidhya',
      era: 0.54, year: '2021',
      kind: 'chapter',
      kicker: 'Isha Vidhya',
      title: 'Intern',
      period: 'Aug 2021 – Sep 2021 · Coimbatore',
      position: at(41, -13, 4.4),
      radius: 3.8,
      palette: { ...dawn, accent: '#f2a65a' },
      landmark: 'school',
      highlights: [
        'Observed and wrote a field internship report of English language classes during the pandemic.',
        'Underwent a crash course in teaching and taught a few classes for children of grade 2 in Cuddalore via Zoom.',
        'Wrote a report with suggestions for improving the online classes in the Cuddalore schools.',
        'Checked the digital teaching material used for the English classes and submitted a report with the errors found in formatting and content.',
      ],
    },
    {
      id: 'origin-story',
      era: 0.6, year: '2021',
      kind: 'chapter',
      kicker: 'How I got into this',
      title: 'The origin story',
      period: 'Sep 2021 – May 2022',
      position: at(26, -8, 5),
      radius: 3.8,
      palette: { ...dawn, top: '#c5e0a0', accent: '#7c6cf0' },
      landmark: 'crossroads',
      body: [
        'My grandma once asked me how to use a smartphone and I helped her. That’s how I realised that I had a talent for explaining things.',
        'The previous two sentences are lies. I was unemployed and needed money and was willing to work hard and have a good attitude, and technical writing seemed to be a next job (like the next token from an LLM) that made at least a little sense given my live-free-die-poor resume.',
        'But I actually ended up liking it (except for the office politics. My God!)!',
      ],
    },
    {
      id: 'technical-writer',
      era: 0.7, year: '2022',
      kind: 'chapter',
      kicker: 'Zoho',
      title: 'Technical Writer',
      period: 'May 2022 – May 2026 · Chennai',
      position: at(7, -7, 6),
      radius: 7,
      palette: dawn,
      landmark: 'pencil',
      body: ['Help docs and community announcements for Zoho CRM. Joined as a contractor in May 2022.'],
      sections: [
        {
          heading: 'Work I like',
          items: [
            { title: 'Import data into a CRM module', href: 'https://help.zoho.com/portal/en/kb/crm/data-administration/import-data/articles/import-data-into-a-crm-module', note: 'A help doc I like.' },
            { title: 'You can now import data into the Calls module in CRM', href: topic('you-can-now-import-data-into-the-calls-module-in-crm'), note: 'The shortest announcement I’ve written, and I love it for that reason.' },
            { title: 'Copy customization now works across DCs', href: topic('zoho-crms-copy-customization-functionality-now-works-across-dcs-for-customized-accounts-and-more'), note: 'I really like this one for the diagram, which I made myself.' },
            { title: 'Kiosk Studio Session 2: Boost cold call efficiency with a call script kiosk', href: topic('kiosk-studio-session-2-boost-cold-call-efficiency-with-a-call-script-kiosk'), note: 'A labour-intensive piece of work from the non-AI period.' },
            { title: 'Early access 2023: Process flows to guide CRM users through complex tasks', href: topic('early-access-2023-use-process-flows-to-guide-your-crm-users-through-complex-tasks'), note: 'I learnt a lot about how orgs work in the real world while making and editing this one.' },
          ],
        },
        {
          heading: 'As AI came in',
          items: [
            { title: 'CRM × WorkDrive: File storage for new CRM signups is now powered by WorkDrive', href: topic('crm-x-workdrive-file-storage-for-new-crm-signups-is-now-powered-by-workdrive'), note: 'Special because it was the first time I actually used AI for work. I’d been playing around with it and used it very lightly here, basically to make content shorter in many places.' },
            { title: 'Kiosk Studio Session 13', href: topic('kiosk-studio-session-13'), note: 'A use case post where I used AI heavily from start to finish.' },
            { title: 'Complex processes, simple experiences (ebook)', href: topic('complex-processes-simple-experiences'), note: 'Written after a lot of wrestling with AI. It’s not my best work, but I learnt a lot about making AI work for me from the process (and the tight deadline).' },
          ],
        },
      ],
    },
    {
      id: 'senior-technical-writer',
      era: 0.88, year: '2026',
      kind: 'chapter',
      kicker: 'Zoho',
      title: 'Senior Technical Writer',
      period: 'Since 20 May 2026 · Chennai',
      position: at(-16, -5, 7.5),
      radius: 7.4,
      palette: { ...dawn, top: '#97d4b0', accent: '#ff7a59' },
      landmark: 'lighthouse',
      body: [
        'Same as the technical writer. I don’t see much difference, except that the “trickier” and “we-have-no-time” work items land on you because you are expected to deliver.',
      ],
    },
    {
      id: 'frontier',
      era: 1.0, year: '20??',
      kind: 'frontier',
      kicker: 'Some day',
      title: 'A business with a soul',
      position: at(-38, -9, 9.2),
      radius: 4.8,
      palette: { top: '#f3dfb4', earth: '#e3b98f', rock: '#b9a3c4', accent: '#7c6cf0' },
      landmark: 'telescope',
      body: [
        'Start my own business (any business!) some day before I die.',
        'But it should be a business with a soul. Otherwise, it’s better to not start one.',
      ],
    },

    // ───────── the tailwind ─────────
    {
      id: 'tailwind',
      era: 0.76,
      kind: 'force',
      kicker: 'The tailwind',
      title: 'Building with AI',
      position: at(2, 16, 6.6),
      radius: 6.2,
      palette: { top: '#b9e3d6', earth: '#e6b58c', rock: '#8f92c9', accent: '#7c6cf0' },
      landmark: 'windmill',
      body: [
        'I started with ChatGPT when it was released and it blew my mind. Not the answers, but the fact that it could understand my questions and responses.',
        'I did all kinds of weird stuff, like asking it to explain Shannon’s theory physically using my room. (I still don’t understand it. I just remember doing stuff that involved repeated signals, counting to figure out what the message was, and changing the code based on the most frequently sent stuff so that you can message faster.)',
        'At work it was more of a plaything that you could use to brainstorm a bit or to produce dummy data (super useful). Then one long-term irritant pulled me in deeper, and everything on the islands this wind reaches followed.',
        'The offloading of writing to AI is happening more and more. Bottlenecks are being removed everywhere. Videos were a pain to create; now, with Claude Motion, I can create them quickly. The step changes that happen with AI are pretty cool to experience.',
      ],
    },

    // ───────── creations: each one is its own little world ─────────
    {
      id: 'formatting-shortcut',
      era: 0.78,
      kind: 'creation',
      kicker: 'Creation · at work',
      title: 'The formatting shortcut',
      position: at(-17, 17, 6.2),
      radius: 3.7,
      palette: { top: '#ffe2a8', earth: '#eebf7c', rock: '#b9895c', accent: '#e8590c' },
      landmark: 'handoff',
      body: [
        'A long-term irritant at work: moving content from one tool to another meant clearing the formatting, which also removed bold, italics, lists and so on. I wanted a tool for this.',
        'It kept failing. But I kept trying with each new model and finally, after years and with an Opus model, it delivered.',
        'The final shape is a Mac shortcut. I still use it (November 2026), saving a lot of time and, more importantly, freeing me from mental fatigue.',
      ],
      tags: ['Mac shortcut', 'Years of retries'],
    },
    {
      id: 'docs-dashboard',
      era: 0.8,
      kind: 'creation',
      kicker: 'Creation · at work',
      title: 'Docs dashboard',
      position: at(-31, 30, 7),
      radius: 4,
      palette: { top: '#dfe6f5', earth: '#b9c4de', rock: '#7d88ad', accent: '#2f6fed' },
      landmark: 'dashboard',
      body: [
        'As I used AI more and more, I realised that I needed easy access to the help doc content itself. And when a big docs revamp came up, I wanted to know how big the thing actually was.',
        'Those two needs combined into a dashboard where I can download everything, a section, or a single article, and search through the underlying HTML (for example, to find a link that needs to change everywhere). It keeps evolving.',
      ],
      tags: ['Download', 'Search', 'Sizing'],
    },
    {
      id: 'docs-swarm',
      era: 0.82,
      kind: 'creation',
      kicker: 'Experiment · in progress',
      title: 'A swarm writes the docs',
      position: at(-14, 35, 7.6),
      radius: 3.6,
      palette: { top: '#ffd3dc', earth: '#eea5b6', rock: '#a8698a', accent: '#d6336c' },
      landmark: 'swarm',
      body: [
        'November 2026: a small experiment where I’m letting a swarm of agents write a set of help docs from scratch.',
        'Failing miserably now. But then, I remember how long the formatting shortcut took.',
      ],
      tags: ['Agents', 'Failing (for now)'],
    },
    {
      id: 'human-needs',
      era: 0.82,
      kind: 'creation',
      kicker: 'Creation',
      title: 'Twenty-Four Needs',
      position: at(4, 38, 7),
      radius: 5.2,
      palette: { top: '#2f3a5f', earth: '#232a47', rock: '#171c33', accent: '#6ee7d8' },
      landmark: 'lattice',
      body: [
        'A map of human needs worked out from first principles by a panel of seven AI agents with deliberately opposed worldviews. All seven signed.',
        'Four levels of a person, four ways a living system can fail: sixteen families, twenty-four needs, explorable in 3D.',
      ],
      tags: ['Interactive 3D', 'Multi-agent debate'],
      href: 'creations/human-needs/',
      cta: 'Step inside the explorer',
    },
    {
      id: 'value-and-care',
      era: 0.82,
      kind: 'creation',
      kicker: 'Creation',
      title: 'The Copy and the Exit',
      position: at(22, 19, 6.6),
      radius: 4.6,
      palette: { top: '#f4ead6', earth: '#d9c7a3', rock: '#8a7a66', accent: '#c8922e' },
      landmark: 'key',
      body: [
        'A two-page essay on the difference between value and care, written by a swarm of adversarial agents: rival theses, critics, a crucible of attacks and a final arbiter.',
      ],
      tags: ['Essay', 'Adversarial swarm'],
      href: 'creations/value-and-care/',
      cta: 'Read the essay',
    },
    {
      id: 'this-map',
      era: 0.84,
      kind: 'creation',
      kicker: 'Creation',
      title: 'This Map',
      position: at(21, 39, 8),
      radius: 4.4,
      palette: { top: '#2f62c9', earth: '#234a9c', rock: '#172f66', accent: '#ffffff' },
      landmark: 'blueprint',
      body: [
        'The world you are standing in. A technical writer described a feeling, an AI wrote the code, and the two went back and forth until it felt right.',
      ],
      tags: ['Three.js', 'Made in conversation'],
      href: 'creations/this-map/',
      cta: 'See how it was made',
    },
    {
      id: 'plot-1',
      era: 0.84,
      kind: 'plot',
      kicker: 'Open plot',
      title: 'Something will grow here',
      position: at(37, 29, 7.6),
      radius: 3,
      palette: { top: '#e9dcc4', earth: '#dcb991', rock: '#b9a3c4', accent: '#7c6cf0' },
      landmark: 'plot',
      body: ['Reserved for the next thing I make.'],
    },
  ],

  // the order the tour (and the timeline) visits things
  tour: [
    'ssn', 'infosys', 'went-home', 'kibbutz', 'buridan', 'azim-premji', 'isha-vidhya', 'origin-story',
    'technical-writer', 'tailwind', 'formatting-shortcut', 'docs-dashboard', 'docs-swarm',
    'human-needs', 'value-and-care', 'this-map', 'senior-technical-writer', 'frontier',
  ],

  paths: [
    { from: 'ssn', to: 'infosys', style: 'stones' },
    { from: 'infosys', to: 'went-home', style: 'stones' },
    { from: 'went-home', to: 'kibbutz', style: 'stones' },
    { from: 'kibbutz', to: 'buridan', style: 'stones' },
    { from: 'buridan', to: 'azim-premji', style: 'stones' },
    { from: 'azim-premji', to: 'isha-vidhya', style: 'stones' },
    { from: 'isha-vidhya', to: 'origin-story', style: 'stones' },
    { from: 'origin-story', to: 'technical-writer', style: 'stones' },
    { from: 'technical-writer', to: 'senior-technical-writer', style: 'stones' },
    { from: 'senior-technical-writer', to: 'frontier', style: 'stones' },
    { from: 'technical-writer', to: 'tailwind', style: 'stones' },
    { from: 'tailwind', to: 'formatting-shortcut', style: 'light' },
    { from: 'tailwind', to: 'docs-dashboard', style: 'light' },
    { from: 'tailwind', to: 'docs-swarm', style: 'light' },
    { from: 'tailwind', to: 'human-needs', style: 'light' },
    { from: 'tailwind', to: 'value-and-care', style: 'light' },
    { from: 'tailwind', to: 'this-map', style: 'light' },
    { from: 'tailwind', to: 'plot-1', style: 'light' },
  ],
};
