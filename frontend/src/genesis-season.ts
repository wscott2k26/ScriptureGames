export type FactionId = 'lionguard' | 'dovebound' | 'torchbearers';

export type Faction = {
  id: FactionId;
  name: string;
  motto: string;
  description: string;
  icon: string;
  virtue: string;
  accent: string;
  softAccent: string;
};

export type GenesisQuestion = {
  q: string;
  options: [string, string, string, string];
  answer: number;
  reference: string;
  explanation: string;
};

export type GenesisTrial = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  chapter: string;
  icon: string;
  virtue: string;
  story: string;
  prompt: string;
  choices: [
    { id: string; label: string; detail: string },
    { id: string; label: string; detail: string },
  ];
  xp: number;
  manna: number;
  background: number;
  questions: GenesisQuestion[];
};

export const FACTIONS: Faction[] = [
  {
    id: 'lionguard',
    name: 'Lionguard',
    motto: 'Stand brave. Speak truth.',
    description: 'For players who meet every trial with courage, conviction, and a steady heart.',
    icon: '🦁',
    virtue: 'Courage',
    accent: '#E9B949',
    softAccent: 'rgba(233,185,73,0.18)',
  },
  {
    id: 'dovebound',
    name: 'Dovebound',
    motto: 'Walk wise. Choose mercy.',
    description: 'For players who value wisdom, peace, discernment, and compassionate strength.',
    icon: '🕊️',
    virtue: 'Wisdom',
    accent: '#8DD8E8',
    softAccent: 'rgba(141,216,232,0.18)',
  },
  {
    id: 'torchbearers',
    name: 'Torchbearers',
    motto: 'Keep faith. Endure the night.',
    description: 'For players who carry hope through uncertainty and refuse to quit when the road grows dark.',
    icon: '🔥',
    virtue: 'Endurance',
    accent: '#FF8A5C',
    softAccent: 'rgba(255,138,92,0.18)',
  },
];

export const GENESIS_BACKGROUNDS = {
  opening: require('../assets/images/genesis/opening.jpg'),
  'trial-01': require('../assets/images/genesis/trial-01.jpg'),
  'trial-02': require('../assets/images/genesis/trial-02.jpg'),
  'trial-03': require('../assets/images/genesis/trial-03.jpg'),
  'trial-04': require('../assets/images/genesis/trial-04.jpg'),
  'trial-05': require('../assets/images/genesis/trial-05.jpg'),
  'trial-06': require('../assets/images/genesis/trial-06.jpg'),
  'trial-07': require('../assets/images/genesis/trial-07.jpg'),
  'trial-08': require('../assets/images/genesis/trial-08.jpg'),
  'trial-09': require('../assets/images/genesis/trial-09.jpg'),
  'trial-10': require('../assets/images/genesis/trial-10.jpg'),
} as const;

const q = (
  question: string,
  options: [string, string, string, string],
  answer: number,
  reference: string,
  explanation: string,
): GenesisQuestion => ({ q: question, options, answer, reference, explanation });

export const GENESIS_TRIALS: GenesisTrial[] = [
  {
    id: 'trial-01', number: 1, title: 'Let There Be Light', subtitle: 'Creation and sacred order',
    chapter: 'Genesis 1–2', icon: '✦', virtue: 'Wonder', xp: 60, manna: 40,
    background: GENESIS_BACKGROUNDS['trial-01'],
    story: 'Before there were borders, crowns, or cities, darkness covered the deep. Then God spoke. Light answered. Seas gathered, land rose, and life filled the world. Your first trial begins where every story begins: with the voice that brings order from chaos.',
    prompt: 'The arena is dark. A single beam appears ahead. How will you enter the first trial?',
    choices: [
      { id: 'observe', label: 'Enter with wonder', detail: 'Slow down, notice the order, and remember who spoke it into being.' },
      { id: 'advance', label: 'Step into the light', detail: 'Move forward with courage, trusting that God’s word makes a path.' },
    ],
    questions: [
      q('What did God create on the first day?', ['Light', 'The sun', 'Animals', 'Human beings'], 0, 'Genesis 1:3–5', 'God called light into the darkness on the first day.'),
      q('What separated the waters above from the waters below?', ['A mountain', 'The expanse', 'A wall of fire', 'The moon'], 1, 'Genesis 1:6–8', 'God made the expanse, or sky, to separate the waters.'),
      q('On which day were the sun, moon, and stars appointed?', ['Second', 'Third', 'Fourth', 'Sixth'], 2, 'Genesis 1:14–19', 'The greater and lesser lights were appointed on the fourth day.'),
      q('In whose image were human beings created?', ['The angels’ image', 'God’s image', 'The animals’ image', 'The earth’s image'], 1, 'Genesis 1:26–27', 'Genesis says humanity was made in the image of God.'),
      q('What did God do on the seventh day?', ['Created birds', 'Named the animals', 'Rested from his work', 'Made the garden'], 2, 'Genesis 2:2–3', 'God rested and blessed the seventh day.'),
      q('From what was Adam formed?', ['Stone', 'Dust from the ground', 'Water', 'A tree'], 1, 'Genesis 2:7', 'God formed the man from the dust and breathed life into him.'),
    ],
  },
  {
    id: 'trial-02', number: 2, title: 'The Garden Gate', subtitle: 'Trust, freedom, and temptation',
    chapter: 'Genesis 2–3', icon: '❧', virtue: 'Discernment', xp: 65, manna: 45,
    background: GENESIS_BACKGROUNDS['trial-02'],
    story: 'Eden is beautiful, but beauty does not remove the need for trust. A command has been given, a voice twists the truth, and a choice waits beneath the branches. This trial is not only about remembering what happened. It is about learning how deception works.',
    prompt: 'Two paths curl through the garden. One is loud and glittering. The other is quiet and clear. Which do you follow?',
    choices: [
      { id: 'truth', label: 'Hold to the command', detail: 'Test every voice against what God actually said.' },
      { id: 'counsel', label: 'Seek wise counsel', detail: 'Refuse isolation and bring the choice into trustworthy light.' },
    ],
    questions: [
      q('Where did God place the first man?', ['Jerusalem', 'The garden of Eden', 'Canaan', 'Mount Sinai'], 1, 'Genesis 2:8', 'Adam was placed in the garden of Eden.'),
      q('Which tree was Adam told not to eat from?', ['The tree of life', 'The olive tree', 'The tree of the knowledge of good and evil', 'The fig tree'], 2, 'Genesis 2:16–17', 'God prohibited eating from the tree of the knowledge of good and evil.'),
      q('How did the serpent challenge God’s command?', ['By quoting Moses', 'By questioning and contradicting it', 'By remaining silent', 'By calling Adam'], 1, 'Genesis 3:1–5', 'The serpent questioned God’s words and denied the stated consequence.'),
      q('What did Adam and Eve do after realizing they were naked?', ['Built an altar', 'Made coverings from fig leaves', 'Left Eden immediately', 'Called their children'], 1, 'Genesis 3:7', 'They sewed fig leaves together to make coverings.'),
      q('What did Adam and Eve do when they heard God in the garden?', ['Ran toward him', 'Hid among the trees', 'Fell asleep', 'Built a tower'], 1, 'Genesis 3:8', 'They hid from God among the trees.'),
      q('What guarded the way to the tree of life after the exile?', ['A river', 'Cherubim and a flaming sword', 'A stone wall', 'An army'], 1, 'Genesis 3:24', 'Cherubim and a flaming sword guarded the way.'),
    ],
  },
  {
    id: 'trial-03', number: 3, title: 'The Brother’s Field', subtitle: 'Anger, worship, and responsibility',
    chapter: 'Genesis 4–5', icon: '⚒', virtue: 'Self-control', xp: 70, manna: 50,
    background: GENESIS_BACKGROUNDS['trial-03'],
    story: 'Outside Eden, two brothers bring offerings. One heart turns angry, and God warns that sin is crouching at the door. The warning is clear, but Cain must decide whether anger will become his master. The field remembers what follows.',
    prompt: 'A spark of anger rises. The trial asks what happens before the spark becomes a fire.',
    choices: [
      { id: 'master', label: 'Master the anger', detail: 'Name it honestly, listen to correction, and choose what is right.' },
      { id: 'reconcile', label: 'Move toward your brother', detail: 'Break isolation before resentment writes the next scene.' },
    ],
    questions: [
      q('What work did Abel do?', ['Farmer of grain', 'Keeper of sheep', 'Builder of cities', 'Maker of tents'], 1, 'Genesis 4:2', 'Abel kept flocks, while Cain worked the ground.'),
      q('What work did Cain do?', ['Worked the ground', 'Kept sheep', 'Built the ark', 'Served Pharaoh'], 0, 'Genesis 4:2', 'Cain cultivated the ground.'),
      q('What did God warn was crouching at Cain’s door?', ['A lion', 'Sin', 'A flood', 'An angel'], 1, 'Genesis 4:7', 'God warned Cain that sin was crouching at the door and must be mastered.'),
      q('What question did Cain ask after Abel’s death?', ['Where is Eden?', 'Am I my brother’s keeper?', 'Who built this altar?', 'Why is the ground dry?'], 1, 'Genesis 4:9', 'Cain asked, “Am I my brother’s keeper?”'),
      q('What cried out from the ground?', ['Abel’s blood', 'Cain’s crops', 'The river', 'A trumpet'], 0, 'Genesis 4:10', 'God said Abel’s blood cried out from the ground.'),
      q('Who was born to Adam and Eve after Abel?', ['Seth', 'Noah', 'Enoch', 'Lamech'], 0, 'Genesis 4:25', 'Eve gave birth to Seth after Abel’s death.'),
    ],
  },
  {
    id: 'trial-04', number: 4, title: 'Waters Rising', subtitle: 'Obedience before the rain',
    chapter: 'Genesis 6–8', icon: '⌁', virtue: 'Obedience', xp: 75, manna: 55,
    background: GENESIS_BACKGROUNDS['trial-04'],
    story: 'The world has grown violent, but Noah finds favor with God. He receives instructions for a vessel larger than anything his neighbors understand. The true test begins long before the first drop falls: will Noah obey while the sky is still clear?',
    prompt: 'The horizon is calm, but the command is urgent. What anchors your next move?',
    choices: [
      { id: 'build', label: 'Build before the rain', detail: 'Obey faithfully even when the evidence has not arrived yet.' },
      { id: 'prepare', label: 'Prepare every detail', detail: 'Honor the mission through patient, careful stewardship.' },
    ],
    questions: [
      q('Why was the flood judgment announced?', ['The earth was filled with violence', 'There were too few cities', 'No one could farm', 'The animals had left'], 0, 'Genesis 6:11–13', 'Genesis describes the earth as corrupt and filled with violence.'),
      q('What material was Noah told to use for the ark?', ['Cedar', 'Gopher wood', 'Stone', 'Iron'], 1, 'Genesis 6:14', 'Noah was instructed to make the ark from gopher wood.'),
      q('Who entered the ark with Noah?', ['Only Noah', 'Noah’s household and the animals', 'All nearby kings', 'Only the birds'], 1, 'Genesis 7:7–9', 'Noah, his family, and the appointed animals entered the ark.'),
      q('How long did the rain fall?', ['Seven days', 'Twelve days', 'Forty days and nights', 'One year'], 2, 'Genesis 7:12', 'Rain fell for forty days and forty nights.'),
      q('Which bird returned with a freshly plucked olive leaf?', ['Raven', 'Dove', 'Eagle', 'Sparrow'], 1, 'Genesis 8:11', 'The dove returned with an olive leaf.'),
      q('What did Noah build after leaving the ark?', ['A tower', 'An altar', 'A palace', 'A city gate'], 1, 'Genesis 8:20', 'Noah built an altar and offered sacrifices.'),
    ],
  },
  {
    id: 'trial-05', number: 5, title: 'The Covenant Sky', subtitle: 'Promise, pride, and scattered nations',
    chapter: 'Genesis 9–11', icon: '◒', virtue: 'Humility', xp: 80, manna: 60,
    background: GENESIS_BACKGROUNDS['trial-05'],
    story: 'A rainbow bends across the cleansed sky as a sign of covenant. Generations later, people gather to build a city and a tower for their own name. One scene remembers God’s promise; the other exposes human pride. The trial asks which name truly deserves the glory.',
    prompt: 'A brilliant city rises below the covenant sky. Which truth keeps ambition from becoming pride?',
    choices: [
      { id: 'remember', label: 'Remember the covenant', detail: 'Let God’s faithfulness shape what you build and why.' },
      { id: 'humble', label: 'Choose humility', detail: 'Refuse to make personal fame the foundation of the work.' },
    ],
    questions: [
      q('What sign did God place in the clouds after the flood?', ['A pillar of fire', 'A rainbow', 'A star', 'A mountain'], 1, 'Genesis 9:12–17', 'The rainbow was given as the sign of the covenant.'),
      q('What command was repeated to Noah’s family?', ['Build one city', 'Be fruitful and multiply', 'Return to Eden', 'Travel to Egypt'], 1, 'Genesis 9:1', 'God told Noah’s family to be fruitful and multiply.'),
      q('What did the people at Babel want to make for themselves?', ['A name', 'An ark', 'A covenant', 'A new garden'], 0, 'Genesis 11:4', 'They wanted to make a name for themselves.'),
      q('What did God confuse at Babel?', ['Their roads', 'Their language', 'Their memories', 'Their crops'], 1, 'Genesis 11:7–9', 'God confused their language so they could not understand one another.'),
      q('What happened to the people after Babel?', ['They were scattered', 'They entered the ark', 'They became one family in Egypt', 'They returned to Eden'], 0, 'Genesis 11:8–9', 'They were scattered over the face of the earth.'),
      q('From whose family line does Abram appear?', ['Shem’s line', 'Ham’s line only', 'Cain’s city', 'Pharaoh’s house'], 0, 'Genesis 11:10–26', 'Abram is introduced within the genealogy of Shem.'),
    ],
  },
  {
    id: 'trial-06', number: 6, title: 'Call of the Unknown', subtitle: 'Abram leaves what is familiar',
    chapter: 'Genesis 12–17', icon: '✧', virtue: 'Faith', xp: 90, manna: 70,
    background: GENESIS_BACKGROUNDS['trial-06'],
    story: 'Abram is called away from country, relatives, and familiar ground toward a land God will show him. The promise is enormous, but the route is not fully explained. Faith begins with a departure and grows through imperfect steps.',
    prompt: 'The map ends at the edge of the known world. What do you carry beyond it?',
    choices: [
      { id: 'trust', label: 'Trust the promise', detail: 'Take the next faithful step without demanding the entire route.' },
      { id: 'altar', label: 'Mark the journey', detail: 'Pause to worship and remember who called you.' },
    ],
    questions: [
      q('What did God tell Abram to leave?', ['Only his tent', 'His country, relatives, and father’s household', 'Egypt', 'The ark'], 1, 'Genesis 12:1', 'Abram was called to leave his country and family setting.'),
      q('What did God promise to make of Abram?', ['A great nation', 'A shipbuilder', 'A king of Egypt', 'A tower'], 0, 'Genesis 12:2', 'God promised to make Abram into a great nation.'),
      q('What did Abram build after God appeared near Shechem?', ['An altar', 'A palace', 'A prison', 'A tower'], 0, 'Genesis 12:7', 'Abram built an altar to the Lord.'),
      q('Who chose the well-watered plain near Sodom?', ['Lot', 'Isaac', 'Joseph', 'Noah'], 0, 'Genesis 13:10–12', 'Lot chose the Jordan plain and moved near Sodom.'),
      q('What was counted to Abram as righteousness?', ['His wealth', 'His belief in God’s promise', 'His age', 'His journey to Egypt'], 1, 'Genesis 15:6', 'Abram believed the Lord, and it was counted to him as righteousness.'),
      q('What new name was given to Abram?', ['Abraham', 'Israel', 'Edom', 'Judah'], 0, 'Genesis 17:5', 'Abram was renamed Abraham, linked to the promise of many nations.'),
    ],
  },
  {
    id: 'trial-07', number: 7, title: 'The Mountain of Promise', subtitle: 'Hospitality, intercession, and testing',
    chapter: 'Genesis 18–22', icon: '△', virtue: 'Surrender', xp: 100, manna: 80,
    background: GENESIS_BACKGROUNDS['trial-07'],
    story: 'Visitors arrive beneath the trees of Mamre, and the impossible promise is spoken again. Abraham later pleads for a city and eventually climbs a mountain carrying the son of promise. These chapters hold laughter, judgment, mercy, and costly trust together.',
    prompt: 'At the mountain’s base, the promise and the test seem to collide. What truth leads you upward?',
    choices: [
      { id: 'provide', label: 'God will provide', detail: 'Climb with trust that the Giver is faithful to his character.' },
      { id: 'surrender', label: 'Release control', detail: 'Place even the dearest promise back into God’s hands.' },
    ],
    questions: [
      q('What did Sarah do when she heard she would have a son?', ['She laughed', 'She ran away', 'She built an altar', 'She went to Egypt'], 0, 'Genesis 18:12', 'Sarah laughed at the announcement because of her age.'),
      q('For which city did Abraham intercede?', ['Nineveh', 'Sodom', 'Jericho', 'Bethlehem'], 1, 'Genesis 18:22–33', 'Abraham pleaded concerning Sodom.'),
      q('What was the name of Abraham and Sarah’s promised son?', ['Ishmael', 'Isaac', 'Jacob', 'Joseph'], 1, 'Genesis 21:1–3', 'Sarah bore Isaac, the promised son.'),
      q('What does the name Isaac connect with in the story?', ['Laughter', 'Rain', 'Victory', 'Stone'], 0, 'Genesis 21:6', 'Sarah spoke of laughter when Isaac was born.'),
      q('What did Abraham say God would provide on the mountain?', ['A city', 'The lamb for the offering', 'A crown', 'A river'], 1, 'Genesis 22:8', 'Abraham said God would provide the lamb.'),
      q('What animal was provided in place of Isaac?', ['A ram', 'A dove', 'A calf', 'A lion'], 0, 'Genesis 22:13', 'A ram caught in a thicket was offered instead.'),
    ],
  },
  {
    id: 'trial-08', number: 8, title: 'Wells and Wrestling', subtitle: 'Isaac, Jacob, and a changed name',
    chapter: 'Genesis 24–33', icon: '⌘', virtue: 'Transformation', xp: 110, manna: 90,
    background: GENESIS_BACKGROUNDS['trial-08'],
    story: 'A servant searches for a wife for Isaac, twins struggle before birth, and Jacob spends years running, bargaining, and learning. On the night before meeting Esau again, Jacob wrestles until daybreak and leaves with a limp, a blessing, and a new name.',
    prompt: 'Dawn is breaking after a long struggle. What do you refuse to carry into the next chapter?',
    choices: [
      { id: 'release', label: 'Release the old identity', detail: 'Let truth replace the name shaped by fear and grasping.' },
      { id: 'reconcile', label: 'Walk toward reconciliation', detail: 'Face the relationship you once fled with humility.' },
    ],
    questions: [
      q('Who became Isaac’s wife?', ['Rachel', 'Rebekah', 'Leah', 'Tamar'], 1, 'Genesis 24:67', 'Rebekah became Isaac’s wife.'),
      q('What were the names of Isaac and Rebekah’s twin sons?', ['Cain and Abel', 'Jacob and Esau', 'Joseph and Benjamin', 'Moses and Aaron'], 1, 'Genesis 25:24–26', 'The twins were Esau and Jacob.'),
      q('What did Esau sell to Jacob?', ['His flock', 'His birthright', 'His tent', 'His sword'], 1, 'Genesis 25:29–34', 'Esau sold his birthright for a meal.'),
      q('What did Jacob see in his dream at Bethel?', ['An ark', 'A stairway reaching heaven', 'A burning bush', 'A chariot'], 1, 'Genesis 28:12', 'Jacob dreamed of a stairway between earth and heaven.'),
      q('Which sister did Jacob marry first?', ['Rachel', 'Leah', 'Rebekah', 'Dinah'], 1, 'Genesis 29:23–25', 'Laban gave Leah to Jacob before Rachel.'),
      q('What new name was Jacob given after wrestling?', ['Abraham', 'Israel', 'Ephraim', 'Judah'], 1, 'Genesis 32:28', 'Jacob received the name Israel.'),
    ],
  },
  {
    id: 'trial-09', number: 9, title: 'Dreams in the Pit', subtitle: 'Joseph from betrayal to authority',
    chapter: 'Genesis 37–45', icon: '♢', virtue: 'Integrity', xp: 125, manna: 105,
    background: GENESIS_BACKGROUNDS['trial-09'],
    story: 'Joseph’s dreams make his brothers burn with jealousy. A coat is torn, a pit opens, and slavery carries him far from home. Yet in the house, prison, and palace, Joseph’s gifts and character keep unfolding. The dream survives the pit.',
    prompt: 'Power is finally in your hands, and the people who wounded you stand before you. What governs your response?',
    choices: [
      { id: 'wisdom', label: 'Test with wisdom', detail: 'Seek truth and changed character before revealing everything.' },
      { id: 'mercy', label: 'Prepare for mercy', detail: 'Refuse revenge and make room for restoration.' },
    ],
    questions: [
      q('What special gift did Jacob give Joseph?', ['A crown', 'A richly ornamented robe', 'A sword', 'A ring'], 1, 'Genesis 37:3', 'Jacob gave Joseph a special robe.'),
      q('What did Joseph’s dreams suggest?', ['His family would bow before him', 'He would build an ark', 'He would become a shepherd only', 'He would leave Egypt immediately'], 0, 'Genesis 37:5–11', 'The dreams pictured his family bowing before him.'),
      q('Where did Joseph’s brothers place him before selling him?', ['A tower', 'A pit or cistern', 'A prison in Egypt', 'A boat'], 1, 'Genesis 37:24', 'They threw Joseph into an empty cistern.'),
      q('In whose house did Joseph serve in Egypt?', ['Potiphar’s', 'Pharaoh’s son’s', 'Moses’', 'Laban’s'], 0, 'Genesis 39:1', 'Joseph was sold to Potiphar.'),
      q('What did Pharaoh’s dreams warn about?', ['Seven years of plenty followed by seven years of famine', 'A coming flood', 'A tower falling', 'A battle with Canaan'], 0, 'Genesis 41:25–32', 'The dreams announced years of abundance followed by famine.'),
      q('What position did Pharaoh give Joseph?', ['Chief cupbearer', 'Authority over Egypt under Pharaoh', 'Captain of the ark', 'Priest at Bethel'], 1, 'Genesis 41:39–44', 'Joseph was placed over Egypt, second only to Pharaoh.'),
    ],
  },
  {
    id: 'trial-10', number: 10, title: 'The Final Genesis Trial', subtitle: 'Providence, forgiveness, and legacy',
    chapter: 'Genesis 45–50', icon: '✺', virtue: 'Providence', xp: 175, manna: 150,
    background: GENESIS_BACKGROUNDS['trial-10'],
    story: 'Joseph reveals himself, a family is preserved through famine, and Jacob’s household enters Egypt. Near the end, old fear returns—but Joseph sees a larger story: human evil did not have the final word. Genesis closes with promises still moving forward.',
    prompt: 'The final gate opens only when you can see beyond one painful chapter. What truth do you carry through?',
    choices: [
      { id: 'providence', label: 'See the larger story', detail: 'Trust that God can work through what others intended for harm.' },
      { id: 'forgive', label: 'Choose forgiveness', detail: 'Release revenge while honoring truth, wisdom, and responsibility.' },
    ],
    questions: [
      q('How did Joseph identify himself to his brothers?', ['As an Egyptian stranger only', 'As Joseph, their brother', 'As Pharaoh', 'As Benjamin'], 1, 'Genesis 45:1–4', 'Joseph revealed that he was their brother.'),
      q('How did Joseph interpret his arrival in Egypt?', ['Only as an accident', 'As God sending him ahead to preserve life', 'As proof the dreams were false', 'As a reason for revenge'], 1, 'Genesis 45:5–8', 'Joseph saw God’s preserving purpose at work.'),
      q('Where did Jacob’s family settle in Egypt?', ['Goshen', 'Jericho', 'Babel', 'Eden'], 0, 'Genesis 47:5–6', 'They settled in the region of Goshen.'),
      q('Which younger son of Joseph received Jacob’s greater blessing?', ['Manasseh', 'Ephraim', 'Reuben', 'Benjamin'], 1, 'Genesis 48:13–20', 'Jacob crossed his hands and gave the greater blessing to Ephraim.'),
      q('What did Joseph say his brothers intended against him?', ['Good', 'Harm or evil', 'A covenant', 'A journey'], 1, 'Genesis 50:20', 'Joseph acknowledged that they intended harm.'),
      q('What did Joseph say God intended through those events?', ['To preserve many lives', 'To destroy Egypt', 'To rebuild Babel', 'To return everyone to Eden'], 0, 'Genesis 50:20', 'Joseph said God intended it for good, to preserve many people.'),
      q('Which theme reaches across the whole Genesis season?', ['God remains faithful through human failure', 'Human plans always succeed unchanged', 'Only kings receive promises', 'Families never face conflict'], 0, 'Genesis 1–50', 'Genesis repeatedly shows divine faithfulness continuing through human weakness and conflict.'),
      q('Where does Genesis end geographically?', ['In Egypt', 'In Eden', 'At Mount Sinai', 'In Jerusalem'], 0, 'Genesis 50:26', 'Genesis ends with Joseph’s death in Egypt and the promise still awaiting fulfillment.'),
    ],
  },
];

export function getTrial(id: string | undefined): GenesisTrial | undefined {
  return GENESIS_TRIALS.find((trial) => trial.id === id);
}

export function getFaction(id: string | undefined): Faction | undefined {
  return FACTIONS.find((faction) => faction.id === id);
}

export function rankFor(points: number): { name: string; floor: number; next: number } {
  if (points >= 900) return { name: 'Genesis Champion', floor: 900, next: 1000 };
  if (points >= 650) return { name: 'Covenant Keeper', floor: 650, next: 900 };
  if (points >= 400) return { name: 'Trial Vanguard', floor: 400, next: 650 };
  if (points >= 200) return { name: 'Word Bearer', floor: 200, next: 400 };
  if (points >= 80) return { name: 'Pathfinder', floor: 80, next: 200 };
  return { name: 'Newly Called', floor: 0, next: 80 };
}
