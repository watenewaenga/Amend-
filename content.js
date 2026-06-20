// ===== CONTENT DATA =====

const QUESTIONS = [
  { q:"When pressure rises suddenly, what tends to happen first?", opts:[
    "I react, defend myself or try to take charge.",
    "I become quiet, distant or shut down.",
    "I overthink, scan for problems or predict what may happen.",
    "I try to keep everyone happy or fix the situation.",
    "I go numb, distract myself or disconnect."
  ]},
  { q:"Where do you usually notice pressure first in your body?", opts:[
    "Tight throat or an urge to stop speaking.",
    "Dropping stomach or urgency to reach for connection.",
    "Heat, heaviness or an urge to hide.",
    "Low energy, heaviness or pressure to prove myself.",
    "Clenched jaw, braced shoulders or racing thoughts."
  ]},
  { q:"When that feeling takes over, what do you most often do?", opts:[
    "Shrink, hide or edit what I really think.",
    "Chase, fix or work harder to keep connection.",
    "Attack myself, become defensive or avoid being seen.",
    "Perform, provide or push through so I still feel valuable.",
    "Control, delay or keep thinking until I feel certain."
  ]},
  { q:"In that moment, what does the situation begin to mean about you?", opts:[
    "I am not wanted or accepted.",
    "I am going to be left or forgotten.",
    "Something is wrong with me.",
    "I am not enough unless I prove myself.",
    "If I get this wrong, everything may fall apart."
  ]},
  { q:"When you felt distance or disconnection earlier in life, what helped you cope?", opts:[
    "I became easy, quiet or invisible.",
    "I achieved, helped or tried to be useful.",
    "I became tough and relied on myself.",
    "I tried to keep everyone calm.",
    "I watched closely and stayed one step ahead."
  ]},
  { q:"When someone important to you becomes distant, critical or disappointed, what feels most familiar?", opts:[
    "I assume I am not wanted and pull back.",
    "I worry they will leave and try to repair it immediately.",
    "I feel exposed and become harsh with myself.",
    "I try to do more so I become valuable again.",
    "I defend, explain or take control of the situation."
  ]},
  { q:"When you pull away or shut down, which belief is usually underneath it?", opts:[
    "The real me will not be accepted.",
    "People I love eventually leave.",
    "If people see the truth, they will judge me.",
    "I am only valuable when I am useful or strong.",
    "If I let go of control, everything will fall apart."
  ]},
  { q:"Which need is hardest for you to ask for clearly?", opts:[
    "Acceptance and permission to be fully myself.",
    "Reassurance, presence and dependable connection.",
    "Understanding without being judged or shamed.",
    "Care, rest or support without having to earn it.",
    "Help, stability or permission not to carry everything."
  ]},
  { q:"Which experience of safety feels most important to you right now?", opts:[
    "Knowing I can belong without shrinking.",
    "Knowing someone can stay present and dependable.",
    "Being understood without being reduced to my mistake.",
    "Knowing I am enough before I achieve anything.",
    "Trusting that I can handle uncertainty and imperfection."
  ]},
  { q:"Which statement feels like the one your system most needs to hear today?", opts:[
    "You are allowed to belong and be fully seen.",
    "You do not have to carry this alone. I am staying with you.",
    "You can be understood without being punished or hidden.",
    "You are enough without proving yourself.",
    "You can trust yourself even when you cannot control the outcome."
  ]}
];

// Letter-track to theme mapping (A=Rejection, B=Abandonment, C=Shame, D=Inadequacy, E=Control/Uncertainty)
const THEMES = {
  A: { name:"Rejection", desc:"Being truly seen may quickly feel risky, as if the real you might not be wanted as you are.", traits:["Acceptance","Belonging","Safe visibility"] },
  B: { name:"Abandonment", desc:"Distance or disconnection may quickly create fear that you will be left, forgotten or unsupported.", traits:["Dependability","Presence","Consistency","Reassurance"] },
  C: { name:"Shame", desc:"Mistakes, criticism or exposure may quickly become a judgement about who you are rather than what happened.", traits:["Understanding","Compassion","Respect","Safe visibility"] },
  D: { name:"Inadequacy", desc:"Worth may quietly feel conditional on what you achieve, fix or provide rather than just being.", traits:["Permission to rest","Being enough","Unconditional value"] },
  E: { name:"Control / Uncertainty", desc:"Not knowing what happens next may quickly feel unsafe, creating pressure to predict, manage or carry everything.", traits:["Trust","Steadiness","Letting go"] }
};

function scoreThemes(answers){
  const tally = {A:0,B:0,C:0,D:0,E:0};
  Object.values(answers).forEach(letter=>{ if(tally[letter]!==undefined) tally[letter]++; });
  const sorted = Object.entries(tally).sort((a,b)=>b[1]-a[1]);
  const primaryKey = sorted[0][0];
  const supportingKey = sorted[1][0] !== primaryKey ? sorted[1][0] : sorted[2][0];
  return {
    primary: { key: primaryKey, ...THEMES[primaryKey] },
    supporting: { key: supportingKey, ...THEMES[supportingKey] }
  };
}

const PRACTICES_BY_THEME = {
  C: { title:"Make Room Around the Shame", duration:"5-10 min", rationale:"Staying with the body can reduce the need to hide or punish yourself.",
       steps:["Place one hand where the feeling is strongest.","Breathe around the sensation instead of trying to remove it.","Say: \u201cI can stay with this without attacking myself.\u201d"] },
  B: { title:"Ground Before You Reach Out", duration:"5 min", rationale:"Regulation helps you ask for connection without abandoning your own clarity first.",
       steps:["Feel both feet on the floor and notice three points of contact.","Name one person who has stayed, even briefly.","Say: \u201cI can tolerate the wait without deciding I am already alone.\u201d"] },
  A: { title:"Let Yourself Be Seen, Briefly", duration:"5 min", rationale:"Small, low-stakes visibility builds tolerance for being known.",
       steps:["Notice one true thing about how you feel right now.","Imagine saying it out loud to someone safe.","Say: \u201cBeing seen is not the same as being rejected.\u201d"] },
  D: { title:"Separate Worth From Output", duration:"5-10 min", rationale:"Naming effort instead of results loosens the grip of conditional worth.",
       steps:["Notice one thing you did today, without rating it.","Say: \u201cThis counts even if no one noticed.\u201d","Let your shoulders drop for three breaths."] },
  E: { title:"Practice Not Knowing", duration:"5 min", rationale:"Short, voluntary uncertainty in safe conditions builds tolerance for the real thing.",
       steps:["Pick one small decision today and delay it on purpose.","Notice the urge to resolve it immediately.","Say: \u201cI can be uncertain and still be okay.\u201d"] }
};

const REFRAMES_BY_THEME = {
  C: "FEELING EXPOSED ISN'T THE SAME AS BEING UNSAFE.",
  B: "WAITING ISN'T THE SAME AS BEING LEFT.",
  A: "BEING SEEN ISN'T THE SAME AS BEING REJECTED.",
  D: "RESTING ISN'T THE SAME AS FAILING.",
  E: "NOT KNOWING ISN'T THE SAME AS LOSING CONTROL."
};

const PRACTICE_LIBRARY = [
  { type:"Breathe", title:"Settle before connection", desc:"Regulation helps you ask for connection without abandoning your clarity.", duration:"2 min", intensity:"Gentle" },
  { type:"Meditate", title:"Build your safety story", desc:"Centring safety on purpose makes it more accessible under pressure.", duration:"5-10 min", intensity:"Gentle" },
  { type:"Meditate", title:"Stay with the younger part", desc:"The aim is not to fix the past, but to offer presence and safety now.", duration:"5-10 min", intensity:"Gentle" },
  { type:"Meditate", title:"Notice without fixing", desc:"Awareness without judgement helps you recognise activation sooner.", duration:"10 min", intensity:"Gentle" },
  { type:"Ponder", title:"What did I need?", desc:"Naming the need is the bridge between the moment and a different choice.", duration:"5 min", intensity:"Gentle" },
  { type:"Move", title:"Walk it through", desc:"Movement discharges activation that talking alone can't reach.", duration:"10-20 min", intensity:"Moderate" },
  { type:"Journal", title:"One honest sentence", desc:"You don't need the whole story \u2014 just one true line to start.", duration:"5 min", intensity:"Gentle" },
  { type:"Connect", title:"Ask for one thing", desc:"Practice naming a need out loud to someone safe, even something small.", duration:"5 min", intensity:"Moderate" },
  { type:"Rest", title:"Permission to stop", desc:"Rest without having earned it first.", duration:"10-30 min", intensity:"Gentle" }
];

const DAILY_PROMPTS = [
  { type:"win", label:"Win", prompt:"What did you handle differently today?" },
  { type:"stickingPoint", label:"Sticking point", prompt:"What happened, and what did you need in that moment?" },
  { type:"pattern", label:"Pattern", prompt:"What protection keeps repeating?" },
  { type:"checkIn", label:"Check-in", prompt:"What's the surface moment, and what's the unmet need underneath it?" }
];

const NOTICES = [
  { date:"14 Aug 2026", title:"I Am The Change: Command Your Life", body:"Men's retreat, 14\u201316 August 2026, Elkana Resort, Marysville VIC. Limited spots remaining." },
  { date:"Monthly", title:"Emotional Reset Workshop", body:"3-hour live Zoom workshop. Next session opening soon \u2014 check the shop for dates." },
  { date:"Ongoing", title:"12-Week Emotional Leadership Program", body:"New cohorts open periodically. Ask about joining the next intake." }
];

const REWARD_CATALOGUE = [
  { name:"Amend Co. Hoodie", cost:500 },
  { name:"15% off your next workshop", cost:200 },
  { name:"Free Emotional Reset Workbook (digital)", cost:150 }
];
