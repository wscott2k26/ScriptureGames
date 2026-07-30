// Generated from backend/seed_data.py.
// Run `python scripts/generate-content.py` after editing the seed content.

export const JOURNEY_NODES = [
  {
    "id": "node-1",
    "title": "Creation",
    "subtitle": "In the Beginning",
    "icon": "sun",
    "xp_reward": 10,
    "kind": "quiz",
    "topic": "creation"
  },
  {
    "id": "node-2",
    "title": "Adam & Eve",
    "subtitle": "The Garden of Eden",
    "icon": "leaf",
    "xp_reward": 15,
    "kind": "story",
    "topic": "adam_eve"
  },
  {
    "id": "node-3",
    "title": "Noah's Ark",
    "subtitle": "The Great Flood",
    "icon": "boat",
    "xp_reward": 20,
    "kind": "quiz",
    "topic": "noah"
  },
  {
    "id": "node-4",
    "title": "Abraham",
    "subtitle": "Father of Nations",
    "icon": "star",
    "xp_reward": 20,
    "kind": "verse",
    "topic": "abraham"
  },
  {
    "id": "node-5",
    "title": "Joseph",
    "subtitle": "The Dreamer",
    "icon": "moon",
    "xp_reward": 25,
    "kind": "story",
    "topic": "joseph"
  },
  {
    "id": "node-6",
    "title": "Moses",
    "subtitle": "The Exodus",
    "icon": "flame",
    "xp_reward": 30,
    "kind": "quiz",
    "topic": "moses"
  },
  {
    "id": "node-7",
    "title": "David & Goliath",
    "subtitle": "Faith Over Fear",
    "icon": "shield",
    "xp_reward": 30,
    "kind": "puzzle",
    "topic": "david"
  },
  {
    "id": "node-8",
    "title": "Daniel",
    "subtitle": "In the Lion's Den",
    "icon": "paw",
    "xp_reward": 35,
    "kind": "story",
    "topic": "daniel"
  },
  {
    "id": "node-9",
    "title": "Jesus is Born",
    "subtitle": "The Nativity",
    "icon": "gift",
    "xp_reward": 40,
    "kind": "quiz",
    "topic": "nativity"
  },
  {
    "id": "node-10",
    "title": "The Resurrection",
    "subtitle": "He is Risen!",
    "icon": "trophy",
    "xp_reward": 50,
    "kind": "quiz",
    "topic": "resurrection"
  }
] as const;

export const QUIZ_QUESTIONS = {
  "creation": [
    {
      "q": "On which day did God create light?",
      "options": [
        "First",
        "Second",
        "Third",
        "Seventh"
      ],
      "answer": 0,
      "verse": "Genesis 1:3",
      "difficulty": 1
    },
    {
      "q": "How many days did God take to create the world?",
      "options": [
        "3",
        "6",
        "7",
        "12"
      ],
      "answer": 1,
      "verse": "Genesis 1",
      "difficulty": 1
    },
    {
      "q": "What did God do on the seventh day?",
      "options": [
        "Made stars",
        "Rested",
        "Made humans",
        "Made rain"
      ],
      "answer": 1,
      "verse": "Genesis 2:2",
      "difficulty": 1
    },
    {
      "q": "What did God create on the fourth day?",
      "options": [
        "Fish",
        "Sun, moon and stars",
        "Land animals",
        "Plants"
      ],
      "answer": 1,
      "verse": "Genesis 1:16",
      "difficulty": 2
    },
    {
      "q": "From what was the first man formed?",
      "options": [
        "Water",
        "Fire",
        "Dust of the ground",
        "Clay pot"
      ],
      "answer": 2,
      "verse": "Genesis 2:7",
      "difficulty": 2
    },
    {
      "q": "What did God create on the fifth day?",
      "options": [
        "Plants",
        "Fish and birds",
        "Land animals",
        "Man"
      ],
      "answer": 1,
      "verse": "Genesis 1:20-23",
      "difficulty": 2
    },
    {
      "q": "What was the name of the garden God placed Adam in?",
      "options": [
        "Gethsemane",
        "Eden",
        "Sinai",
        "Canaan"
      ],
      "answer": 1,
      "verse": "Genesis 2:8",
      "difficulty": 2
    },
    {
      "q": "From what did God make Eve?",
      "options": [
        "A rib of Adam",
        "Clay",
        "A tree",
        "A stone"
      ],
      "answer": 0,
      "verse": "Genesis 2:22",
      "difficulty": 2
    },
    {
      "q": "Which four rivers flowed out of Eden?",
      "options": [
        "Nile, Tigris, Jordan, Euphrates",
        "Pishon, Gihon, Tigris, Euphrates",
        "Jordan, Nile, Ganges, Euphrates",
        "Pison, Nile, Tigris, Congo"
      ],
      "answer": 1,
      "verse": "Genesis 2:11-14",
      "difficulty": 3
    },
    {
      "q": "What phrase appears repeatedly as God looks at creation?",
      "options": [
        "'It is holy'",
        "'It was good'",
        "'It is complete'",
        "'It is finished'"
      ],
      "answer": 1,
      "verse": "Genesis 1",
      "difficulty": 2
    },
    {
      "q": "In whose image did God create humankind?",
      "options": [
        "The angels'",
        "The earth's",
        "His own image",
        "The heavens'"
      ],
      "answer": 2,
      "verse": "Genesis 1:27",
      "difficulty": 1
    },
    {
      "q": "Which tree were Adam and Eve commanded not to eat from?",
      "options": [
        "Tree of the Knowledge of Good and Evil",
        "Tree of Life",
        "Olive Tree",
        "Fig Tree"
      ],
      "answer": 0,
      "verse": "Genesis 2:16-17",
      "difficulty": 3
    }
  ],
  "noah": [
    {
      "q": "How many of each unclean animal kind did Noah bring aboard?",
      "options": [
        "One animal",
        "One pair",
        "Seven pairs",
        "Ten animals"
      ],
      "answer": 1,
      "verse": "Genesis 7:2",
      "difficulty": 1
    },
    {
      "q": "How many days and nights did it rain?",
      "options": [
        "7",
        "12",
        "40",
        "100"
      ],
      "answer": 2,
      "verse": "Genesis 7:12",
      "difficulty": 1
    },
    {
      "q": "What did God place in the sky as a promise?",
      "options": [
        "A star",
        "A cloud",
        "A rainbow",
        "The sun"
      ],
      "answer": 2,
      "verse": "Genesis 9:13",
      "difficulty": 1
    },
    {
      "q": "What bird finally brought Noah an olive leaf?",
      "options": [
        "Raven",
        "Eagle",
        "Sparrow",
        "Dove"
      ],
      "answer": 3,
      "verse": "Genesis 8:11",
      "difficulty": 2
    },
    {
      "q": "Of clean animals, how many did Noah take on board?",
      "options": [
        "1 pair",
        "2 pairs",
        "7 pairs",
        "12 pairs"
      ],
      "answer": 2,
      "verse": "Genesis 7:2",
      "difficulty": 2
    },
    {
      "q": "How old was Noah when the flood came?",
      "options": [
        "100",
        "400",
        "500",
        "600"
      ],
      "answer": 3,
      "verse": "Genesis 7:6",
      "difficulty": 3
    },
    {
      "q": "In what region did the ark come to rest?",
      "options": [
        "The mountains of Sinai",
        "The mountains of Ararat",
        "The hills of Zion",
        "The plains of Moab"
      ],
      "answer": 1,
      "verse": "Genesis 8:4",
      "difficulty": 2
    },
    {
      "q": "What was Noah's ark made from?",
      "options": [
        "Cedar",
        "Cypress (gopher) wood",
        "Oak",
        "Stone"
      ],
      "answer": 1,
      "verse": "Genesis 6:14",
      "difficulty": 3
    },
    {
      "q": "How many other people entered the ark with Noah?",
      "options": [
        "3",
        "5",
        "7",
        "12"
      ],
      "answer": 2,
      "verse": "Genesis 7:13",
      "difficulty": 2
    },
    {
      "q": "What were Noah's three sons named?",
      "options": [
        "Shem, Ham and Japheth",
        "Cain, Abel and Seth",
        "Isaac, Jacob and Esau",
        "Peter, James and John"
      ],
      "answer": 0,
      "verse": "Genesis 6:10",
      "difficulty": 2
    },
    {
      "q": "What bird did Noah send out first?",
      "options": [
        "Dove",
        "Sparrow",
        "Raven",
        "Eagle"
      ],
      "answer": 2,
      "verse": "Genesis 8:7",
      "difficulty": 2
    }
  ],
  "moses": [
    {
      "q": "In what was baby Moses placed among the reeds by the Nile?",
      "options": [
        "A boat",
        "A basket",
        "A log",
        "A jar"
      ],
      "answer": 1,
      "verse": "Exodus 2:3",
      "difficulty": 1
    },
    {
      "q": "How many plagues struck Egypt?",
      "options": [
        "5",
        "7",
        "10",
        "12"
      ],
      "answer": 2,
      "verse": "Exodus 7-12",
      "difficulty": 1
    },
    {
      "q": "What body of water—often called the Red Sea—did God part for the Israelites?",
      "options": [
        "Red Sea (Sea of Reeds)",
        "Dead Sea",
        "Sea of Galilee",
        "Mediterranean Sea"
      ],
      "answer": 0,
      "verse": "Exodus 14:21",
      "difficulty": 1
    },
    {
      "q": "How many commands are known together as the Ten Commandments?",
      "options": [
        "5",
        "7",
        "10",
        "12"
      ],
      "answer": 2,
      "verse": "Exodus 20",
      "difficulty": 1
    },
    {
      "q": "What did God speak to Moses through in the desert?",
      "options": [
        "A cloud",
        "A burning bush",
        "An angel",
        "Thunder"
      ],
      "answer": 1,
      "verse": "Exodus 3:2",
      "difficulty": 2
    },
    {
      "q": "Who was Moses' older brother?",
      "options": [
        "Aaron",
        "Miriam",
        "Joshua",
        "Caleb"
      ],
      "answer": 0,
      "verse": "Exodus 4:14",
      "difficulty": 2
    },
    {
      "q": "What was the very first plague?",
      "options": [
        "Frogs",
        "Water turned to blood",
        "Locusts",
        "Darkness"
      ],
      "answer": 1,
      "verse": "Exodus 7:20",
      "difficulty": 2
    },
    {
      "q": "What was the last plague?",
      "options": [
        "Boils",
        "Hail",
        "Death of the firstborn",
        "Locusts"
      ],
      "answer": 2,
      "verse": "Exodus 12:29",
      "difficulty": 2
    },
    {
      "q": "How long did the Israelites wander in the wilderness?",
      "options": [
        "7 years",
        "12 years",
        "40 years",
        "70 years"
      ],
      "answer": 2,
      "verse": "Numbers 14:33",
      "difficulty": 2
    },
    {
      "q": "On what mountain did Moses receive the Law?",
      "options": [
        "Ararat",
        "Sinai",
        "Zion",
        "Carmel"
      ],
      "answer": 1,
      "verse": "Exodus 19:20",
      "difficulty": 2
    },
    {
      "q": "What food did God provide for Israel in the wilderness?",
      "options": [
        "Bread and figs",
        "Manna and quail",
        "Fish only",
        "Grain from Egypt"
      ],
      "answer": 1,
      "verse": "Exodus 16",
      "difficulty": 2
    },
    {
      "q": "Whom did God appoint, through Moses, to succeed him?",
      "options": [
        "Aaron",
        "Caleb",
        "Joshua",
        "Eleazar"
      ],
      "answer": 2,
      "verse": "Deuteronomy 31:23",
      "difficulty": 3
    }
  ],
  "david": [
    {
      "q": "What weapon did David use to defeat Goliath?",
      "options": [
        "Sword",
        "Sling",
        "Bow",
        "Spear"
      ],
      "answer": 1,
      "verse": "1 Samuel 17:49",
      "difficulty": 1
    },
    {
      "q": "How many stones did David pick up?",
      "options": [
        "1",
        "3",
        "5",
        "7"
      ],
      "answer": 2,
      "verse": "1 Samuel 17:40",
      "difficulty": 1
    },
    {
      "q": "What was David's job before he became king?",
      "options": [
        "Farmer",
        "Shepherd",
        "Fisherman",
        "Carpenter"
      ],
      "answer": 1,
      "verse": "1 Samuel 16:11",
      "difficulty": 1
    },
    {
      "q": "What did Goliath wear when he challenged Israel?",
      "options": [
        "Bronze armor",
        "A linen robe",
        "A shepherd coat",
        "No armor"
      ],
      "answer": 0,
      "verse": "1 Samuel 17:5-6",
      "difficulty": 2
    },
    {
      "q": "Which son of Saul formed a close friendship with David?",
      "options": [
        "Solomon",
        "Jonathan",
        "Nathan",
        "Uriah"
      ],
      "answer": 1,
      "verse": "1 Samuel 18:1",
      "difficulty": 2
    },
    {
      "q": "What instrument did David play for King Saul?",
      "options": [
        "Trumpet",
        "Harp (lyre)",
        "Flute",
        "Drum"
      ],
      "answer": 1,
      "verse": "1 Samuel 16:23",
      "difficulty": 2
    },
    {
      "q": "Who was David's father?",
      "options": [
        "Jesse",
        "Saul",
        "Boaz",
        "Obed"
      ],
      "answer": 0,
      "verse": "1 Samuel 16:1",
      "difficulty": 2
    },
    {
      "q": "Who anointed David king?",
      "options": [
        "Elijah",
        "Nathan",
        "Samuel",
        "Elisha"
      ],
      "answer": 2,
      "verse": "1 Samuel 16:13",
      "difficulty": 2
    },
    {
      "q": "Which book contains many songs written by David?",
      "options": [
        "Proverbs",
        "Psalms",
        "Ecclesiastes",
        "Job"
      ],
      "answer": 1,
      "verse": "Psalms",
      "difficulty": 2
    },
    {
      "q": "Which of David's sons succeeded him as king?",
      "options": [
        "Absalom",
        "Adonijah",
        "Solomon",
        "Nathan"
      ],
      "answer": 2,
      "verse": "1 Kings 1:39",
      "difficulty": 2
    },
    {
      "q": "Who was David's great-grandmother from Moab?",
      "options": [
        "Naomi",
        "Rahab",
        "Ruth",
        "Bathsheba"
      ],
      "answer": 2,
      "verse": "Ruth 4:17",
      "difficulty": 3
    }
  ],
  "nativity": [
    {
      "q": "In what town was Jesus born?",
      "options": [
        "Nazareth",
        "Jerusalem",
        "Bethlehem",
        "Galilee"
      ],
      "answer": 2,
      "verse": "Luke 2:4",
      "difficulty": 1
    },
    {
      "q": "Who visited Jesus with gifts?",
      "options": [
        "Angels",
        "Shepherds",
        "Wise men (Magi)",
        "Prophets"
      ],
      "answer": 2,
      "verse": "Matthew 2:11",
      "difficulty": 1
    },
    {
      "q": "What did the wise men follow?",
      "options": [
        "An angel",
        "A map",
        "A star",
        "A dream"
      ],
      "answer": 2,
      "verse": "Matthew 2:2",
      "difficulty": 1
    },
    {
      "q": "Where was Jesus laid after birth?",
      "options": [
        "In a bed",
        "In a manger",
        "In a cradle",
        "In a house"
      ],
      "answer": 1,
      "verse": "Luke 2:7",
      "difficulty": 1
    },
    {
      "q": "Who was Jesus' earthly mother?",
      "options": [
        "Elizabeth",
        "Anna",
        "Mary",
        "Martha"
      ],
      "answer": 2,
      "verse": "Luke 1:27",
      "difficulty": 1
    },
    {
      "q": "Who was Mary’s husband and cared for Jesus?",
      "options": [
        "Zachariah",
        "Joseph",
        "Simeon",
        "John"
      ],
      "answer": 1,
      "verse": "Matthew 1:18-25",
      "difficulty": 1
    },
    {
      "q": "Which angel announced Jesus' birth to Mary?",
      "options": [
        "Michael",
        "Gabriel",
        "Raphael",
        "Uriel"
      ],
      "answer": 1,
      "verse": "Luke 1:26",
      "difficulty": 2
    },
    {
      "q": "What three gifts did the wise men bring?",
      "options": [
        "Gold, silver, bronze",
        "Gold, frankincense, myrrh",
        "Frankincense, oil, spices",
        "Wine, grain, coins"
      ],
      "answer": 1,
      "verse": "Matthew 2:11",
      "difficulty": 2
    },
    {
      "q": "Which king ordered the killing of Bethlehem's baby boys?",
      "options": [
        "Caesar",
        "Herod",
        "Pilate",
        "Nebuchadnezzar"
      ],
      "answer": 1,
      "verse": "Matthew 2:16",
      "difficulty": 2
    },
    {
      "q": "Where did Joseph flee with Mary and Jesus?",
      "options": [
        "Egypt",
        "Persia",
        "Assyria",
        "Babylon"
      ],
      "answer": 0,
      "verse": "Matthew 2:14",
      "difficulty": 2
    },
    {
      "q": "What prophet foretold a virgin would bear a son called Immanuel?",
      "options": [
        "Jeremiah",
        "Isaiah",
        "Micah",
        "Ezekiel"
      ],
      "answer": 1,
      "verse": "Isaiah 7:14",
      "difficulty": 3
    },
    {
      "q": "Who heard angels announce that the Savior had been born that night?",
      "options": [
        "Kings",
        "Priests",
        "Shepherds",
        "Fishermen"
      ],
      "answer": 2,
      "verse": "Luke 2:8-11",
      "difficulty": 2
    }
  ],
  "resurrection": [
    {
      "q": "On which day did Jesus rise from the dead?",
      "options": [
        "First",
        "Third",
        "Seventh",
        "Fortieth"
      ],
      "answer": 1,
      "verse": "Luke 24:7",
      "difficulty": 1
    },
    {
      "q": "According to John’s Gospel, who came to the tomb early and found the stone moved?",
      "options": [
        "Peter",
        "John",
        "Mary Magdalene",
        "Thomas"
      ],
      "answer": 2,
      "verse": "John 20:1",
      "difficulty": 1
    },
    {
      "q": "What was rolled away from the tomb?",
      "options": [
        "A door",
        "A stone",
        "A curtain",
        "A gate"
      ],
      "answer": 1,
      "verse": "Matthew 28:2",
      "difficulty": 1
    },
    {
      "q": "On what day of the week did Jesus rise?",
      "options": [
        "Friday",
        "Saturday",
        "Sunday",
        "Monday"
      ],
      "answer": 2,
      "verse": "Mark 16:2",
      "difficulty": 1
    },
    {
      "q": "According to John’s Gospel, who spoke with the risen Jesus near the tomb?",
      "options": [
        "Peter",
        "Mary Magdalene",
        "Thomas",
        "John"
      ],
      "answer": 1,
      "verse": "John 20:14-16",
      "difficulty": 2
    },
    {
      "q": "Which disciple doubted the resurrection at first?",
      "options": [
        "Peter",
        "James",
        "Thomas",
        "Andrew"
      ],
      "answer": 2,
      "verse": "John 20:25",
      "difficulty": 2
    },
    {
      "q": "About how many people did Paul say saw the risen Jesus at once?",
      "options": [
        "More than 500",
        "About 72",
        "Exactly 12",
        "About 5,000"
      ],
      "answer": 0,
      "verse": "1 Corinthians 15:6",
      "difficulty": 3
    },
    {
      "q": "Where did Jesus meet two disciples on the road?",
      "options": [
        "Bethany",
        "Emmaus",
        "Jericho",
        "Capernaum"
      ],
      "answer": 1,
      "verse": "Luke 24:13",
      "difficulty": 2
    },
    {
      "q": "Over how many days did Jesus appear to His followers before ascending?",
      "options": [
        "7",
        "20",
        "40",
        "50"
      ],
      "answer": 2,
      "verse": "Acts 1:3",
      "difficulty": 2
    },
    {
      "q": "According to Matthew, what was stationed at Jesus’ tomb?",
      "options": [
        "A guard of soldiers",
        "A group of fishermen",
        "The twelve disciples",
        "A choir of priests"
      ],
      "answer": 0,
      "verse": "Matthew 27:66",
      "difficulty": 2
    },
    {
      "q": "What did the angel tell the women at the tomb?",
      "options": [
        "'He is here'",
        "'He is risen'",
        "'He is coming'",
        "'He is gone'"
      ],
      "answer": 1,
      "verse": "Matthew 28:6",
      "difficulty": 1
    }
  ],
  "general": [
    {
      "q": "How many books are in most Protestant Bibles?",
      "options": [
        "50",
        "66",
        "72",
        "100"
      ],
      "answer": 1,
      "verse": "",
      "difficulty": 1
    },
    {
      "q": "What is the first book of the Bible?",
      "options": [
        "Exodus",
        "Psalms",
        "Genesis",
        "Matthew"
      ],
      "answer": 2,
      "verse": "",
      "difficulty": 1
    },
    {
      "q": "What is the last book of the Bible?",
      "options": [
        "Acts",
        "John",
        "Jude",
        "Revelation"
      ],
      "answer": 3,
      "verse": "",
      "difficulty": 1
    },
    {
      "q": "How many apostles did Jesus choose as the Twelve?",
      "options": [
        "7",
        "10",
        "12",
        "40"
      ],
      "answer": 2,
      "verse": "Matthew 10",
      "difficulty": 1
    },
    {
      "q": "Which book comes right after Genesis?",
      "options": [
        "Numbers",
        "Exodus",
        "Leviticus",
        "Deuteronomy"
      ],
      "answer": 1,
      "verse": "",
      "difficulty": 2
    },
    {
      "q": "Which familiar verse is often cited as the shortest in many English translations?",
      "options": [
        "'Jesus wept'",
        "'God is love'",
        "'Pray always'",
        "'Rejoice evermore'"
      ],
      "answer": 0,
      "verse": "John 11:35",
      "difficulty": 2
    },
    {
      "q": "How many Gospels are in the New Testament?",
      "options": [
        "3",
        "4",
        "5",
        "7"
      ],
      "answer": 1,
      "verse": "",
      "difficulty": 1
    },
    {
      "q": "Which book is a collection of songs and prayers?",
      "options": [
        "Proverbs",
        "Psalms",
        "Song of Songs",
        "Ecclesiastes"
      ],
      "answer": 1,
      "verse": "",
      "difficulty": 2
    },
    {
      "q": "What name does the writer of Revelation give for himself?",
      "options": [
        "Peter",
        "Paul",
        "John",
        "James"
      ],
      "answer": 2,
      "verse": "Revelation 1:1, 4, 9",
      "difficulty": 2
    },
    {
      "q": "In how many languages was the Bible originally written?",
      "options": [
        "1",
        "2",
        "3",
        "4"
      ],
      "answer": 2,
      "verse": "Hebrew, Aramaic, Greek",
      "difficulty": 3
    },
    {
      "q": "In the traditional Hebrew text, which book never directly mentions God’s name?",
      "options": [
        "Ruth",
        "Esther",
        "Ezra",
        "Nehemiah"
      ],
      "answer": 1,
      "verse": "",
      "difficulty": 3
    },
    {
      "q": "What does the word 'gospel' mean?",
      "options": [
        "Story",
        "Good news",
        "Song",
        "Letter"
      ],
      "answer": 1,
      "verse": "",
      "difficulty": 2
    }
  ],
  "jonah": [
    {
      "q": "What creature swallowed Jonah?",
      "options": [
        "A whale",
        "A great fish",
        "A shark",
        "A dolphin"
      ],
      "answer": 1,
      "verse": "Jonah 1:17",
      "difficulty": 1
    },
    {
      "q": "How many days was Jonah inside the fish?",
      "options": [
        "1",
        "3",
        "7",
        "40"
      ],
      "answer": 1,
      "verse": "Jonah 1:17",
      "difficulty": 1
    },
    {
      "q": "Which city did God send Jonah to?",
      "options": [
        "Jerusalem",
        "Nineveh",
        "Tarshish",
        "Bethel"
      ],
      "answer": 1,
      "verse": "Jonah 1:2",
      "difficulty": 1
    },
    {
      "q": "What did the people of Nineveh do?",
      "options": [
        "Ignored the message",
        "Repented",
        "Attacked Jonah",
        "Left the city"
      ],
      "answer": 1,
      "verse": "Jonah 3:5",
      "difficulty": 2
    },
    {
      "q": "Where did Jonah try to flee to instead?",
      "options": [
        "Egypt",
        "Tarshish",
        "Jericho",
        "Damascus"
      ],
      "answer": 1,
      "verse": "Jonah 1:3",
      "difficulty": 2
    },
    {
      "q": "What did God appoint to give Jonah shade?",
      "options": [
        "A leafy plant",
        "A cedar tree",
        "A cloud",
        "A tent"
      ],
      "answer": 0,
      "verse": "Jonah 4:6",
      "difficulty": 3
    },
    {
      "q": "How long a journey does Jonah 3:3 associate with Nineveh?",
      "options": [
        "3 days' journey",
        "1 day's journey",
        "7 days' journey",
        "40 days' journey"
      ],
      "answer": 0,
      "verse": "Jonah 3:3",
      "difficulty": 3
    },
    {
      "q": "What did the sailors do when the storm hit?",
      "options": [
        "Prayed to their gods",
        "Turned back to Joppa",
        "Sailed on",
        "Fought"
      ],
      "answer": 0,
      "verse": "Jonah 1:5",
      "difficulty": 2
    },
    {
      "q": "Who caused the storm at sea?",
      "options": [
        "Jonah",
        "The sailors",
        "The Lord",
        "The wind spirits"
      ],
      "answer": 2,
      "verse": "Jonah 1:4",
      "difficulty": 2
    },
    {
      "q": "What did Nineveh’s king put on and sit in as a sign of repentance?",
      "options": [
        "Sackcloth and ashes",
        "White robes and water",
        "Palm branches and oil",
        "Armor and dust"
      ],
      "answer": 0,
      "verse": "Jonah 3:6",
      "difficulty": 2
    },
    {
      "q": "Why was Jonah angry after Nineveh repented?",
      "options": [
        "God spared the city",
        "He lost his boat",
        "The sailors found him",
        "He could not enter the city"
      ],
      "answer": 0,
      "verse": "Jonah 4:1-2",
      "difficulty": 3
    }
  ],
  "apostles": [
    {
      "q": "Who was the fisherman-turned-apostle Jesus renamed Peter?",
      "options": [
        "Simon",
        "Andrew",
        "James",
        "John"
      ],
      "answer": 0,
      "verse": "Matthew 16:18",
      "difficulty": 1
    },
    {
      "q": "Which apostle doubted Jesus' resurrection at first?",
      "options": [
        "Peter",
        "John",
        "Thomas",
        "Philip"
      ],
      "answer": 2,
      "verse": "John 20:25",
      "difficulty": 1
    },
    {
      "q": "Which former persecutor became an apostle and missionary?",
      "options": [
        "Barnabas",
        "Paul (Saul)",
        "Silas",
        "Timothy"
      ],
      "answer": 1,
      "verse": "Acts 9",
      "difficulty": 1
    },
    {
      "q": "Who is traditionally credited with writing many New Testament letters?",
      "options": [
        "Peter",
        "John",
        "Paul",
        "James"
      ],
      "answer": 2,
      "verse": "",
      "difficulty": 1
    },
    {
      "q": "Which apostle betrayed Jesus?",
      "options": [
        "Peter",
        "Thomas",
        "Judas Iscariot",
        "Matthew"
      ],
      "answer": 2,
      "verse": "Matthew 26:14",
      "difficulty": 1
    },
    {
      "q": "Who replaced Judas as the twelfth apostle?",
      "options": [
        "Barnabas",
        "Matthias",
        "Stephen",
        "Silas"
      ],
      "answer": 1,
      "verse": "Acts 1:26",
      "difficulty": 2
    },
    {
      "q": "Who traveled with Paul on his first missionary journey?",
      "options": [
        "Peter",
        "Timothy",
        "Barnabas",
        "Apollos"
      ],
      "answer": 2,
      "verse": "Acts 13:2-4",
      "difficulty": 2
    },
    {
      "q": "Which apostle is traditionally associated with 1, 2, and 3 John?",
      "options": [
        "Peter",
        "Paul",
        "John",
        "James"
      ],
      "answer": 2,
      "verse": "",
      "difficulty": 2
    },
    {
      "q": "Who is traditionally identified as the disciple Jesus loved in John’s Gospel?",
      "options": [
        "Peter",
        "John",
        "James",
        "Andrew"
      ],
      "answer": 1,
      "verse": "John 21:20",
      "difficulty": 2
    },
    {
      "q": "Where was Paul when he wrote several letters?",
      "options": [
        "A ship",
        "A prison",
        "A cave",
        "A synagogue"
      ],
      "answer": 1,
      "verse": "Philippians 1:13",
      "difficulty": 2
    },
    {
      "q": "What was Matthew's occupation before following Jesus?",
      "options": [
        "Fisherman",
        "Tax collector",
        "Carpenter",
        "Physician"
      ],
      "answer": 1,
      "verse": "Matthew 9:9",
      "difficulty": 2
    }
  ],
  "parables": [
    {
      "q": "In the Good Samaritan, who helped the wounded man?",
      "options": [
        "A priest",
        "A Levite",
        "A Samaritan",
        "A soldier"
      ],
      "answer": 2,
      "verse": "Luke 10:33",
      "difficulty": 1
    },
    {
      "q": "What did the prodigal son do with his inheritance?",
      "options": [
        "Invested it",
        "Wasted it",
        "Gave it away",
        "Buried it"
      ],
      "answer": 1,
      "verse": "Luke 15:13",
      "difficulty": 1
    },
    {
      "q": "In the mustard seed parable, what does the tiny seed become?",
      "options": [
        "A vine",
        "A large plant or tree",
        "A flower",
        "A patch of grass"
      ],
      "answer": 1,
      "verse": "Matthew 13:32",
      "difficulty": 2
    },
    {
      "q": "How many talents did the wicked servant bury?",
      "options": [
        "One",
        "Two",
        "Five",
        "Ten"
      ],
      "answer": 0,
      "verse": "Matthew 25:18",
      "difficulty": 2
    },
    {
      "q": "What did the sower scatter?",
      "options": [
        "Seed",
        "Olives",
        "Grapes",
        "Barley loaves"
      ],
      "answer": 0,
      "verse": "Matthew 13:3-9",
      "difficulty": 2
    },
    {
      "q": "How many sheep did the shepherd leave to find the one lost sheep?",
      "options": [
        "9",
        "49",
        "99",
        "999"
      ],
      "answer": 2,
      "verse": "Luke 15:4",
      "difficulty": 1
    },
    {
      "q": "How many coins did the woman lose in the parable?",
      "options": [
        "1",
        "2",
        "5",
        "10"
      ],
      "answer": 0,
      "verse": "Luke 15:8",
      "difficulty": 2
    },
    {
      "q": "What did the wise builder build his house upon?",
      "options": [
        "Sand",
        "Rock",
        "Wood",
        "Straw"
      ],
      "answer": 1,
      "verse": "Matthew 7:24",
      "difficulty": 1
    },
    {
      "q": "How much did the unmerciful servant owe his master?",
      "options": [
        "100 coins",
        "1,000 coins",
        "10,000 talents",
        "1 million coins"
      ],
      "answer": 2,
      "verse": "Matthew 18:24",
      "difficulty": 3
    },
    {
      "q": "Who came at the eleventh hour in the vineyard parable?",
      "options": [
        "The last workers",
        "The children",
        "The women",
        "The angels"
      ],
      "answer": 0,
      "verse": "Matthew 20:6",
      "difficulty": 2
    },
    {
      "q": "What crop did the enemy sow among the wheat?",
      "options": [
        "Barley",
        "Weeds (tares)",
        "Corn",
        "Grapes"
      ],
      "answer": 1,
      "verse": "Matthew 13:25",
      "difficulty": 3
    }
  ],
  "commandments": [
    {
      "q": "On what mountain did Moses receive the commandments?",
      "options": [
        "Ararat",
        "Sinai",
        "Zion",
        "Carmel"
      ],
      "answer": 1,
      "verse": "Exodus 19:20",
      "difficulty": 1
    },
    {
      "q": "Which action is forbidden in Exodus 20:15?",
      "options": [
        "Stealing",
        "Traveling",
        "Fishing",
        "Building"
      ],
      "answer": 0,
      "verse": "Exodus 20:15",
      "difficulty": 2
    },
    {
      "q": "Which day should be kept holy?",
      "options": [
        "Friday",
        "Sabbath",
        "Sunday",
        "Monday"
      ],
      "answer": 1,
      "verse": "Exodus 20:8",
      "difficulty": 1
    },
    {
      "q": "What did God write the commandments on?",
      "options": [
        "Scrolls",
        "Wood",
        "Stone tablets",
        "Cloth"
      ],
      "answer": 2,
      "verse": "Exodus 31:18",
      "difficulty": 1
    },
    {
      "q": "What does Exodus 20:3 command?",
      "options": [
        "Honor your parents",
        "Do not steal",
        "Have no other gods before God",
        "Do not lie"
      ],
      "answer": 2,
      "verse": "Exodus 20:3",
      "difficulty": 1
    },
    {
      "q": "What does Exodus 20 warn God’s people not to make for worship?",
      "options": [
        "Idols",
        "Tents",
        "Musical instruments",
        "Gardens"
      ],
      "answer": 0,
      "verse": "Exodus 20:4-5",
      "difficulty": 2
    },
    {
      "q": "What does the Sabbath command call God’s people to do?",
      "options": [
        "Set apart a day of rest",
        "Travel every week",
        "Build a monument",
        "Plant a garden"
      ],
      "answer": 0,
      "verse": "Exodus 20:8-11",
      "difficulty": 2
    },
    {
      "q": "Which command protects faithfulness in marriage?",
      "options": [
        "Do not commit adultery",
        "Do not build houses",
        "Do not travel",
        "Do not sing"
      ],
      "answer": 0,
      "verse": "Exodus 20:14",
      "difficulty": 2
    },
    {
      "q": "What did Moses do with the first set of tablets?",
      "options": [
        "Hid them",
        "Broke them",
        "Buried them",
        "Gave them away"
      ],
      "answer": 1,
      "verse": "Exodus 32:19",
      "difficulty": 2
    },
    {
      "q": "Which commandment promises a long life?",
      "options": [
        "Do not kill",
        "Honor your father and mother",
        "Do not steal",
        "Do not covet"
      ],
      "answer": 1,
      "verse": "Exodus 20:12",
      "difficulty": 2
    },
    {
      "q": "What desire does Exodus 20:17 warn against?",
      "options": [
        "Coveting what belongs to another",
        "Wanting food",
        "Seeking wisdom",
        "Taking a journey"
      ],
      "answer": 0,
      "verse": "Exodus 20:17",
      "difficulty": 2
    }
  ],
  "miracles": [
    {
      "q": "How many loaves fed the 5,000?",
      "options": [
        "2",
        "5",
        "7",
        "12"
      ],
      "answer": 1,
      "verse": "Matthew 14:17",
      "difficulty": 1
    },
    {
      "q": "What did Jesus turn water into at the wedding?",
      "options": [
        "Bread",
        "Wine",
        "Oil",
        "Milk"
      ],
      "answer": 1,
      "verse": "John 2:9",
      "difficulty": 1
    },
    {
      "q": "Whom did Jesus raise after he had been in the tomb four days?",
      "options": [
        "Lazarus",
        "Peter",
        "James",
        "Jairus’s daughter"
      ],
      "answer": 0,
      "verse": "John 11:17, 43-44",
      "difficulty": 1
    },
    {
      "q": "On what did Jesus walk to reach His disciples?",
      "options": [
        "Water",
        "Land",
        "A boat",
        "A path"
      ],
      "answer": 0,
      "verse": "Matthew 14:25",
      "difficulty": 1
    },
    {
      "q": "How many fish were with the 5 loaves?",
      "options": [
        "1",
        "2",
        "5",
        "12"
      ],
      "answer": 1,
      "verse": "Matthew 14:17",
      "difficulty": 2
    },
    {
      "q": "Where was the wedding at which Jesus made wine?",
      "options": [
        "Bethany",
        "Cana",
        "Capernaum",
        "Nazareth"
      ],
      "answer": 1,
      "verse": "John 2:1",
      "difficulty": 2
    },
    {
      "q": "How many baskets of leftovers after feeding the 5,000?",
      "options": [
        "4",
        "7",
        "12",
        "24"
      ],
      "answer": 2,
      "verse": "Matthew 14:20",
      "difficulty": 2
    },
    {
      "q": "Who walked on water with Jesus briefly?",
      "options": [
        "Peter",
        "John",
        "James",
        "Andrew"
      ],
      "answer": 0,
      "verse": "Matthew 14:29",
      "difficulty": 2
    },
    {
      "q": "Jesus healed a man who had been born _____.",
      "options": [
        "Deaf",
        "Blind",
        "Mute",
        "Lame"
      ],
      "answer": 1,
      "verse": "John 9:1",
      "difficulty": 2
    },
    {
      "q": "Jesus healed ten people with leprosy. How many returned to thank Him?",
      "options": [
        "1",
        "5",
        "10",
        "3"
      ],
      "answer": 0,
      "verse": "Luke 17:15-17",
      "difficulty": 2
    },
    {
      "q": "What did Jesus tell the paralyzed man to do after healing him?",
      "options": [
        "Go home",
        "Pick up his mat and walk",
        "Sit down",
        "Pray"
      ],
      "answer": 1,
      "verse": "Mark 2:11",
      "difficulty": 2
    }
  ],
  "prophets": [
    {
      "q": "Which prophet went up to heaven in a whirlwind after a chariot of fire appeared?",
      "options": [
        "Elijah",
        "Elisha",
        "Isaiah",
        "Ezekiel"
      ],
      "answer": 0,
      "verse": "2 Kings 2:11",
      "difficulty": 2
    },
    {
      "q": "Who was Elijah's successor?",
      "options": [
        "Isaiah",
        "Elisha",
        "Micah",
        "Amos"
      ],
      "answer": 1,
      "verse": "1 Kings 19:16",
      "difficulty": 2
    },
    {
      "q": "Which prophet foretold that a virgin would bear a son called Immanuel?",
      "options": [
        "Jeremiah",
        "Isaiah",
        "Ezekiel",
        "Micah"
      ],
      "answer": 1,
      "verse": "Isaiah 7:14",
      "difficulty": 2
    },
    {
      "q": "Which prophet was thrown into a lion's den?",
      "options": [
        "Daniel",
        "Ezekiel",
        "Jeremiah",
        "Habakkuk"
      ],
      "answer": 0,
      "verse": "Daniel 6",
      "difficulty": 1
    },
    {
      "q": "Which prophet saw a valley of dry bones?",
      "options": [
        "Isaiah",
        "Jeremiah",
        "Ezekiel",
        "Daniel"
      ],
      "answer": 2,
      "verse": "Ezekiel 37",
      "difficulty": 2
    },
    {
      "q": "Who was known as the 'weeping prophet'?",
      "options": [
        "Isaiah",
        "Jeremiah",
        "Ezekiel",
        "Amos"
      ],
      "answer": 1,
      "verse": "",
      "difficulty": 3
    },
    {
      "q": "Which prophet challenged 450 prophets of Baal?",
      "options": [
        "Elisha",
        "Elijah",
        "Samuel",
        "Jonah"
      ],
      "answer": 1,
      "verse": "1 Kings 18",
      "difficulty": 2
    },
    {
      "q": "Which minor prophet foretold Bethlehem as the Messiah's birthplace?",
      "options": [
        "Micah",
        "Nahum",
        "Zephaniah",
        "Malachi"
      ],
      "answer": 0,
      "verse": "Micah 5:2",
      "difficulty": 3
    },
    {
      "q": "Which prophet's name means 'the Lord saves'?",
      "options": [
        "Isaiah",
        "Jeremiah",
        "Ezekiel",
        "Daniel"
      ],
      "answer": 0,
      "verse": "",
      "difficulty": 3
    },
    {
      "q": "Who anointed both Saul and David as king?",
      "options": [
        "Samuel",
        "Nathan",
        "Elisha",
        "Elijah"
      ],
      "answer": 0,
      "verse": "1 Samuel 10:1; 16:13",
      "difficulty": 2
    },
    {
      "q": "Which prophet’s marriage became a sign of Israel’s unfaithfulness?",
      "options": [
        "Amos",
        "Micah",
        "Hosea",
        "Joel"
      ],
      "answer": 2,
      "verse": "Hosea 1:2",
      "difficulty": 3
    }
  ],
  "sermon": [
    {
      "q": "Where did Jesus sit to teach the Sermon on the Mount?",
      "options": [
        "On a mountain",
        "Inside the Temple",
        "In a boat",
        "In a palace"
      ],
      "answer": 0,
      "verse": "Matthew 5:1-2",
      "difficulty": 1
    },
    {
      "q": "Blessed are the _____ for they will be called children of God.",
      "options": [
        "Poor",
        "Peacemakers",
        "Meek",
        "Merciful"
      ],
      "answer": 1,
      "verse": "Matthew 5:9",
      "difficulty": 1
    },
    {
      "q": "Blessed are the _____ for they will inherit the earth.",
      "options": [
        "Poor",
        "Meek",
        "Pure in heart",
        "Peacemakers"
      ],
      "answer": 1,
      "verse": "Matthew 5:5",
      "difficulty": 2
    },
    {
      "q": "How does Jesus say we should treat our enemies?",
      "options": [
        "Avoid them",
        "Fight them",
        "Love them and pray for them",
        "Ignore them"
      ],
      "answer": 2,
      "verse": "Matthew 5:44",
      "difficulty": 1
    },
    {
      "q": "Where did Jesus warn people not to store up treasures?",
      "options": [
        "On Earth",
        "In banks",
        "In our hearts",
        "In heaven"
      ],
      "answer": 0,
      "verse": "Matthew 6:19",
      "difficulty": 2
    },
    {
      "q": "Which prayer did Jesus teach in the Sermon?",
      "options": [
        "Jesus Prayer",
        "Lord's Prayer",
        "Shepherd's Prayer",
        "Sinner's Prayer"
      ],
      "answer": 1,
      "verse": "Matthew 6:9",
      "difficulty": 1
    },
    {
      "q": "Which word begins each Beatitude in Matthew 5?",
      "options": [
        "Blessed",
        "Listen",
        "Remember",
        "Go"
      ],
      "answer": 0,
      "verse": "Matthew 5:3-10",
      "difficulty": 2
    },
    {
      "q": "Jesus said do not judge, or you too will be _____?",
      "options": [
        "Judged",
        "Punished",
        "Forgotten",
        "Sad"
      ],
      "answer": 0,
      "verse": "Matthew 7:1",
      "difficulty": 1
    },
    {
      "q": "What kind of gate leads to life?",
      "options": [
        "Wide",
        "Narrow",
        "Golden",
        "Iron"
      ],
      "answer": 1,
      "verse": "Matthew 7:14",
      "difficulty": 2
    },
    {
      "q": "A house built on _____ will fall in the storm.",
      "options": [
        "Rock",
        "Sand",
        "Wood",
        "Straw"
      ],
      "answer": 1,
      "verse": "Matthew 7:26",
      "difficulty": 1
    },
    {
      "q": "Jesus said, 'You are the _____ of the earth.'",
      "options": [
        "Salt",
        "Light",
        "Yeast",
        "Seed"
      ],
      "answer": 0,
      "verse": "Matthew 5:13",
      "difficulty": 2
    }
  ],
  "psalms": [
    {
      "q": "Psalm 23 begins with: 'The Lord is my _____.'",
      "options": [
        "Rock",
        "Shepherd",
        "Fortress",
        "Shield"
      ],
      "answer": 1,
      "verse": "Psalm 23:1",
      "difficulty": 1
    },
    {
      "q": "Which king is traditionally associated with many of the Psalms?",
      "options": [
        "Solomon",
        "David",
        "Saul",
        "Hezekiah"
      ],
      "answer": 1,
      "verse": "",
      "difficulty": 1
    },
    {
      "q": "How many Psalms are there in total?",
      "options": [
        "100",
        "120",
        "150",
        "180"
      ],
      "answer": 2,
      "verse": "",
      "difficulty": 2
    },
    {
      "q": "Psalm 1 says the righteous are like a tree planted by _____?",
      "options": [
        "Streams of water",
        "The sea",
        "A meadow",
        "A cave"
      ],
      "answer": 0,
      "verse": "Psalm 1:3",
      "difficulty": 2
    },
    {
      "q": "According to Psalm 121, where does our help come from?",
      "options": [
        "The mountains themselves",
        "A human king",
        "Yahweh, Maker of heaven and earth",
        "An army"
      ],
      "answer": 2,
      "verse": "Psalm 121:1-2",
      "difficulty": 2
    },
    {
      "q": "Psalm 119 is famous for being the _____?",
      "options": [
        "Shortest chapter",
        "Longest chapter in the Bible",
        "Prayer of Jonah",
        "Song of Solomon"
      ],
      "answer": 1,
      "verse": "",
      "difficulty": 2
    },
    {
      "q": "What kind of writings make up the book of Psalms?",
      "options": [
        "Songs and prayers",
        "Royal laws",
        "Travel maps",
        "Family records"
      ],
      "answer": 0,
      "verse": "",
      "difficulty": 2
    },
    {
      "q": "Psalm 51 is David's psalm of _____?",
      "options": [
        "Victory",
        "Repentance",
        "Thanksgiving",
        "War"
      ],
      "answer": 1,
      "verse": "Psalm 51",
      "difficulty": 2
    },
    {
      "q": "What is true about the word ‘Selah’ in the Psalms?",
      "options": [
        "It ends every psalm",
        "It means amen",
        "Its exact meaning is uncertain",
        "It means sing loudly"
      ],
      "answer": 2,
      "verse": "",
      "difficulty": 3
    },
    {
      "q": "'Create in me a clean heart, O God' is from Psalm __?",
      "options": [
        "1",
        "23",
        "51",
        "100"
      ],
      "answer": 2,
      "verse": "Psalm 51:10",
      "difficulty": 3
    }
  ]
} as const;

export const VERSES = [
  {
    "id": "v1",
    "reference": "John 3:16",
    "translation": "WEB Classic",
    "text": "For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life.",
    "blanks": [
      "loved",
      "Son"
    ],
    "premium": false
  },
  {
    "id": "v2",
    "reference": "Psalm 23:1",
    "translation": "WEB Classic",
    "text": "Yahweh is my shepherd; I shall lack nothing.",
    "blanks": [
      "shepherd",
      "nothing"
    ],
    "premium": false
  },
  {
    "id": "v3",
    "reference": "Philippians 4:13",
    "translation": "WEB Classic",
    "text": "I can do all things through Christ who strengthens me.",
    "blanks": [
      "all",
      "strengthens"
    ],
    "premium": false
  },
  {
    "id": "v4",
    "reference": "Proverbs 3:5",
    "translation": "WEB Classic",
    "text": "Trust in Yahweh with all your heart, and don’t lean on your own understanding.",
    "blanks": [
      "Trust",
      "heart"
    ],
    "premium": false
  },
  {
    "id": "v5",
    "reference": "Matthew 5:9",
    "translation": "WEB Classic",
    "text": "Blessed are the peacemakers, for they shall be called children of God.",
    "blanks": [
      "peacemakers",
      "children"
    ],
    "premium": false
  },
  {
    "id": "v6",
    "reference": "Joshua 1:9",
    "translation": "WEB Classic",
    "text": "Haven’t I commanded you? Be strong and courageous. Don’t be afraid. Don’t be dismayed, for Yahweh your God is with you wherever you go.",
    "blanks": [
      "strong",
      "afraid"
    ],
    "premium": false
  },
  {
    "id": "v7",
    "reference": "Jeremiah 29:11",
    "translation": "WEB Classic",
    "text": "For I know the thoughts that I think toward you, says Yahweh, thoughts of peace, and not of evil, to give you hope and a future.",
    "blanks": [
      "peace",
      "hope"
    ],
    "premium": true
  },
  {
    "id": "v8",
    "reference": "Isaiah 40:31",
    "translation": "WEB Classic",
    "text": "But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles. They will run, and not be weary. They will walk, and not faint.",
    "blanks": [
      "wait",
      "eagles"
    ],
    "premium": true
  },
  {
    "id": "v9",
    "reference": "Romans 8:28",
    "translation": "WEB Classic",
    "text": "We know that all things work together for good for those who love God, for those who are called according to his purpose.",
    "blanks": [
      "good",
      "love"
    ],
    "premium": true
  },
  {
    "id": "v10",
    "reference": "1 John 4:19",
    "translation": "WEB Classic",
    "text": "We love him, because he first loved us.",
    "blanks": [
      "love",
      "first"
    ],
    "premium": true
  },
  {
    "id": "v11",
    "reference": "Psalm 46:10",
    "translation": "WEB Classic",
    "text": "Be still, and know that I am God. I will be exalted among the nations. I will be exalted on the earth.",
    "blanks": [
      "still",
      "God"
    ],
    "premium": true
  },
  {
    "id": "v12",
    "reference": "Matthew 6:33",
    "translation": "WEB Classic",
    "text": "But seek first God’s Kingdom and his righteousness; and all these things will be given to you as well.",
    "blanks": [
      "seek",
      "Kingdom"
    ],
    "premium": true
  },
  {
    "id": "v13",
    "reference": "Genesis 12:2",
    "translation": "WEB Classic",
    "text": "I will make of you a great nation. I will bless you and make your name great. You will be a blessing.",
    "blanks": [
      "nation",
      "blessing"
    ],
    "premium": false
  }
] as const;

export const STORIES = [
  {
    "id": "s1",
    "title": "Noah's Ark",
    "topic": "noah",
    "premium": false,
    "image": "local:s1",
    "character_emoji": "🕊️",
    "summary": "God's promise after the great flood.",
    "kids_text": "A long, long time ago, the world had become a very sad place. People were being mean to each other, and God was heartbroken. But Noah walked faithfully with God and found favor in His sight. God had a special mission for Noah. \"Noah,\" God said, \"I want you to build a giant boat called an ark. A big flood is coming, but I will keep you safe.\"\n\nNoah worked hard for a long time. People around him may not have understood why he was building such a huge boat, but Noah kept obeying God. When the ark was finished, the animals came to Noah in pairs, with additional clean animals as God instructed. Lions and lambs, elephants and mice, bunnies and bears! They all walked right into the ark. Then Noah's family — his wife, his three sons Shem, Ham, and Japheth, and their wives — climbed inside.\n\nGod shut the door of the ark. Whoosh! The rain came pouring down, and it rained for 40 whole days and 40 whole nights! Water covered the mountains, but inside the ark, Noah's family and all the animals were safe and dry.\n\nFinally, the rain stopped. Noah sent out a dove to see if the water was gone. She came back with a fresh, green olive leaf in her beak! That meant new life was growing again. When the ark rested in the mountains of Ararat, everyone eventually came out to a renewed world.\n\nThen God did something wonderful — He put a giant, colorful rainbow in the sky. \"This rainbow,\" God said, \"is my promise to you. I will never flood the whole earth again.\" And every time we see a rainbow, we can remember God always keeps His promises! 🌈",
    "adult_text": "Genesis 6-9 recounts one of the Bible's most iconic covenantal narratives. In a generation marked by unchecked corruption, God's grief is expressed in language of divine sorrow (Gen 6:6). Yet grace persists — Noah, a righteous man who walked with God, finds favor in the Lord's sight.\n\nGod's command to build the ark represents both judgment and salvation. Noah's long obedience while preparing the ark reveals faith as sustained trust in the unseen. The dimensions of the ark (300x50x30 cubits) speak to God's precision; the gathering of animals in pairs and sevens (of clean animals) prefigures future sacrificial themes.\n\nWhen the fountains of the deep burst forth and the floodgates of heaven opened, forty days and nights of rain reset the created order. Yet God 'remembered Noah' (Gen 8:1) — a covenantal phrase indicating not that God had forgotten, but that He now moves to act. The dove's return with an olive leaf becomes a timeless symbol of renewed life and reconciliation.\n\nThe narrative culminates in the Noahic Covenant — the first explicit covenant in Scripture. God places His bow (a weapon of war) in the clouds. Christian interpreters have often seen this image as a symbol of mercy and covenant promise. This covenant extends to all creation, foreshadowing the greater covenant Jesus would inaugurate through His blood.\n\nThemes: divine justice tempered by mercy, the sufficiency of covenant grace, and the enduring hope that despite human failure, God is committed to the flourishing of His creation. In Christ, the ark motif finds fulfillment — Jesus becomes the true refuge through whom we pass safely from judgment into new life (1 Peter 3:20-21)."
  },
  {
    "id": "s2",
    "title": "David & Goliath",
    "topic": "david",
    "premium": false,
    "image": "local:s2",
    "character_emoji": "🛡️",
    "summary": "A young shepherd defeats a giant.",
    "kids_text": "In the valley of Elah, two armies faced each other. The mighty Philistine army had a secret weapon — a giant named Goliath! He was a towering champion who wore heavy bronze armor and carried a huge spear. Every single day for 40 days, Goliath stomped out and shouted, \"Send someone to fight me!\" Even the bravest Israelite soldiers were shaking in their sandals.\n\nMeanwhile, a young shepherd boy named David was tending sheep. His father, Jesse, sent him to bring food to his older brothers in the army. When David arrived, he heard Goliath's boasts and was shocked. \"Who is this giant that mocks the armies of the living God?\" David asked.\n\nDavid went to King Saul and said, \"I will fight him!\" Saul tried to give David his armor, but it was way too big and heavy. So David took it all off. Instead, he grabbed his shepherd's sling and picked up five smooth stones from a nearby stream.\n\nGoliath laughed when he saw the little shepherd boy. \"Am I a dog that you come at me with sticks?\" he roared. But David said, \"You come with sword and spear, but I come in the name of the Lord Almighty!\"\n\nDavid ran toward Goliath, put one smooth stone in his sling, and — whoosh — swung it round and round. The stone flew through the air and struck Goliath right on the forehead! The giant crashed to the ground with a mighty THUD. David then took Goliath's own sword, and the Philistine army saw that its champion had fallen.\n\nThe Philistines ran away in fear, and Israel cheered for their unlikely hero. David showed everyone a truth we can remember: with God, there is no giant too big to face. It's not the size of your body that matters — it's the size of your faith! 💪🕊️",
    "adult_text": "1 Samuel 17 presents one of Scripture's most enduring pictures of faith over fear. The narrative unfolds in the Valley of Elah, where the Philistine armies had entrenched themselves and their champion — Goliath of Gath, standing 'six cubits and a span' (described in the ancient text as exceptionally tall). For forty days, morning and evening, the giant issued his taunt, paralyzing Saul's army.\n\nDavid enters the narrative as an outsider — the youngest son, still tending sheep in Bethlehem when his brothers were at war. Sent by his father Jesse to bring provisions, David overhears the taunts and is instantly grieved: not by the giant's size, but by his blasphemy against the 'armies of the living God' (v. 26). His theological framing distinguishes him from everyone else — where they see military mismatch, he sees a spiritual affront.\n\nDavid's refusal of Saul's armor is instructive. The king's armor represents human resources, conventional strength — but David's battle testimony comes from his shepherd's history: 'The Lord who delivered me from the paw of the lion and the paw of the bear will deliver me from the hand of this Philistine' (v. 37). Five smooth stones and a sling become instruments in God's hand.\n\nThe confrontation is more theological than martial. Goliath boasts by 'sword, spear, and javelin'; David comes 'in the name of the Lord Almighty, the God of the armies of Israel' (v. 45). The victory is Yahweh's, delivered through the faith of an unlikely instrument.\n\nIn a traditional Christian reading, David foreshadows Christ — the anointed one who defeats the enemy on behalf of God's people. As Paul later writes, God chose 'the weak things of the world to shame the strong' (1 Corinthians 1:27). The narrative invites us to name our own Goliaths — the taunting fears, addictions, and impossibilities — and to remember: the battle belongs to the Lord."
  },
  {
    "id": "s3",
    "title": "Daniel in the Lion's Den",
    "topic": "daniel",
    "premium": false,
    "image": "local:s3",
    "character_emoji": "🦁",
    "summary": "Faith closes the mouths of lions.",
    "kids_text": "Daniel was a wise and kind man who worked for King Darius. Daniel loved God so much that every single day, three times a day, he opened his window toward Jerusalem and prayed to God. Everyone in the palace knew about it, and King Darius liked Daniel best of all his helpers.\n\nBut some other officials were jealous of Daniel. \"How can we get him in trouble?\" they whispered. They noticed something — Daniel prayed to God no matter what. So they came up with a sneaky plan. They asked the king to make a new rule: for 30 days, no one could pray to anyone except the king. Anyone who broke the rule would be thrown to the lions!\n\nThe king signed the decree. But when Daniel heard about it, do you know what he did? He went home, opened his window, and prayed to God just like always! Daniel loved God more than he feared the lions.\n\nThe jealous men rushed to tell the king, and King Darius was heartbroken. The decree was treated as unchangeable, so Darius ordered Daniel to be thrown into the deep, dark den of hungry lions. \"May your God, whom you serve so faithfully, save you!\" the king said as he sealed the door with a huge stone.\n\nThat night, King Darius couldn't sleep at all. Very early in the morning, he ran to the den and cried out, \"Daniel! Was your God able to save you?\" And from inside the den came Daniel's calm voice: \"O King, my God sent his angel and shut the lions' mouths! I am safe.\"\n\nThe king was overjoyed! He pulled Daniel out — not a scratch on him! Then King Darius wrote a letter to all the people in his kingdom: \"Everyone must respect Daniel's God, for He is the living God who saves and rescues.\" And Daniel kept on serving God every single day. 🦁🕊️",
    "adult_text": "Daniel 6 sits at the pinnacle of the book's court narratives, showcasing steadfast faith under political pressure. Daniel is now an older, trusted servant after decades in royal courts. His unmatched competence ('an excellent spirit was in him', v. 3) sets him above his rivals — and their envy births the plot.\n\nThe satraps' scheme is theologically precise: they know they cannot fault Daniel's conduct 'unless we find something concerning the law of his God' (v. 5). Faith becomes the point of vulnerability — but Daniel's fidelity is his glory, not his shame.\n\nTheir proposed decree, dressed in flattery, traps the king within the story’s presentation of an irrevocable royal edict. Daniel, upon learning of it, does not compromise, hide his prayers, or seek a legal workaround. He goes home, opens his windows toward Jerusalem (fulfilling Solomon's dedicatory prayer in 1 Kings 8:48-49), and continues his three-times-daily practice. His response is not defiant but consistent — an unbroken habit of God-directed life.\n\nThe king's grief when he realizes his own decree has ensnared his friend is a sign of Daniel's remarkable witness. Darius' vigil, sleepless and fasting, and his dawn cry — 'Servant of the living God, has your God, whom you serve continually, been able to deliver you from the lions?' (v. 20) — echoes with theological longing.\n\nDaniel's answer credits God alone: 'My God sent his angel and shut the lions' mouths.' The narrative underscores that God's deliverance is neither always spectacular nor always immediate — but for those who trust Him, He is faithful. Darius' resulting decree (vv. 26-27) praises the God who 'rescues and saves; He performs signs and wonders in the heavens and on the earth.'\n\nTheologically, Daniel 6 pairs with Daniel 3 (the fiery furnace) to demonstrate divine sovereignty over pagan power structures and the vindication of persevering faith. The New Testament writer of Hebrews includes those who 'shut the mouths of lions' (Heb 11:33) in the great cloud of witnesses. Daniel's example still speaks: consistent prayer, principled obedience, and confidence that God — whether by deliverance from or through the den — remains sovereign and good."
  },
  {
    "id": "s4",
    "title": "Jonah & the Great Fish",
    "topic": "jonah",
    "premium": false,
    "image": "local:s4",
    "character_emoji": "🐋",
    "summary": "You can't run from God.",
    "kids_text": "One day, God gave Jonah a very important job. \"Jonah,\" God said, \"go to the big city of Nineveh and tell the people to stop doing bad things.\" But Jonah did NOT want to go — he didn't like the people of Nineveh. So he ran the OTHER way! Jonah bought a ticket for a boat sailing far, far away to Tarshish.\n\nBut you can't hide from God. As soon as the boat was on the sea, God sent a huge storm. Waves crashed! Thunder boomed! The sailors were terrified. They shouted, \"We're going to sink!\" Jonah, who was fast asleep below, finally admitted, \"This storm is because I'm running from God. Throw me overboard, and the storm will stop.\"\n\nThe sailors didn't want to hurt Jonah, but the storm just kept getting worse. Finally, they picked him up and — SPLASH — tossed him into the wild waves. Instantly, the sea became calm.\n\nDown, down, down Jonah sank. But God had a plan! God sent a GIANT fish, and — GULP — the fish swallowed Jonah whole! Jonah was inside the fish's belly for three whole days and three whole nights. It was dark and smelly, but Jonah wasn't alone. He prayed, \"God, I'm sorry for running away. Please help me!\"\n\nGod heard Jonah's prayer. He told the giant fish to spit Jonah out onto the beach — SPLOOSH! Sopping wet and smelling like fish, Jonah quickly ran to Nineveh this time. He told the whole city, \"Change your ways, or God will judge you.\" And guess what? The people of Nineveh — even the king — said sorry to God and stopped doing bad things.\n\nGod forgave them all! Jonah learned an important lesson: God loves EVERYONE, even people we might not think deserve it. And no matter how far we run, God's love always finds us. 🐋💙",
    "adult_text": "The book of Jonah is a masterclass in divine mercy that unsettles our narrow categories of who ‘deserves’ grace. Set in the world of the prophet Jonah son of Amittai, it addresses God’s people through a reluctant prophet whose flaws mirror our own.\n\nJonah's commission to Nineveh — a great city within the Assyrian world and part of the power Israel feared — provokes not obedience but flight. He boards a ship to Tarshish, sailing in the opposite direction. The narrator's repeated phrase 'from the presence of the LORD' underscores the theological absurdity: no one truly flees God, but Jonah tries.\n\nGod's response is a divinely-appointed storm — a common biblical motif for divine confrontation. The pagan sailors' response contrasts sharply with the prophet's: they pray, they show mercy, they seek righteousness. Jonah, meanwhile, sleeps below deck — a portrait of spiritual apathy. His confession — 'I am a Hebrew, and I fear the LORD, the God of heaven, who made the sea and the dry land' (Jonah 1:9) — is orthodox in creed but broken in obedience.\n\nThe 'great fish' (not necessarily a whale in the modern taxonomic sense) becomes an unlikely rescue vehicle. Jonah's psalm from within it (chapter 2) is a rich mosaic of prior psalms — sinking, drowning, being 'cast out of your sight,' and yet clinging to God's temple. In three days and nights, the man of God is refashioned. Jesus later invokes this as a sign of His own death and resurrection (Matthew 12:39-41).\n\nThe Ninevite response to Jonah's abbreviated sermon is one of Scripture's most stunning revivals: from king to commoner to cattle, mourning and repentance sweep the city. God relents. And here the book's real tension surfaces — Jonah is angry that God is merciful. His prayer in Jonah 4:2 is a devastating self-indictment: he had known all along that God is 'gracious and compassionate, slow to anger and abounding in love, a God who relents from sending calamity.'\n\nThe book ends with a question, not an answer: 'Should I not have concern for the great city of Nineveh?' (4:11). The reader is left to answer it. Jonah is a mirror — for Israel, for the Church, for us. God's mercy is scandalously wide. He is not our tribal deity. His love pursues the very people we would rather see judged. To be Jonah's audience is to be summoned into God's larger heart."
  },
  {
    "id": "s5",
    "title": "The Good Shepherd",
    "topic": "shepherd",
    "premium": false,
    "image": "local:s5",
    "character_emoji": "🐑",
    "summary": "Jesus leaves the 99 to find the 1.",
    "kids_text": "One day, Jesus was teaching a big crowd. Some grown-ups grumbled because Jesus was being kind to people who had made mistakes. So Jesus told them a story. \"Imagine you have 100 sheep,\" He said, \"and one of them wanders away and gets lost. What would you do?\"\n\nThe good shepherd loved every single one of his sheep. He would not just say, \"Oh well, I still have 99 — that's enough.\" No way! He'd leave those 99 and go searching everywhere for the one that was lost. Over rocky hills, through thorny bushes, across streams — the shepherd would look and look and call, \"Little sheep, where are you?\"\n\nAnd when he finally found that little lost lamb — maybe it was scared and shivering, or caught in some prickly branches — the shepherd wouldn't scold it. Oh no! He would gently pick it up, put it on his shoulders, and carry it all the way home, smiling the whole way.\n\nWhen he got home, he'd invite all his neighbors: \"Come celebrate with me! I found my lost sheep!\" And there would be a great big party.\n\nThen Jesus explained that heaven rejoices when one lost person turns back to God. In another teaching, Jesus called Himself the Good Shepherd who knows His sheep and lays down His life for them.\n\nSo remember: no matter what mistakes you make, or how lost you feel, Jesus is the Good Shepherd who will always come looking for you. You are that precious little lamb, and God loves you SO much. 🐑❤️",
    "adult_text": "In Luke 15, Jesus responds to the Pharisees' complaint that He 'welcomes sinners and eats with them' by telling three consecutive parables about lostness: the lost sheep, the lost coin, and the lost son. Each parable escalates the intensity and clarifies the extravagant nature of divine pursuit.\n\nThe parable of the lost sheep begins with a rhetorical challenge: 'Which of you...' — placing the audience in the shepherd's sandals. In first-century Palestinian pastoral culture, a shepherd bore direct responsibility for every animal. Losing one was not an acceptable statistical loss; it was a wound to the shepherd's honor and the flock's integrity.\n\nThe shepherd leaves the ninety-nine 'in the wilderness' (v. 4) — an image that has puzzled some interpreters. Yet within the parable's logic, the ninety-nine represent those already gathered, cared for, in relative safety. The urgency is entirely toward the one that has strayed. 'Until he finds it' (v. 4) — the search is unconditional.\n\nWhen found, the shepherd does not chastise but rejoices. He carries the sheep on his shoulders — a gesture of tender restoration, not punitive correction. The subsequent community celebration ('Rejoice with me, for I have found my lost sheep') is central: recovery of the lost is communal joy, not individual bookkeeping.\n\nJesus' interpretation is unflinching: 'I tell you that in the same way there will be more rejoicing in heaven over one sinner who repents than over ninety-nine righteous persons who do not need to repent' (v. 7). The verse is ironic — none are truly 'righteous' without need of repentance — but the point is heaven's heart: God does not begrudge grace.\n\nIn John 10, Jesus makes the metaphor christological: 'I am the good shepherd. The good shepherd lays down his life for the sheep.' The Cross is the ultimate expression of the shepherd's pursuit. It is not merely that God searches for the lost; He gives Himself to bring them home.\n\nFor the Church, the parable is both comfort and commission: comfort, that we are known and pursued by name; commission, that we are called to share the Shepherd's heart — to see people, not systems; to celebrate recovery, not perform righteousness. In every congregation, in every neighborhood, there is one worth leaving the ninety-nine to find."
  },
  {
    "id": "s6",
    "title": "Feeding the 5,000",
    "topic": "miracle",
    "premium": false,
    "image": "local:s6",
    "character_emoji": "🍞",
    "summary": "A miracle of five loaves and two fish.",
    "kids_text": "It was a long, sunny day, and thousands of people had gathered on the grassy hillside to hear Jesus teach and to be healed. There were about 5,000 men — besides women and children — so the crowd numbered many thousands. The crowd had stayed with Jesus far from nearby villages, and as the day grew late, food became a serious concern.\n\nAs the day got late, the disciples got worried. \"Jesus,\" they said, \"tell everyone to go home for dinner — this is a lonely place and it's getting late.\" But Jesus smiled. \"You give them something to eat,\" He said.\n\nThe disciples were shocked. \"US? We'd need eight months' wages to buy that much bread!\" Then Andrew spoke up. \"There's a little boy here who has 5 small barley loaves and 2 tiny fish. But what is that for so many people?\"\n\nJesus took the five loaves and two fish and said, \"Have everyone sit down on the grass.\" So the crowds sat in groups. Then Jesus lifted up the loaves and fish, looked toward heaven, and thanked God for the food.\n\nAnd then something amazing happened! Jesus started breaking the bread and giving it to the disciples, who passed it out. But the bread just kept coming! And the fish, too! Everyone — ALL those thousands of people — ate as much as they wanted. Everyone ate and was satisfied.\n\nWhen everyone was completely satisfied, Jesus said, \"Now gather up the leftovers so nothing is wasted.\" The disciples collected TWELVE big baskets full of leftover pieces. From one boy's small lunch, Jesus fed a whole town, with plenty to spare!\n\nThis miracle shows us two things: First, when we give what little we have to Jesus, He can do amazing things. Second, Jesus cares for us — not just our souls, but our stomachs too. He is the Bread of Life! 🍞🐟",
    "adult_text": "The feeding of the 5,000 is the only miracle (aside from the Resurrection) recorded in all four Gospels (Matthew 14, Mark 6, Luke 9, John 6), signaling its foundational importance to early Christian testimony. Read together, the accounts weave a portrait of Christ's compassion, sovereignty, and self-revelation.\n\nThe setting is a remote place near the Sea of Galilee. The crowd—5,000 men, besides women and children—has followed Jesus far from the villages, drawn by His teaching and healing. As evening approaches, the disciples urge dismissal, but Jesus responds with the disruptive imperative: 'You give them something to eat' (Mark 6:37).\n\nThe disciples' math is unyielding — 200 denarii (roughly eight months' wages) would not suffice. But Andrew, in John's account (6:9), highlights a boy with five barley loaves and two small fish. It is a modest amount for such a crowd. Andrew's follow-up — 'but what are they among so many?' — reveals the disciples' honest sense of impossibility.\n\nJesus' actions are richly Eucharistic in shape: He takes the bread, gives thanks, breaks it, and gives it. Luke and John particularly emphasize these verbs, which would later shape the church's liturgical language. The crowd is arranged in orderly 'companies' — an image drawing on Israel in the wilderness, gathered as God's people around Moses. Just as manna once fed the multitudes in the desert, Jesus now provides the true bread from heaven.\n\nThe abundance is intentional: 'all ate and were satisfied' (Mark 6:42), with twelve baskets remaining. Christian readers often connect the number twelve with Israel and the twelve disciples, though the Gospels do not explain the symbolism directly. God's provision is not merely sufficient but overflowing.\n\nJohn's Gospel develops the theological richness most fully. Following the miracle, Jesus withdraws when the crowd wants to make Him king (John 6:15) — He refuses political messianism. The next day, He delivers the Bread of Life discourse (John 6:35-59): 'I am the bread of life. Whoever comes to me will never go hungry.' The miracle points beyond physical bread to Christ Himself as spiritual sustenance.\n\nFor the church, the feeding invites reflection on generosity (the boy's small offering multiplied), Eucharist (Christ present in broken bread), and mission (compassion for real physical needs). The disciples are transformed from problem-solvers to distributors of God's grace — a paradigm for Christian ministry. In the hands of Christ, our meager resources become food for the multitudes."
  },
  {
    "id": "s7",
    "title": "Moses & the Burning Bush",
    "topic": "moses",
    "premium": false,
    "image": "local:s7",
    "character_emoji": "🔥",
    "summary": "God calls Moses from a fiery bush.",
    "kids_text": "Moses had been living in the desert for many years. Long ago he had grown up in Pharaoh’s household, but now he was a shepherd, watching sheep for his father-in-law Jethro. One ordinary day, Moses was leading the sheep near a mountain called Horeb. Suddenly, he saw the strangest thing — a bush was on FIRE, but the fire wasn't burning it up! The leaves stayed green, the branches didn't shrivel — it just kept glowing!\n\n\"That's weird!\" Moses said. \"I have to go look closer.\" As he walked toward the bush, a voice called out: \"Moses! Moses!\" Moses jumped and answered, \"Here I am!\" \n\n\"Don't come any closer,\" the voice said. \"Take off your sandals, because you are standing on holy ground. I am the God of your father Abraham, the God of Isaac, and the God of Jacob.\" Moses hid his face — he was afraid to look at God!\n\nThen God spoke of His plan: \"I have seen how my people are suffering in Egypt. I have heard them crying out because of their harsh slave-masters. I care about them. So I am sending YOU, Moses, to Pharaoh, to bring my people out of Egypt.\"\n\nMoses was terrified! \"Me? I'm nobody! Who am I to do this?\" God answered, \"I will be with you.\" Moses had more questions. \"What if they ask me your name?\" And God said, \"Tell them: I AM has sent you. I AM WHO I AM.\"\n\nStill Moses was nervous. \"What if they don't believe me?\" God gave Moses a special sign — his shepherd's staff could turn into a snake and back again! And Moses' hand could turn white and be healed. \"But Lord, I'm not good at speaking,\" Moses protested. God said, \"I will help you speak. And I'll send your brother Aaron with you.\"\n\nMoses obeyed. He left the desert to face the mighty Pharaoh — and this is how the great story of the Exodus began! When God calls, remember: He doesn't need you to be perfect. He just needs you to say YES. 🔥",
    "adult_text": "Exodus 3 marks one of the most theologically dense encounters in the Old Testament — the theophany at the burning bush. After 40 years of obscurity as a shepherd in Midian (having fled Egypt as a fugitive), Moses is arrested by a natural phenomenon that defies natural explanation: a bush burning yet not consumed. His curiosity — 'I will turn aside to see this great sight' (3:3) — invites divine encounter.\n\nGod's opening command establishes reverence: 'Do not come near; put off your shoes from your feet, for the place on which you are standing is holy ground' (3:5). Sanctity is not intrinsic to the location but conferred by divine presence. The self-revelation follows: 'I am the God of your father, the God of Abraham, the God of Isaac, and the God of Jacob' (3:6) — locating this moment within the ongoing covenant story.\n\nGod then unveils His purpose. He has 'seen the affliction' of His people, 'heard their cry,' and 'known their sufferings.' The verbs pile up: He is not a distant deity. Then the commission: 'Come, I will send you to Pharaoh that you may bring my people, the children of Israel, out of Egypt' (3:10). What God has seen and heard, He now moves to accomplish — through Moses.\n\nMoses' five successive objections (3:11-4:17) form the theological heart of the passage:\n1. 'Who am I?' — God's answer: 'I will be with you.'\n2. 'What is your name?' — God discloses: 'I AM WHO I AM' (Hebrew: EHYEH ASHER EHYEH). This is the tetragrammaton YHWH, revealing God's self-existent, covenant-keeping being.\n3. 'They will not believe me' — God provides signs (staff-to-serpent, leprous hand, water-to-blood).\n4. 'I am not eloquent' — God commissions his speech.\n5. 'Send someone else' — God provides Aaron as spokesman.\n\nThe name 'I AM' is the theological summit. Unlike pagan deities named by their functions or domains, YHWH's name is a verb of being — He simply IS. His existence is not contingent; His covenant faithfulness is grounded in His own eternal nature.\n\nThe passage has resonated through millennia as the pattern of divine calling: God chooses the obscure, the flawed, the reluctant. He commissions not because we are qualified, but because He is present. Every calling begins with a moment where we, like Moses, must decide whether to turn aside and look — and then, whether to say yes. From the burning bush comes the Exodus; from personal encounter with God comes the possibility of participating in His redemptive work."
  },
  {
    "id": "s8",
    "title": "The Ten Commandments",
    "topic": "commandments",
    "premium": false,
    "image": "local:s8",
    "character_emoji": "📜",
    "summary": "God gives Moses laws written in stone.",
    "kids_text": "After God rescued His people from Egypt, they camped near a huge mountain called Sinai. The mountain was covered in dark clouds, and it shook with thunder and flashed with lightning. God's presence was there!\n\nAt Sinai, God spoke TEN covenant commands to His people, teaching them how to live faithfully with God and one another. Later, Moses climbed into the cloud on the mountain and remained there for 40 days and 40 nights. God gave him two stone tablets bearing the covenant commands.\n\nChristian traditions sometimes number them differently; here is one common Protestant ordering in kid-friendly words:\n\n1. Love God best — no other gods.\n2. Don't make statues to worship.\n3. Use God's name with respect.\n4. Rest on the special day (Sabbath).\n5. Honor your mom and dad.\n6. Don't murder.\n7. Be faithful in marriage.\n8. Don't steal things.\n9. Don't tell lies about others.\n10. Don't be jealous of what others have.\n\nWhen Moses came down the mountain carrying the two stone tablets, he found the people had done something terrible — they had made a big golden calf and were worshiping it! Moses was so upset that he threw down the tablets and they broke! But God, in His mercy, gave Moses a second set of tablets, and He forgave the people.\n\nThese ten rules aren't there to make our lives boring — they show a rescued people how to live faithfully with God and with one another. Jesus said we can sum them ALL up in two rules: love God with all your heart, and love your neighbor as yourself. When we love, we do what God wants. ❤️📜",
    "adult_text": "Exodus 20 presents the Decalogue — the ten 'words' (Hebrew: aseret ha-dibbrot) — the ethical and covenantal foundation of Israel's identity. The setting at Mount Sinai is deliberately theophanic: thunder, lightning, thick cloud, and trumpet blast. God descends in fire; the mountain quakes. Israel has been redeemed from Egypt; now they will receive their covenantal charter.\n\nThe prologue is crucial: 'I am the LORD your God, who brought you out of the land of Egypt, out of the house of slavery' (20:2). The commandments are not arbitrary demands — they emerge from a redemptive relationship already established. Obedience is the response of gratitude, not the price of deliverance.\n\nA common Protestant teaching arrangement groups the Decalogue into duties toward God and duties toward neighbor. Other Jewish and Christian traditions number the commands differently:\n\nDuties toward God:\n1. Exclusive worship of YHWH — no other gods.\n2. No carved images for worship — God must not be reduced to an idol or manipulated by human craft.\n3. Reverent use of God's name — no invocation of the divine for empty purposes.\n4. Sabbath observance — rest built into the rhythm of creation.\n\nDuties toward neighbor:\n5. Honor parents — the family as the first ordering of society.\n6. No murder — sanctity of image-bearing life.\n7. No adultery — the integrity of covenant fidelity.\n8. No theft — the protection of neighbor's property.\n9. No false testimony — the sanctity of truth-telling in community.\n10. No coveting — the interior discipline underlying all outward acts.\n\nJesus summarizes the whole Law in two great commandments (Matthew 22:37-40): love God with all one's heart, soul, mind, and strength (Deuteronomy 6:5), and love neighbor as oneself (Leviticus 19:18). The Decalogue is not abolished but fulfilled in Christ (Matthew 5:17-19).\n\nThe Ten Commandments have deeply influenced Jewish and Christian ethics and many legal and moral traditions. They articulate a vision of human flourishing rooted in reverence for God and neighbor. They are not a ladder to earn God's favor — Israel has already been redeemed. They are the shape of covenant life for a rescued people.\n\nMany Christian traditions understand their moral vision as continuing within the new covenant, where obedience is shaped by grace and the work of the Spirit rather than treated as a way to earn salvation. Paul writes: 'The commandments...are summed up in this word: You shall love your neighbor as yourself. Love does no wrong to a neighbor; therefore love is the fulfilling of the law' (Romans 13:9-10). To live the Decalogue is to walk in the freedom of the redeemed — grounded in grace, expressed in love."
  },
  {
    "id": "s9",
    "title": "The Good Samaritan",
    "topic": "parable",
    "premium": true,
    "image": "local:s9",
    "character_emoji": "🤝",
    "summary": "A kind stranger helps a hurt traveler.",
    "kids_text": "One day, a teacher of the law asked Jesus, \"Who is my neighbor? Who am I supposed to love?\" Jesus answered with a story that changed everything.\n\nThere was a man walking down a long, winding road from Jerusalem to Jericho. It was a dangerous road! Suddenly, robbers jumped out from behind the rocks, beat the poor man up, stole all his money and clothes, and left him half-dead on the side of the road.\n\nThe poor man lay there, hurt and bleeding, hoping someone would help. Soon, a priest — an important religious leader — came walking down the road. Surely HE would stop and help! But when the priest saw the wounded man... he crossed to the OTHER side of the road and hurried past.\n\nNext, a Levite came by. Levites worked at the temple. Surely HE would help! But when the Levite saw the man, he ALSO crossed the road and walked right on by.\n\nFinally, a Samaritan came along. Now here's the surprising part: Jews and Samaritans didn't like each other. In fact, they avoided each other. But when THIS Samaritan saw the injured man, his heart was filled with love and pity. He stopped right away.\n\nThe Samaritan cleaned and bandaged the man's wounds. He poured on oil and wine to help them heal. Then he lifted the man onto his own donkey and walked beside him all the way to an inn. He paid the innkeeper and said, \"Take care of him. When I come back, I'll pay you any extra costs.\"\n\nJesus looked at the teacher and asked, \"Who was a real neighbor to the man in trouble?\" The teacher answered, \"The one who showed mercy.\" And Jesus said, \"Go and do the same.\"\n\nBeing a good neighbor doesn't mean helping only people who look like us or think like us. It means helping ANYONE who needs kindness — even people we might not naturally like. Because that's how Jesus loves us! 🤝❤️",
    "adult_text": "Luke 10:25-37 is one of the most theologically subversive parables in the Gospels — Jesus' reframing of the question 'Who is my neighbor?' upends religious tribalism and reveals the boundary-crossing shape of divine love.\n\nThe immediate context is a legal encounter. A 'lawyer' (an expert in Torah) tests Jesus with the question of eternal life. Jesus, in classic Rabbinic fashion, returns the question. The lawyer cites the Shema (Deuteronomy 6:5) and Leviticus 19:18 — love God, love neighbor. Jesus affirms: 'You have answered correctly; do this, and you will live' (v. 28). But the lawyer, 'wanting to justify himself' (v. 29), asks the follow-up that will trap him: 'And who is my neighbor?'\n\nThe lawyer’s question seeks a boundary around the word ‘neighbor.’ Jesus answers not with a list of who qualifies, but with a story that turns the question toward merciful action.\n\nThe setting — the road from Jerusalem to Jericho — is realistic. A steep 17-mile descent through rocky terrain, notorious for banditry. A traveler is stripped, beaten, left half-dead. The narrative then presents three would-be helpers:\n\nThe priest — the highest religious official. He 'saw him and passed by on the other side.' Some interpreters have suggested ritual purity concerns (contact with a corpse would defile), but Jesus makes no such excuse. The priest's failure is stark.\n\nThe Levite — a temple assistant, ritually significant. He too 'came to the place and saw him' — same verbs — but again 'passed by on the other side.' The repetition emphasizes deliberate avoidance.\n\nThe Samaritan — and here Jesus’ choice is intentionally provocative. Jewish and Samaritan communities carried a long history of religious and social conflict, including disagreement over the proper place of worship. By making the Samaritan the compassionate neighbor, Jesus overturns the audience’s expectations and refuses to let inherited hostility define faithful love.\n\nThe Samaritan's response is comprehensive: he sees, feels compassion (Greek: esplanchnisthē — a gut-level emotion), and acts. He administers first aid (oil and wine), transports the victim on his own animal, brings him to safe lodging, spends the night attending to him, and commits to further financial responsibility. His mercy is not sentimental — it is costly, sustained, and personal.\n\nJesus flips the lawyer's question: not 'Who qualifies as my neighbor?' but 'Which of these three proved himself neighbor to the one who fell among the robbers?' (v. 36). The lawyer answers, 'The one who showed mercy,' and Jesus commands: 'You go, and do likewise' (v. 37).\n\nThe parable subverts every attempt to make love conditional or convenient. Neighborliness is not defined by proximity, ethnicity, or religious agreement. It is defined by presence to suffering and willingness to act. In the ethics of Jesus, the person in need — anywhere, anyone — is my neighbor. And this obligation is not additional to love of God; it is inseparable from it. 'Whoever does not love his brother whom he has seen cannot love God whom he has not seen' (1 John 4:20)."
  },
  {
    "id": "s10",
    "title": "The Prodigal Son",
    "topic": "parable",
    "premium": true,
    "image": "local:s10",
    "character_emoji": "🏠",
    "summary": "A father's love welcomes a lost son home.",
    "kids_text": "Once upon a time, there was a father who had two sons. One day, the younger son came to his father with a bold request: \"Father, please give me my share of the money now — I want to leave home and see the world!\" This was hurtful — it was like saying \"I wish you were already gone.\" But the father, with great love, agreed. He divided his money and gave the younger son his share.\n\nThe younger son packed up everything and traveled to a faraway country. He spent his money on parties, fancy clothes, and silly things. Very quickly, all his money was gone! And to make it worse, a great famine came — no food anywhere. The boy was starving. He got a job feeding pigs, and he was so hungry, he even wished he could eat the pigs' food!\n\nOne day, sitting alone in the pig pen, the young man came to his senses. \"Even my father's servants back home have plenty of food! I've been so foolish. I'll go home and tell my dad, 'I've sinned. I'm not worthy to be your son. Just let me be a servant.'\" So he got up and started the long, long journey home.\n\nNow here's the beautiful part. When the son was still a long way off, his father saw him! The father was filled with compassion. He RAN to his son, threw his arms around him, and kissed him before the son could earn anything back.\n\nThe son started his sorry speech, but the father called to his servants: \"Quick! Bring the best robe! Put a ring on his finger and shoes on his feet. Prepare a big feast — my son who was lost has been found! My son who was dead is alive!\"\n\nBut the older brother, out working in the fields, heard music and dancing. When he learned it was a party for his little brother, he was ANGRY. \"I've served you all these years,\" he complained to his dad, \"and you never threw a party for me!\" The father said gently, \"My son, everything I have is yours. But we HAD to celebrate — your brother was lost, and now he is found.\"\n\nThis story is really about God. God is like that loving father, always watching for us, always ready to run to us with wide-open arms. No matter what we've done, we can always come home. God's love is bigger than any mistake. 🏃❤️",
    "adult_text": "Luke 15:11-32 is often called the greatest short story ever told — Jesus' most tender and structurally intricate parable, revealing the extravagant heart of the Father toward two very different kinds of lostness. It is the third of three parables in Luke 15 addressing the Pharisees' complaint about Jesus welcoming sinners.\n\nThe Younger Son's Rebellion. The request for the inheritance while the father lives is a shocking rejection of the father and the family bond. Yet the father grants it without protest. The son's subsequent journey to a 'far country' represents complete severance — geographic, moral, and covenantal. He squanders his inheritance in 'reckless living' (v. 13). The famine that follows leaves him desperate, and his employment feeding pigs—animals ritually unclean to Jews—shows how far his circumstances have fallen. 'He longed to be fed with the pods that the pigs ate' (v. 16). The son has become less-than-slave.\n\nThe Son's Repentance. The turning point is deeply psychological: 'he came to himself' (v. 17). Repentance begins not in religious ecstasy but in honest self-appraisal. He composes a confession: 'Father, I have sinned against heaven and before you; I am no longer worthy to be called your son; treat me as one of your hired servants' (vv. 18-19). He plans to return not as a son claiming privilege but as a hired worker asking mercy.\n\nThe Father's Extravagance. The father's response overturns all expectations. 'While he was still a long way off, his father saw him and felt compassion, and ran and embraced him and kissed him' (v. 20). The father’s running conveys urgent compassion and a willingness to cross the distance himself. He interrupts the son's rehearsed confession, refusing to allow him to negotiate a lesser status. Instead, he orders the best robe, a ring, shoes, and a fattened calf—public signs of restored belonging and celebration.\n\nThe Elder Brother's Resentment. The parable turns, unexpectedly, on the elder son. He has been the dutiful, obedient son — and yet his response to his brother's return is bitter, distant, and self-righteous. 'These many years I have served you, and I never disobeyed your command... but when this son of yours came' (v. 30) — note he refuses to call his brother 'brother.' The elder son's lostness is more subtle but equally real: he has lived in the father's house without ever entering the father's heart. He has served but not communed.\n\nThe Father's Renewed Pursuit. Just as the father ran to the younger son, he now goes out to plead with the older. He pursues both. 'Son, you are always with me, and all that is mine is yours' (v. 31) — a gentle reminder of covenantal privilege he has failed to enjoy. Then the theological center: 'It was fitting to celebrate and be glad, for this your brother was dead, and is alive; he was lost, and is found' (v. 32).\n\nTheological Depth. The parable is unfinished — we never learn whether the elder brother enters the feast. Jesus leaves the ending open for His actual audience — the Pharisees. Will they, the elder brothers, enter the celebration for sinners coming home? The parable is a mirror for all religious insiders who resent grace given to outsiders.\n\nUltimately, the parable is not about the sons — it is about the Father. Both sons are lost — one through licentiousness, one through moralism — and both are pursued by a Father whose love refuses to be earned or exhausted. This is the Gospel: not that we work our way back to a distant God, but that God comes running to us while we are still a long way off."
  },
  {
    "id": "s11",
    "title": "The Nativity",
    "topic": "nativity",
    "premium": true,
    "image": "local:s11",
    "character_emoji": "⭐",
    "summary": "The birth of Jesus in Bethlehem.",
    "kids_text": "In a little town in Israel called Nazareth, there lived a young woman named Mary. She was engaged to a kind carpenter named Joseph. One day, an angel named Gabriel appeared to Mary. \"Do not be afraid, Mary!\" the angel said. \"You will have a baby, and you will name Him Jesus. He will be great and will be called the Son of the Most High.\" Mary was surprised but said, \"I am the Lord's servant. May it be as you have said.\"\n\nMeanwhile, the Roman ruler, Caesar Augustus, ordered everyone to return to their family's hometown to be counted. So Mary and Joseph had to travel all the way to Bethlehem, because Joseph came from King David's family line. Mary was very pregnant, and the journey was long and demanding. Scripture does not tell us exactly how they traveled.\n\nWhen they arrived in Bethlehem, the available guest space was full. Mary and Joseph stayed in humble circumstances. There, baby Jesus was born. Mary wrapped Him snugly in cloths and laid Him in a manger — a feeding place for animals. Scripture gives us these simple details without naming an innkeeper or describing every part of the room.\n\nOut in the fields nearby, some shepherds were watching over their sheep in the darkness. Suddenly, an angel appeared, shining bright! \"Do not be afraid!\" the angel said. \"I bring you good news of great joy! Today in Bethlehem, a Savior has been born — He is Christ the Lord!\" Then a great HEAVENLY HOST appeared, praising God and saying, \"Glory to God in the highest, and peace on earth!\"\n\nThe shepherds hurried to Bethlehem and found Mary, Joseph, and baby Jesus in the manger, just as the angel said. They told others what they had heard and returned praising God. Later, wise men from the East followed a star to find the young King. When they arrived, they brought THREE special gifts: gold, frankincense, and myrrh. Christians have long reflected on how these costly gifts point to Jesus’ kingship, worship, and future suffering.\n\nThe world's Savior — the King of Kings — was born in humble circumstances and worshiped by shepherds and wise men. God had come to earth to be with us. That's what Christmas is all about! ⭐👶",
    "adult_text": "The Nativity narratives — recorded principally in Matthew 1-2 and Luke 1-2 — constitute the theological threshold of the New Testament. In Christ's birth, the incarnation of God is disclosed: the eternal Word entered human history, taking on flesh, and dwelling among us (John 1:14).\n\nThe Annunciation (Luke 1:26-38). The angel Gabriel appears to Mary, a young virgin engaged to Joseph in Nazareth. The announcement is theologically saturated: her son will be great, called Son of the Most High, given the throne of His father David, and His kingdom will have no end (vv. 32-33). Mary's response — 'Behold, I am the servant of the Lord; let it be to me according to your word' (v. 38) — models faith. The Magnificat that follows (vv. 46-55) reveals a young woman deeply shaped by Israel's prophetic tradition; her song echoes Hannah's (1 Samuel 2), Isaiah, and the Psalms, celebrating God's reversal of proud powers and elevation of the humble.\n\nThe Journey to Bethlehem (Luke 2:1-5). Caesar Augustus's decree — a census requiring registration in ancestral towns — sets the stage. Joseph, of Davidic descent, travels with Mary to Bethlehem. The detail fulfills Micah 5:2 — 'But you, Bethlehem Ephrathah... from you shall come forth for me one who is to be ruler in Israel.'\n\nThe Birth (Luke 2:6-7). The birth itself is described with striking economy: 'she gave birth to her firstborn son and wrapped him in swaddling cloths and laid him in a manger, because there was no place for them in the inn.' The Greek word often translated 'inn' (kataluma) can also refer to a guest room. The manger—a feeding trough—underscores the humble circumstances of Jesus’ birth without supplying details the text does not give. The King of Glory begins His life in the context of everyday human displacement.\n\nThe Shepherds (Luke 2:8-20). Angels appear to shepherds — a socially marginal group. The angelic annunciation is the first Gospel proclamation: 'Fear not, for behold, I bring you good news of great joy that will be for all the people. For unto you is born this day in the city of David a Savior, who is Christ the Lord' (vv. 10-11). Three titles converge: Savior, Christ (Messiah), Lord (kyrios — a divine title). The heavenly host praises God: 'Glory to God in the highest, and on earth peace among those with whom he is pleased' (v. 14). The shepherds respond immediately, becoming the first witnesses.\n\nThe Magi (Matthew 2:1-12). Matthew's account emphasizes different themes. The Magi — learned visitors from the East — arrive in Jerusalem 'in the days of Herod the king,' following a star. Their inquiry — 'Where is he who has been born king of the Jews?' — alarms Herod, whose brutal insecurity later drives the massacre of the innocents (2:16-18). The Magi bring gold, frankincense, and myrrh. Christian readers have often seen echoes of kingship, worship, and suffering in these gifts, though Matthew does not explain their symbolism directly. Their inclusion signals from the outset that Christ's kingdom is for the Gentiles as well as for Israel.\n\nTheological Themes. The Nativity narratives reveal several core convictions:\n- Incarnation: God becomes truly human without ceasing to be truly God.\n- Fulfillment: Every detail — Bethlehem, virgin birth, Davidic line, Egyptian sojourn — fulfills prophetic anticipation.\n- Reversal: God works through socially overlooked people and places—Nazareth, shepherds, and a young woman from an obscure Roman province.\n- Universality: Both the local (shepherds) and the distant (Magi) come to worship — the Gospel is for all peoples.\n- Humility: The King enters human history not in a palace but in a humble household setting.\n\nIn the Incarnation, the great exchange begins. Athanasius famously described the Son becoming human so that human beings might share in God's life. The child in the manger is the eternal Son of God, whose life, death, and resurrection would inaugurate the new creation. Every Nativity scene, every carol, every candlelight service points to this astonishing reality: God has come."
  },
  {
    "id": "s12",
    "title": "Pentecost",
    "topic": "spirit",
    "premium": true,
    "image": "local:s12",
    "character_emoji": "🔥",
    "summary": "The Holy Spirit fills the disciples.",
    "kids_text": "After Jesus rose from the dead, He spent 40 wonderful days with His disciples. Then He told them, \"Soon I will go back to My Father in heaven. But don't leave Jerusalem — wait for the special gift I promised. The Holy Spirit is coming to help you!\" Then, right before their eyes, Jesus was lifted up into the sky and disappeared into a cloud.\n\nThe disciples went back to Jerusalem, feeling both excited and a little scared. What would happen next? They gathered together and devoted themselves to prayer as they waited.\n\nThen came a special Jewish festival called Pentecost. Jesus' followers were together in one place. Suddenly, from heaven came a sound like a MIGHTY RUSHING WIND! It filled the whole house. WHOOSH! Then something even more amazing appeared — little flames like fire, and one hovered right above each person's head! Everyone was filled with the Holy Spirit.\n\nNow, Jerusalem was crowded with visitors from many different countries — Egypt, Rome, Persia, Arabia — all speaking different languages. But when the disciples started to speak, the visitors heard the message about Jesus in their OWN language! Everyone was amazed. \"How is this happening?\" they asked.\n\nThen Peter — the same Peter who used to be scared — stood up boldly. He spoke to the huge crowd about Jesus: how Jesus had died for their sins and risen again. \"Turn to God!\" Peter said. \"Believe in Jesus, and be baptized. You will receive the gift of the Holy Spirit too!\"\n\nThe people were touched deeply. That day, THREE THOUSAND people believed in Jesus and were baptized! This day became a major beginning point in the Church’s public witness.\n\nThe Holy Spirit is still with us today, helping us understand God's love, giving us courage, and filling our hearts with peace and joy. Just like the wind and the fire, the Holy Spirit is powerful — and He lives inside every follower of Jesus! 🔥🕊️",
    "adult_text": "Acts 2 records the outpouring of the Holy Spirit at Pentecost — a foundational moment in the public life of the Christian Church and the inauguration of a new phase in redemptive history. The event fulfills Old Testament prophecies (Joel 2:28-32; Ezekiel 36:26-27) and Jesus' own promise (Luke 24:49; John 14-16; Acts 1:4-8).\n\nThe Setting. Pentecost (Greek: pentēkostē — 'fiftieth') was the Jewish Feast of Weeks (Shavuot), celebrated fifty days after Passover. Later Jewish tradition associated the feast with the giving of the Law at Sinai; it was also a pilgrimage feast that brought diaspora Jews from throughout the Roman world back to Jerusalem. The timing is providentially perfect: the Spirit's outpouring occurs when representatives 'from every nation under heaven' (2:5) are gathered.\n\nThe Phenomena. Three sensory manifestations mark the Spirit's arrival:\n- Sound of a violent wind — recalling the Hebrew ruach ('wind/spirit'), evocative of God's creative breath (Genesis 2:7) and the valley of dry bones (Ezekiel 37).\n- Tongues of fire — divine presence imagery (Exodus 3, 19; Isaiah 6). Fire descends and rests on each individual — the Spirit's presence is distributed, personal.\n- Speaking in other tongues — Acts emphasizes that the international crowd heard the mighty works of God in their own languages (vv. 6, 11). This is the Spirit-enabled proclamation of 'the mighty works of God' (v. 11).\n\nBabel and Pentecost. Many Christian interpreters read the linguistic miracle as an echo and reversal of Genesis 11 — where God confused human language as judgment against Babel's proud tower. At Pentecost, the Spirit enables communication across linguistic barriers. The Gospel is announced as universally accessible. What sin scattered, the Spirit gathers.\n\nPeter's Sermon (Acts 2:14-41). The Galilean fisherman who denied Christ weeks earlier now stands boldly before thousands. His sermon anchors the phenomenon in Joel's prophecy ('In the last days, God says, I will pour out my Spirit on all people' — Joel 2:28), then presents the crucified and risen Jesus as Israel's promised Messiah and Lord. Peter's argument builds from Psalm 16 (David's prophecy of resurrection) and Psalm 110 (the exalted Lord at God's right hand), climaxing in the assertion: 'Let all Israel be assured of this: God has made this Jesus, whom you crucified, both Lord and Christ' (v. 36).\n\nThe Response. The crowd is 'cut to the heart' and asks, 'What shall we do?' (v. 37). Peter's answer becomes the pattern of Christian initiation: 'Repent and be baptized... in the name of Jesus Christ for the forgiveness of your sins, and you will receive the gift of the Holy Spirit' (v. 38). Three thousand are baptized that day (v. 41).\n\nThe New Community (Acts 2:42-47). Luke describes the resulting community — devoted to apostolic teaching, fellowship, the breaking of bread, and prayer. There is shared property, daily gathering, joyful hearts, and the daily addition of new believers. The Spirit's outpouring is not primarily about spectacular gifts but about the birth of a new humanity, a family of God gathered across ethnic and linguistic lines.\n\nTheological Significance.\n- Trinitarian: The Father, through the risen Christ (Acts 2:33), sends the Spirit to indwell the Church.\n- Ecclesiological: The Church is constituted not by human organization but by Spirit-empowered witness.\n- Missional: The Spirit is given for the Church's outward-facing task of proclamation.\n- Democratic: The Spirit is poured out on 'all flesh' — young and old, men and women, slaves and free (Joel 2:28-29). Every believer is Spirit-empowered.\n\nPentecost is the ongoing reality of the Church. What began in Jerusalem continues wherever the Spirit indwells believers, empowering witness, uniting diverse peoples, and pointing to the consummation of all things in Christ."
  },
  {
    "id": "s13",
    "title": "Palm Sunday & the Passion",
    "topic": "passion",
    "premium": true,
    "image": "local:s13",
    "character_emoji": "🌿",
    "summary": "Jesus enters Jerusalem as King.",
    "kids_text": "It was almost Passover, and Jesus was traveling to Jerusalem with His disciples. But something amazing was about to happen — Jesus was going to enter the great city as a KING! But not the kind of king everyone expected.\n\nJesus told two of His disciples, \"Go into the next village. You will find a young donkey tied up. Untie it and bring it to Me.\" They did just that, and brought the little donkey to Jesus. They put their cloaks on its back, and Jesus climbed on.\n\nJesus rode a humble young donkey, fulfilling the prophet Zechariah’s picture of a gentle king who brings salvation and peace.\n\nAs Jesus rode toward Jerusalem, huge crowds gathered on the sides of the road. They were so excited! They took off their coats and laid them down on the road — like a royal red carpet. Others cut down big palm branches from the trees and waved them in the air, or laid them on the road too. And they shouted, \"HOSANNA! Blessed is He who comes in the name of the Lord! Hosanna in the highest!\" \"Hosanna\" means \"Save us!\"\n\nSome of the religious leaders were upset. \"Jesus, tell your followers to be quiet!\" they demanded. But Jesus said, \"If they were quiet, the very stones would cry out!\"\n\nJesus rode all the way to the temple. It was a joyful, incredible day. But sadly, within a few short days, powerful leaders and a crowd would call for His death. Jesus knew this. He knew He had come to Jerusalem to give His life for the sins of the whole world.\n\nDuring the days that followed, Jesus was arrested, tried, and crucified on a cross. But that wasn't the end! On the first day of the week, His followers discovered that Jesus had risen from the dead, alive forever! Palm Sunday reminds us that Jesus is the true King — a King of love, peace, and salvation. And every time we say 'Hosanna,' we join that ancient crowd praising Him. 🌿👑",
    "adult_text": "The Triumphal Entry — recorded in all four Gospels (Matthew 21:1-11; Mark 11:1-11; Luke 19:28-44; John 12:12-19) — marks the beginning of Holy Week and Jesus' decisive move toward the Cross. The event is both fulfillment of prophecy and provocative public declaration of messianic identity.\n\nThe Prophetic Setting. Jesus' choice of a donkey (specifically, a colt on which no one had ridden) fulfills Zechariah 9:9: 'Rejoice greatly, O daughter of Zion! Shout aloud, O daughter of Jerusalem! Behold, your king is coming to you; righteous and having salvation is he, humble and mounted on a donkey.' The prophecy is deliberately fulfilled — Jesus arranges the details in advance ('The Lord has need of it,' Luke 19:31). The details are intentional, presenting the entry as a prophetic sign of Jesus’ kingship.\n\nThe Symbolism of the Donkey. Jesus’ choice evokes Zechariah’s humble king and also recalls Solomon riding the royal mule at his coronation (1 Kings 1:33-40). The entry presents a kingship shaped not by conquest but by peace, humility, and the suffering that lies ahead.\n\nThe Crowd's Actions. The multitudes lay cloaks and palm branches on the road — royal gestures reminiscent of 2 Kings 9:13 (Jehu's acclamation) and 1 Maccabees 13:51 (Simon Maccabeus's entry into Jerusalem). Palm branches were associated with military victory and national deliverance. The crowd's actions ascribe royal, messianic status to Jesus.\n\nHosanna. The Hebrew phrase 'hosanna' (hoshi'anah) means 'Save now!' — a plea from Psalm 118:25-26, part of the Hallel sung at Passover. 'Blessed is he who comes in the name of the Lord' identified the pilgrim being welcomed. But applied to Jesus, the crowd is (perhaps unwittingly) making a messianic acclamation.\n\nJesus' Weeping over Jerusalem (Luke 19:41-44). Only Luke records that as Jesus approached the city, He wept. He foresaw its coming destruction (fulfilled in AD 70) because 'you did not know the time of your visitation.' The King who comes with salvation is being received by many who will soon reject Him.\n\nThe Passion Unfolds. The Gospel accounts move from Jesus’ entry and temple actions to His final teaching, the Last Supper, prayer in Gethsemane, arrest, trials, crucifixion, burial, and resurrection. Christian traditions arrange some events on particular days of Holy Week, while the Gospels themselves emphasize the theological movement toward the cross and the empty tomb.\n\nTheological Themes. Palm Sunday embodies the paradox of Jesus' kingship. The one hailed with 'Hosanna' will soon be met with 'Crucify Him.' The King enters His capital, but His throne will be a cross. The victory He inaugurates is over sin and death, achieved not by violence but by self-giving love.\n\nFor the Church, Palm Sunday is the doorway to the Great Week — the week of the Passion. The crowds' cries invite our own: 'Hosanna! Save now!' The invitation is to recognize the true King, receive His salvation, and follow Him along the road that leads through suffering to resurrection life. As we wave our palms each year, we join the ancient acclamation — and we allow ourselves to be examined: will we welcome Him for who He truly is, or only for who we want Him to be?"
  },
  {
    "id": "s14",
    "title": "Joseph the Dreamer",
    "topic": "joseph",
    "premium": true,
    "image": "local:s14",
    "character_emoji": "🌈",
    "summary": "From slavery to leadership — God’s plan unfolds.",
    "kids_text": "Joseph was the favorite son of his father Jacob. To show his love, Jacob gave Joseph a special long robe, traditionally pictured as a multicolored coat. Joseph also had special dreams from God — dreams that his brothers and even his parents would one day bow down to him! When Joseph told his eleven brothers about his dreams, they got JEALOUS. Very, very jealous.\n\nOne day, when Joseph came to check on his brothers in the fields, they made a terrible plan. They threw him into a deep pit, then sold him as a slave to some merchants heading to Egypt. To trick their father, they dipped Joseph's coat in animal blood and told Jacob a wild beast had eaten him.\n\nIn Egypt, Joseph was sold to a rich man named Potiphar. Even as a slave, Joseph worked hard and trusted God. Potiphar noticed and put Joseph in charge of everything he owned! But then Potiphar's wife told a lie about Joseph, and Joseph was thrown into prison — even though he had done nothing wrong.\n\nIn prison, God was still with Joseph. Two of Pharaoh's servants had strange dreams, and Joseph — with God's help — explained what they meant. Both dreams came true, just like Joseph said.\n\nTwo years later, Pharaoh himself had a scary dream — seven fat cows eaten by seven skinny cows! Pharaoh's cupbearer remembered Joseph. Joseph was rushed from prison to the palace. \"Only God can give the meaning,\" Joseph said humbly. Then he explained: \"Egypt will have seven great years of harvest, then seven terrible years of famine. Save up food now!\"\n\nPharaoh was amazed. He made Joseph the SECOND most important person in all of Egypt! Joseph organized huge food storage. When the famine came, people from many lands traveled to Egypt to buy food — including Joseph's own brothers!\n\nThe brothers didn't recognize Joseph at first. He tested them to see if they had changed. When Joseph finally told them who he was, they were terrified! But Joseph forgave them. \"You meant it for evil,\" he said, \"but God meant it for good — to save many lives!\" Joseph brought his whole family to Egypt, and they were safe.\n\nJoseph's story teaches us that God can remain at work even in seasons of injustice and pain. What Joseph’s brothers meant for harm, God used to preserve many lives. 🌈",
    "adult_text": "The Joseph narrative (Genesis 37-50) is one of the longest and most literarily sophisticated stories in the Bible — a fourteen-chapter arc that traces divine providence through betrayal, slavery, false accusation, imprisonment, and ultimately, unexpected exaltation. It is a study in the hidden hand of God working through, and sometimes against, human intention.\n\nThe Beloved Son (Genesis 37). Joseph is Jacob's favored son by his beloved wife Rachel. The 'coat of many colors' (or 'long robe with sleeves') visibly marks his privileged status. His prophetic dreams — of sheaves and stars bowing before him — further alienate his eleven brothers. Their jealousy culminates in a plot: they throw him into a pit, then sell him for twenty pieces of silver to Ishmaelite traders bound for Egypt.\n\nJoseph in Potiphar's House (Genesis 39). In Egypt, Joseph is purchased by Potiphar, an officer of Pharaoh. The narrator repeatedly emphasizes: 'The LORD was with Joseph.' Joseph rises to steward the household. Potiphar's wife attempts seduction; Joseph refuses, invoking his integrity before God: 'How then can I do this great wickedness and sin against God?' (39:9). Falsely accused, he is imprisoned. Yet again: 'The LORD was with him... and gave him favor.'\n\nJoseph in Prison (Genesis 40). In prison, Joseph interprets the dreams of Pharaoh's cupbearer and baker. His interpretations prove exactly accurate. The cupbearer, restored, promises to remember Joseph — and promptly forgets him for two full years.\n\nJoseph before Pharaoh (Genesis 41). When Pharaoh has troubling dreams — seven fat cows devoured by seven lean ones; seven full ears of grain consumed by seven withered — none of his magicians can interpret. The cupbearer belatedly remembers Joseph. Brought before Pharaoh, Joseph deflects the credit: 'It is not in me; God will give Pharaoh a favorable answer' (41:16). He interprets the dreams as forecasting seven years of abundance followed by seven of famine, and counsels a state-managed grain reserve. Pharaoh, impressed, elevates Joseph to second-in-command of Egypt at age thirty (41:41-46).\n\nThe Brothers Come to Egypt (Genesis 42-45). When famine strikes, Jacob sends his ten older sons to Egypt to buy grain. They stand before Joseph — but do not recognize him. Joseph, however, recognizes them. What follows is an extended, careful testing designed not for revenge but for repentance: he demands they bring Benjamin, imprisons Simeon, plants his cup in Benjamin's sack. His purpose is to discern whether they have changed — particularly, whether they will now protect their youngest brother rather than sell him. Judah's speech in Genesis 44:18-34 — offering himself in Benjamin's place — is the narrative climax. Judah has been transformed. Joseph can hold back no longer. Weeping, he reveals himself.\n\nThe Great Reconciliation (Genesis 45:4-15). Joseph's theological interpretation of his own suffering is stunning: 'And now do not be distressed or angry with yourselves because you sold me here, for God sent me before you to preserve life... God sent me before you to preserve for you a remnant on earth, and to keep alive for you many survivors. So it was not you who sent me here, but God' (45:5-8). This is not the erasure of human agency but its subordination to divine providence.\n\nJacob in Egypt (Genesis 46-47). The whole family — seventy persons — descends to Egypt, where they settle in Goshen. The family reunion is deeply moving. Jacob lives seventeen more years before his death; his final blessings on his sons (Genesis 49) prophesy the future of each tribe.\n\nJoseph's Final Word (Genesis 50). After Jacob's death, Joseph's brothers fear he will now retaliate. Joseph reassures them with words that have become one of Scripture's most quoted texts on providence: 'As for you, you meant evil against me, but God meant it for good, to bring it about that many people should be kept alive, as they are today' (50:20). Joseph dies at 110, having secured his descendants' remembrance of God's promise: 'God will surely visit you' — a foreshadowing of the Exodus.\n\nTheological Themes.\n- Providence: God's sovereign purposes work through, around, and against human sin without excusing that sin.\n- Suffering and Sanctification: Joseph's character is refined through injustice; he emerges wiser, more merciful, more godly.\n- Reconciliation: True forgiveness includes discernment — Joseph tests before reconciling. Reconciliation is offered generously but not naively.\n- Preservation of the Covenant: Through Joseph, the family of Jacob (Israel) is preserved. The Exodus narrative that follows depends on Joseph's earlier faithfulness.\n- Christ-typology: Joseph — beloved son, rejected by brothers, sold for pieces of silver, falsely accused, exalted to the right hand of the throne, becoming savior of the world — prefigures Christ in remarkable ways.\n\nThe Joseph story invites us to trust God with the parts of our lives we do not understand. What appears to be a catastrophic detour may still become a place where character, wisdom, and faithful service are formed. As Joseph declares — with hard-won conviction — what others meant for evil, God works for good."
  },
  {
    "id": "s15",
    "title": "Adam & Eve in Eden",
    "topic": "adam_eve",
    "premium": false,
    "image": "local:s15",
    "character_emoji": "🌿",
    "summary": "Creation, choice, and God’s promise of hope.",
    "kids_text": "In the beginning, God made a beautiful world filled with light, oceans, trees, animals, and every good thing. Then God made Adam from the dust of the ground and breathed life into him. God placed Adam in a garden called Eden, where he could care for the plants and enjoy friendship with God.\n\nGod said it was not good for Adam to be alone. God made Eve, and Adam welcomed her with joy. Together they cared for the garden. They could eat from the trees, but God gave them one clear boundary: they must not eat from the tree of the knowledge of good and evil.\n\nA serpent questioned God’s words and tempted Eve. Eve ate the fruit, and Adam ate too. Right away they felt ashamed and hid. When God called, “Where are you?” Adam and Eve admitted what had happened, though they also tried to blame others. Their choice brought pain and separation into the world, and they had to leave Eden.\n\nBut God did not stop caring for them. God clothed them, and Christians have long seen a first glimmer of hope in God’s promise that the serpent would one day be defeated. The story is honest about wrong choices and their consequences, but it also begins the Bible’s long story of rescue, forgiveness, and hope.\n\nWhen we make a wrong choice, hiding and blaming do not heal us. We can tell the truth, ask forgiveness, accept wise consequences, and trust that God still invites us toward what is good. 🌿",
    "adult_text": "Genesis 2–3 presents humanity’s vocation, freedom, failure, and hope in a tightly woven theological narrative. Adam is formed from the ground and animated by God’s breath, a picture of both creaturely humility and divine gift. He is placed in Eden to work and keep it—language that joins cultivation with faithful stewardship.\n\nThe creation of Eve answers the first ‘not good’ in Scripture: human isolation. The phrase often translated ‘helper suitable for him’ does not imply inferiority; the Hebrew word for helper is frequently used of God. The scene emphasizes shared humanity, mutual belonging, and covenant relationship.\n\nThe command concerning the tree establishes meaningful freedom. Love and trust cannot be reduced to programming; they involve the possibility of obedience or refusal. The serpent reframes God as withholding rather than generous. The humans grasp at wisdom on their own terms, then experience shame, fear, blame, and exile—the relational fractures that sin produces.\n\nGod’s question, ‘Where are you?’ is not a request for information but an invitation to come out of hiding. Judgment is real, yet mercy is present: God seeks the humans, clothes them, and preserves their future. Genesis 3:15 has long been read by Christians as the first glimmer of the gospel—the promise that the serpent’s work will finally be defeated.\n\nThe story resists shallow answers. It calls readers to receive life as gift, honor wise boundaries, accept responsibility, and reject the ancient temptation to define good and evil apart from God. At the same time, it announces that human failure does not cancel divine pursuit. The road out of Eden becomes the road toward redemption."
  }
] as const;

export const PUZZLES = [
  {
    "id": "p1",
    "title": "Bible Heroes",
    "words": [
      "MOSES",
      "DAVID",
      "NOAH",
      "PAUL",
      "RUTH",
      "JOB"
    ]
  },
  {
    "id": "p2",
    "title": "Fruit of Spirit",
    "words": [
      "LOVE",
      "JOY",
      "PEACE",
      "FAITH",
      "HOPE"
    ]
  },
  {
    "id": "p3",
    "title": "Places",
    "words": [
      "EDEN",
      "EGYPT",
      "JORDAN",
      "ZION"
    ]
  }
] as const;

