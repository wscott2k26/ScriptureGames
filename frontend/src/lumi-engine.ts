export type LumiMode = 'kids' | 'adult';

export type LumiVerseResult = {
  reference: string;
  text: string;
};

export type LumiBibleSource = {
  lookupReference: (input: string) => LumiVerseResult | null;
  findVerses: (query: string, limit?: number) => LumiVerseResult[];
};

type BookGuide = {
  name: string;
  aliases: string[];
  overview: string;
  themes: string;
  start: string;
};

type AnswerGuide = {
  aliases: string[];
  adult: string;
  kids: string;
};

const BOOK_GUIDES: BookGuide[] = [
  { name: 'Genesis', aliases: ['genesis', 'gen'], overview: 'the book of beginnings: creation, humanity’s fall, the flood, and the family stories of Abraham, Isaac, Jacob, and Joseph', themes: 'creation, covenant, faith, blessing, sin, and God’s faithful promises', start: 'Genesis 1, 12, 22, or 37' },
  { name: 'Exodus', aliases: ['exodus', 'exo'], overview: 'the story of God rescuing Israel from slavery through Moses and forming them as a covenant people', themes: 'deliverance, worship, God’s presence, the law, and freedom for faithful living', start: 'Exodus 3, 12, 14, or 20' },
  { name: 'Leviticus', aliases: ['leviticus', 'lev'], overview: 'instructions showing ancient Israel how to worship a holy God and live as a holy community', themes: 'holiness, sacrifice, atonement, purity, justice, and love of neighbor', start: 'Leviticus 16, 19, or 23' },
  { name: 'Numbers', aliases: ['numbers', 'num'], overview: 'Israel’s wilderness journey, including rebellion, discipline, provision, and God’s continued faithfulness', themes: 'trust, leadership, consequences, perseverance, and covenant faithfulness', start: 'Numbers 6, 13–14, 21, or 27' },
  { name: 'Deuteronomy', aliases: ['deuteronomy', 'deut'], overview: 'Moses’ final speeches renewing the covenant before Israel enters the promised land', themes: 'love for God, obedience, remembrance, justice, and choosing life', start: 'Deuteronomy 6, 8, 10, or 30' },
  { name: 'Joshua', aliases: ['joshua', 'josh'], overview: 'Israel’s entry into the promised land under Joshua and the call to courageous covenant faithfulness', themes: 'courage, obedience, inheritance, leadership, and God’s promises', start: 'Joshua 1, 3–4, 6, or 24' },
  { name: 'Judges', aliases: ['judges', 'judg'], overview: 'a repeated cycle of rebellion, oppression, rescue, and decline in Israel before the monarchy', themes: 'the cost of unfaithfulness, flawed leadership, mercy, and the need for righteous rule', start: 'Judges 2, 4–5, 6–8, or 13–16' },
  { name: 'Ruth', aliases: ['ruth'], overview: 'a short story of loyalty, kindness, redemption, and God’s quiet work through ordinary faithfulness', themes: 'loyal love, family, provision, redemption, and belonging', start: 'Ruth 1 or read all four chapters' },
  { name: '1 Samuel', aliases: ['1 samuel', 'first samuel', '1samuel'], overview: 'Israel’s transition from judges to kings through Samuel, Saul, and the rise of David', themes: 'leadership, obedience, prayer, pride, anointing, and the heart', start: '1 Samuel 3, 8, 16, or 17' },
  { name: '2 Samuel', aliases: ['2 samuel', 'second samuel', '2samuel'], overview: 'David’s reign, victories, covenant, failures, repentance, and family consequences', themes: 'kingship, covenant, mercy, sin, repentance, and accountability', start: '2 Samuel 5, 7, 11–12, or 22' },
  { name: '1 Kings', aliases: ['1 kings', 'first kings', '1kings'], overview: 'Solomon’s reign, the temple, the kingdom’s division, and Elijah’s prophetic ministry', themes: 'wisdom, worship, divided loyalty, idolatry, and prophetic courage', start: '1 Kings 3, 8, 12, or 18' },
  { name: '2 Kings', aliases: ['2 kings', 'second kings', '2kings'], overview: 'the decline and exile of Israel and Judah alongside the ministries of prophets such as Elisha', themes: 'covenant consequences, reform, prophetic truth, judgment, and mercy', start: '2 Kings 2, 5, 17, or 22–25' },
  { name: '1 Chronicles', aliases: ['1 chronicles', 'first chronicles', '1chronicles'], overview: 'a retelling of Israel’s story centered on David, worship, and preparation for the temple', themes: 'identity, worship, covenant, leadership, and remembrance', start: '1 Chronicles 16, 17, 22, or 29' },
  { name: '2 Chronicles', aliases: ['2 chronicles', 'second chronicles', '2chronicles'], overview: 'the history of Judah’s kings, the temple, reforms, exile, and hope of return', themes: 'worship, repentance, reform, prayer, judgment, and restoration', start: '2 Chronicles 7, 20, 29–30, or 36' },
  { name: 'Ezra', aliases: ['ezra'], overview: 'the return from exile and rebuilding of the temple and covenant community', themes: 'restoration, Scripture, worship, repentance, and community identity', start: 'Ezra 1, 3, 7, or 9–10' },
  { name: 'Nehemiah', aliases: ['nehemiah', 'neh'], overview: 'the rebuilding of Jerusalem’s walls and renewal of the people under courageous, prayerful leadership', themes: 'prayer, planning, leadership, opposition, justice, and renewal', start: 'Nehemiah 1–2, 4, 8, or 9' },
  { name: 'Esther', aliases: ['esther'], overview: 'a Jewish queen courageously risks her life to protect her people in Persia', themes: 'courage, providence, identity, wisdom, justice, and deliverance', start: 'Esther 2, 4, 7, or read the whole story' },
  { name: 'Job', aliases: ['book of job'], overview: 'a wisdom drama exploring undeserved suffering, human limits, honest lament, and trust in God', themes: 'suffering, integrity, lament, wisdom, humility, and God’s greatness', start: 'Job 1–2, 28, 38–42' },
  { name: 'Psalms', aliases: ['psalms', 'psalm'], overview: 'a collection of prayers and songs for praise, grief, repentance, wisdom, gratitude, and trust', themes: 'worship, emotion before God, kingship, creation, lament, and hope', start: 'Psalm 1, 23, 27, 51, 103, or 139' },
  { name: 'Proverbs', aliases: ['proverbs', 'proverb'], overview: 'wise sayings and poems teaching skillful, God-honoring living', themes: 'wisdom, speech, work, money, relationships, discipline, and reverence for God', start: 'Proverbs 1–4, 8, 15, or 31' },
  { name: 'Ecclesiastes', aliases: ['ecclesiastes', 'eccles'], overview: 'a searching reflection on life’s limits, fleeting achievements, and the wisdom of receiving life as God’s gift', themes: 'meaning, mortality, work, pleasure, time, humility, and reverence', start: 'Ecclesiastes 1, 3, 5, or 12' },
  { name: 'Song of Solomon', aliases: ['song of solomon', 'song of songs', 'songs'], overview: 'poetry celebrating covenant love, desire, delight, and mutual affection', themes: 'love, beauty, commitment, longing, and mutual honor', start: 'Song of Solomon 2, 4, or 8' },
  { name: 'Isaiah', aliases: ['isaiah', 'isa'], overview: 'prophetic messages of judgment, holiness, comfort, the coming servant, and future restoration', themes: 'God’s holiness, justice, trust, the Messiah, comfort, and new creation', start: 'Isaiah 6, 9, 40, 53, or 65' },
  { name: 'Jeremiah', aliases: ['jeremiah', 'jer'], overview: 'a prophet’s painful call to warn Judah while proclaiming hope and a new covenant', themes: 'truth, grief, judgment, perseverance, repentance, and restoration', start: 'Jeremiah 1, 7, 20, 29, or 31' },
  { name: 'Lamentations', aliases: ['lamentations', 'lamentation'], overview: 'poems grieving Jerusalem’s destruction while still reaching for God’s mercy', themes: 'lament, loss, justice, compassion, hope, and faithful endurance', start: 'Lamentations 1 or 3' },
  { name: 'Ezekiel', aliases: ['ezekiel', 'ezek'], overview: 'visions and prophetic signs announcing judgment, God’s glory, renewed hearts, and restoration', themes: 'God’s presence, responsibility, renewal, resurrection hope, and a restored people', start: 'Ezekiel 1, 18, 34, 36–37, or 47' },
  { name: 'Daniel', aliases: ['daniel', 'dan'], overview: 'faithful living in exile and visions showing God’s kingdom above every empire', themes: 'courage, prayer, integrity, God’s sovereignty, endurance, and hope', start: 'Daniel 1, 3, 6, 7, or 9' },
  { name: 'Hosea', aliases: ['hosea'], overview: 'a prophetic picture of Israel’s unfaithfulness and God’s persistent covenant love', themes: 'faithfulness, betrayal, repentance, mercy, and restoration', start: 'Hosea 1–3, 6, 11, or 14' },
  { name: 'Joel', aliases: ['joel'], overview: 'a call to repentance after disaster, with hope for restoration and God’s Spirit poured out', themes: 'repentance, the day of the Lord, mercy, restoration, and the Spirit', start: 'Joel 2' },
  { name: 'Amos', aliases: ['amos'], overview: 'a shepherd-prophet confronts injustice, empty worship, and exploitation', themes: 'justice, righteousness, accountability, true worship, and restoration', start: 'Amos 5, 7, or 9' },
  { name: 'Obadiah', aliases: ['obadiah'], overview: 'a short prophecy against Edom’s pride and violence toward Judah', themes: 'pride, justice, brotherhood, consequences, and God’s kingdom', start: 'read its single chapter' },
  { name: 'Jonah', aliases: ['jonah'], overview: 'a reluctant prophet learns about obedience and God’s compassion for enemies', themes: 'mercy, mission, repentance, prejudice, obedience, and compassion', start: 'read all four chapters' },
  { name: 'Micah', aliases: ['micah'], overview: 'judgment against corruption alongside hope for a ruler from Bethlehem and restored peace', themes: 'justice, mercy, humility, leadership, judgment, and hope', start: 'Micah 4–6' },
  { name: 'Nahum', aliases: ['nahum'], overview: 'a prophecy announcing the fall of violent Nineveh', themes: 'justice, oppression, God’s patience, judgment, and refuge', start: 'Nahum 1' },
  { name: 'Habakkuk', aliases: ['habakkuk'], overview: 'a prophet questions injustice and learns to live by faith while waiting for God', themes: 'honest questions, justice, faith, waiting, worship, and trust', start: 'Habakkuk 1–3' },
  { name: 'Zephaniah', aliases: ['zephaniah'], overview: 'warning about the day of the Lord that ends with hope, cleansing, and joyful restoration', themes: 'judgment, humility, repentance, refuge, and restoration', start: 'Zephaniah 2–3' },
  { name: 'Haggai', aliases: ['haggai'], overview: 'a call for returned exiles to reorder priorities and rebuild the temple', themes: 'priorities, obedience, courage, worship, and God’s presence', start: 'Haggai 1–2' },
  { name: 'Zechariah', aliases: ['zechariah', 'zech'], overview: 'visions encouraging temple rebuilding and pointing toward a humble king and future restoration', themes: 'hope, repentance, Messiah, cleansing, worship, and God’s reign', start: 'Zechariah 3, 4, 8, 9, or 12–14' },
  { name: 'Malachi', aliases: ['malachi'], overview: 'a final Old Testament call to sincere worship, covenant faithfulness, and readiness for God’s messenger', themes: 'worship, marriage, justice, generosity, repentance, and preparation', start: 'Malachi 1, 3, or 4' },
  { name: 'Matthew', aliases: ['matthew', 'matt'], overview: 'a Gospel presenting Jesus as Messiah, teacher, king, and fulfillment of Scripture', themes: 'the kingdom of heaven, discipleship, fulfillment, righteousness, and mission', start: 'Matthew 5–7, 13, 16, 26–28' },
  { name: 'Mark', aliases: ['mark', 'gospel of mark'], overview: 'a fast-moving Gospel emphasizing Jesus’ authority, suffering service, death, and resurrection', themes: 'discipleship, the cross, faith, service, authority, and the kingdom', start: 'Mark 1, 4–5, 8, 10, or 14–16' },
  { name: 'Luke', aliases: ['luke', 'gospel of luke'], overview: 'an orderly Gospel highlighting Jesus’ compassion, prayer, the Holy Spirit, and good news for outsiders', themes: 'salvation, mercy, reversal, prayer, joy, and inclusion', start: 'Luke 1–2, 4, 10, 15, or 22–24' },
  { name: 'John', aliases: ['gospel of john', 'john gospel'], overview: 'a reflective Gospel revealing Jesus through signs and “I am” sayings so readers may believe and have life', themes: 'belief, eternal life, love, truth, glory, and union with Christ', start: 'John 1, 3, 10, 13–17, or 20' },
  { name: 'Acts', aliases: ['acts', 'acts of the apostles'], overview: 'the risen Jesus sends the Holy Spirit and the gospel spreads from Jerusalem toward Rome', themes: 'the Spirit, mission, church, courage, community, and crossing boundaries', start: 'Acts 1–2, 9, 10, 15, or 17' },
  { name: 'Romans', aliases: ['romans', 'rom'], overview: 'Paul’s fullest explanation of the gospel and the transformed life flowing from God’s mercy', themes: 'sin, grace, justification by faith, life in the Spirit, unity, and renewed living', start: 'Romans 3, 5, 8, 12, or 14' },
  { name: '1 Corinthians', aliases: ['1 corinthians', 'first corinthians', '1corinthians'], overview: 'Paul corrects a divided church and teaches holiness, love, worship, spiritual gifts, and resurrection', themes: 'unity, maturity, sexuality, worship, love, gifts, and resurrection', start: '1 Corinthians 1, 6, 11–13, or 15' },
  { name: '2 Corinthians', aliases: ['2 corinthians', 'second corinthians', '2corinthians'], overview: 'Paul speaks honestly about suffering, reconciliation, generosity, and strength made perfect in weakness', themes: 'comfort, integrity, new creation, generosity, weakness, and God’s power', start: '2 Corinthians 1, 4–5, 8–9, or 12' },
  { name: 'Galatians', aliases: ['galatians', 'gal'], overview: 'Paul defends the gospel of grace and freedom from relying on law-keeping for acceptance with God', themes: 'grace, faith, freedom, the Spirit, identity in Christ, and love', start: 'Galatians 2–3 or 5–6' },
  { name: 'Ephesians', aliases: ['ephesians', 'eph'], overview: 'a vision of salvation, unity in Christ, a new way of life, and spiritual strength', themes: 'grace, identity, church unity, holiness, relationships, and spiritual armor', start: 'Ephesians 1–2, 4–6' },
  { name: 'Philippians', aliases: ['philippians', 'phil'], overview: 'a prison letter filled with joy, humility, partnership, contentment, and Christ-centered perseverance', themes: 'joy, humility, unity, purpose, peace, and contentment', start: 'Philippians 1–4' },
  { name: 'Colossians', aliases: ['colossians', 'col'], overview: 'Paul presents the supremacy of Christ and the new life shaped by belonging to him', themes: 'Christ’s supremacy, reconciliation, spiritual maturity, holiness, and relationships', start: 'Colossians 1 or 3' },
  { name: '1 Thessalonians', aliases: ['1 thessalonians', 'first thessalonians', '1thessalonians'], overview: 'encouragement for a young church to remain holy, loving, hopeful, and ready for Christ’s return', themes: 'faith, love, hope, holiness, grief, and Christ’s return', start: '1 Thessalonians 1, 4, or 5' },
  { name: '2 Thessalonians', aliases: ['2 thessalonians', 'second thessalonians', '2thessalonians'], overview: 'clarification about Christ’s return alongside calls to endurance and responsible work', themes: 'perseverance, truth, judgment, hope, and faithful work', start: '2 Thessalonians 1–3' },
  { name: '1 Timothy', aliases: ['1 timothy', 'first timothy', '1timothy'], overview: 'Paul guides Timothy in church leadership, sound teaching, worship, and godly character', themes: 'leadership, doctrine, prayer, care, integrity, and contentment', start: '1 Timothy 1, 3, 4, or 6' },
  { name: '2 Timothy', aliases: ['2 timothy', 'second timothy', '2timothy'], overview: 'Paul’s final charge to remain faithful, endure hardship, handle Scripture well, and finish the race', themes: 'courage, endurance, Scripture, mentorship, faithfulness, and legacy', start: '2 Timothy 1–4' },
  { name: 'Titus', aliases: ['titus'], overview: 'guidance for healthy church leadership and a life where sound belief produces good works', themes: 'character, teaching, grace, leadership, and good works', start: 'Titus 1–3' },
  { name: 'Philemon', aliases: ['philemon'], overview: 'a personal appeal for reconciliation and receiving an enslaved brother as family in Christ', themes: 'forgiveness, reconciliation, dignity, family, and transformed relationships', start: 'read its single chapter' },
  { name: 'Hebrews', aliases: ['hebrews', 'heb'], overview: 'a sermon showing Jesus as the greater revelation, priest, sacrifice, and mediator of the new covenant', themes: 'Christ’s supremacy, faith, perseverance, worship, covenant, and access to God', start: 'Hebrews 1, 4, 8–10, 11, or 12' },
  { name: 'James', aliases: ['james', 'epistle of james'], overview: 'practical wisdom showing that genuine faith becomes visible through endurance, speech, justice, and action', themes: 'trials, wisdom, works, speech, favoritism, humility, and prayer', start: 'James 1–5' },
  { name: '1 Peter', aliases: ['1 peter', 'first peter', '1peter'], overview: 'hope and holy living for believers facing suffering and social pressure', themes: 'living hope, identity, holiness, suffering, witness, and humility', start: '1 Peter 1–3 or 5' },
  { name: '2 Peter', aliases: ['2 peter', 'second peter', '2peter'], overview: 'a call to spiritual growth, truth, discernment, and hope while resisting false teaching', themes: 'growth, knowledge, truth, judgment, patience, and new creation', start: '2 Peter 1 or 3' },
  { name: '1 John', aliases: ['1 john', 'first john', '1john'], overview: 'assurance that true life with God is marked by faith in Jesus, obedience, truth, and love', themes: 'assurance, love, truth, obedience, fellowship, and discernment', start: '1 John 1, 3, 4, or 5' },
  { name: '2 John', aliases: ['2 john', 'second john', '2john'], overview: 'a brief call to walk in truth and love while rejecting teaching that denies Christ', themes: 'truth, love, obedience, hospitality, and discernment', start: 'read its single chapter' },
  { name: '3 John', aliases: ['3 john', 'third john', '3john'], overview: 'a short letter about faithful hospitality, healthy leadership, and resisting selfish control', themes: 'hospitality, truth, leadership, imitation, and community', start: 'read its single chapter' },
  { name: 'Jude', aliases: ['jude'], overview: 'an urgent appeal to contend for the faith while showing mercy and remaining in God’s love', themes: 'truth, perseverance, judgment, mercy, and faithful witness', start: 'read its single chapter' },
  { name: 'Revelation', aliases: ['revelation', 'revelations', 'apocalypse'], overview: 'symbolic visions encouraging faithful witness because the slain and risen Lamb ultimately defeats evil and renews creation', themes: 'worship, endurance, judgment, victory, hope, and new creation', start: 'Revelation 1, 4–5, 12, 19, or 21–22' },
];

const PEOPLE: AnswerGuide[] = [
  { aliases: ['adam', 'eve'], adult: 'Adam and Eve are presented in Genesis 1–3 as the first humans, made in God’s image and entrusted with creation. Their disobedience introduces shame, alienation, and death, while God’s pursuit of them begins the Bible’s long story of judgment and rescue.', kids: 'Adam and Eve are the first people in Genesis. God made them in His image and gave them a good home, but they disobeyed. Their story shows why sin hurts people and why everyone needs God’s rescue.' },
  { aliases: ['noah'], adult: 'Noah appears in Genesis 6–9. He obeys God by building the ark, life is preserved through the flood, and the rainbow marks God’s covenant commitment to creation. The story holds judgment, mercy, obedience, and human brokenness together.', kids: 'Noah trusted God and built the ark. God kept Noah’s family and the animals safe through the flood, and the rainbow became a sign of God’s promise. You can read the story in Genesis 6–9.' },
  { aliases: ['abraham', 'abram'], adult: 'Abraham is the covenant patriarch called in Genesis 12. God promises him land, descendants, and blessing for the nations. His life includes remarkable faith, serious failures, patient waiting, and the lesson that God remains faithful to His promise.', kids: 'Abraham followed God to a new land and learned to trust God’s promises. God promised that his family would become a blessing to many people. Start in Genesis 12.' },
  { aliases: ['sarah'], adult: 'Sarah is Abraham’s wife and a central participant in the covenant story. After years of barrenness and waiting, she gives birth to Isaac. Her story shows both human doubt and God’s ability to keep a promise beyond ordinary expectation.', kids: 'Sarah waited a very long time for the child God promised. Isaac’s birth showed that God had not forgotten her. Her story is in Genesis 12–21.' },
  { aliases: ['joseph'], adult: 'Joseph, son of Jacob, is sold by his brothers, suffers injustice in Egypt, rises to leadership, and later preserves his family during famine. Genesis 37–50 explores providence, integrity, forgiveness, and God bringing good through human evil without calling the evil good.', kids: 'Joseph’s brothers sold him, but God stayed with him in Egypt. Joseph later helped save many people from famine and forgave his family. Read Genesis 37–50.' },
  { aliases: ['moses'], adult: 'Moses is the central human leader of Exodus through Deuteronomy. God calls him at the burning bush, uses him to lead Israel out of Egypt, gives the covenant law at Sinai, and forms a people for worship and justice. Moses is faithful yet imperfect, pointing beyond himself to the need for a greater deliverer.', kids: 'Moses was the leader God used to bring Israel out of slavery in Egypt. He met God at the burning bush, crossed the Red Sea with the people, and received God’s law at Mount Sinai. Start with Exodus 3.' },
  { aliases: ['joshua'], adult: 'Joshua succeeds Moses and leads Israel into the promised land. His story emphasizes courage rooted in God’s presence, careful obedience, remembrance, and the responsibility of covenant leadership.', kids: 'Joshua led Israel after Moses. God told him to be strong and courageous because God would be with him. Read Joshua 1.' },
  { aliases: ['ruth'], adult: 'Ruth is a Moabite widow whose loyal love toward Naomi leads her into the covenant community. Her marriage to Boaz becomes a story of provision and redemption, and she becomes an ancestor of David and Jesus.', kids: 'Ruth stayed with Naomi when life was hard. She worked faithfully, Boaz showed kindness, and God gave their family a new beginning. Ruth’s whole story is only four chapters.' },
  { aliases: ['david', 'king david'], adult: 'David is shepherd, psalmist, warrior, and Israel’s most significant king. God makes a covenant with him, yet David also commits grave sin and experiences painful consequences. His life displays courage, worship, repentance, leadership, and the limits of even the best human king.', kids: 'David was a shepherd who trusted God, defeated Goliath, wrote many psalms, and became king. He also made serious mistakes and had to repent. Start with 1 Samuel 16–17.' },
  { aliases: ['solomon', 'king solomon'], adult: 'Solomon, David’s son, is known for wisdom, the Jerusalem temple, wealth, and international influence. His divided heart and idolatry later damage the kingdom, showing that giftedness without sustained faithfulness is not enough.', kids: 'Solomon asked God for wisdom and built the temple. Later he made poor choices by following other gods. His story teaches that wisdom must be practiced, not just known.' },
  { aliases: ['esther'], adult: 'Esther is a Jewish woman who becomes queen in Persia and risks her life to expose a plot against her people. Her story highlights courage, wise timing, communal fasting, providence, and using influence to protect others.', kids: 'Esther became queen and bravely spoke up to save her people. She was scared, but she chose courage and wise action. Her story is in the book of Esther, especially chapter 4.' },
  { aliases: ['daniel'], adult: 'Daniel lives faithfully in exile under foreign empires. He practices disciplined prayer, interprets dreams, survives political hostility, and receives visions of God’s everlasting kingdom. His life joins courage with humility and public excellence.', kids: 'Daniel kept praying and obeying God even far from home. God protected him in the lions’ den. Read Daniel 1 and 6.' },
  { aliases: ['jonah'], adult: 'Jonah is a reluctant prophet sent to Nineveh. His story confronts disobedience, prejudice, and resentment while revealing God’s compassion for repentant enemies. The final question challenges readers to share God’s mercy.', kids: 'Jonah ran away from God’s assignment, was swallowed by a great fish, and finally went to Nineveh. The story teaches obedience and God’s mercy for people we may not like.' },
  { aliases: ['mary', 'mary mother of jesus'], adult: 'Mary, the mother of Jesus, receives Gabriel’s announcement with courageous trust. Her song in Luke 1 celebrates God’s mercy and justice. She follows Jesus’ story from miraculous conception through the pain of the cross and the life of the early church.', kids: 'Mary trusted God when the angel told her she would be Jesus’ mother. She praised God and stayed faithful through joyful and very hard moments. Read Luke 1–2.' },
  { aliases: ['peter', 'simon peter'], adult: 'Peter is a leading disciple who confesses Jesus as Messiah, fails dramatically by denying him, and is restored by the risen Christ. In Acts he becomes a courageous witness. His story shows grace that restores people for faithful service.', kids: 'Peter followed Jesus, sometimes acted boldly, and sometimes made mistakes. He denied knowing Jesus, but Jesus forgave and restored him. Read Luke 22 and John 21.' },
  { aliases: ['paul', 'apostle paul', 'saul'], adult: 'Paul, formerly Saul, encounters the risen Jesus and becomes a missionary to the nations. Acts and his letters show a life shaped by grace, suffering, church planting, theological teaching, and persistent witness.', kids: 'Paul first tried to stop Christians, but Jesus changed his life. Paul then traveled, taught about Jesus, started churches, and wrote many New Testament letters. Read Acts 9.' },
  { aliases: ['jesus', 'christ', 'messiah'], adult: 'The New Testament presents Jesus as Messiah, Son of God, crucified and risen Lord. His teaching, compassion, signs, death, and resurrection reveal God’s kingdom and call people to faith, repentance, love, and discipleship. A strong starting point is the Gospel of Mark or John.', kids: 'Jesus is God’s Son and the promised Savior. He welcomed people, taught God’s truth, healed, gave His life, and rose again. Start with the Gospel of Mark to learn His story.' },
];

const TOPICS: AnswerGuide[] = [
  { aliases: ['prayer', 'how do i pray'], adult: 'Prayer is honest communion with God: praise, confession, gratitude, requests, and attentive silence. Jesus’ model in Matthew 6:9–13 gives prayer both intimacy and direction. Begin plainly: name what is true, ask for daily help, forgive, and listen.', kids: 'Prayer is talking honestly with God—thanking Him, asking for help, saying sorry, and listening quietly. You do not need fancy words. Start with, “God, here is what is on my heart.”' },
  { aliases: ['grace'], adult: 'Grace is God’s unearned favor and transforming presence, not permission to remain unchanged. Ephesians 2:8–10 holds both truths together: salvation is a gift, and the saved life is shaped toward good works.', kids: 'Grace is God giving us love and help we could never earn. We still tell the truth and make things right, but we do it knowing God welcomes us and helps us grow.' },
  { aliases: ['faith', 'trust god', 'trusting god'], adult: 'Biblical faith is trusting God’s character and promises enough to act, even when sight is incomplete. Hebrews 11 shows faith expressed through obedience, endurance, and hope; it is not pretending questions or pain do not exist.', kids: 'Faith means trusting God enough to take the next right step, even when you cannot see the whole path. Hebrews 11 tells stories of people who trusted God.' },
  { aliases: ['salvation', 'saved', 'gospel'], adult: 'The gospel announces what God has done through Jesus’ life, death, and resurrection. Salvation is received by grace through faith, bringing forgiveness, reconciliation, new life in the Spirit, and a calling to follow Christ. See Romans 3:23–26, Ephesians 2:8–10, and 1 Corinthians 15:1–4.', kids: 'The gospel is the good news that Jesus came to rescue people from sin and bring them back to God. We receive God’s gift by trusting Jesus, and He helps us learn a new way to live.' },
  { aliases: ['forgive', 'forgiveness', 'forgiving'], adult: 'Christian forgiveness releases personal vengeance and entrusts justice to God; it does not call abuse harmless or erase wise boundaries. Colossians 3:13 calls believers to forgive as they have been forgiven, while truth, safety, repentance, and accountability still matter.', kids: 'Forgiveness means choosing not to get revenge and asking God to help your heart heal. It does not mean pretending something harmful was okay. Tell a trusted grown-up when someone hurts you.' },
  { aliases: ['anxiety', 'anxious', 'worried', 'worry', 'afraid', 'fear', 'scared'], adult: 'Scripture does not shame anxious people. Philippians 4:6–9 joins prayer with practiced attention, while 1 Peter 5:7 invites you to cast cares on God. Take one grounded step: breathe slowly, name the specific fear, pray it plainly, and contact a trusted person or qualified professional when anxiety is persistent or overwhelming.', kids: 'God cares when you feel worried or scared. Tell Him what is bothering you, take slow breaths, and talk to a trusted grown-up. Philippians 4:6–7 reminds us to bring our worries to God and receive His peace.' },
  { aliases: ['sad', 'sadness', 'depressed', 'depression', 'brokenhearted', 'broken heart'], adult: 'The Bible makes room for deep sorrow rather than demanding a cheerful mask. Psalms 42–43 and 88 model honest lament, and Psalm 34:18 speaks of God’s nearness to the brokenhearted. Spiritual practices can support you, but persistent depression deserves compassionate professional care and trusted human support.', kids: 'You do not have to hide sadness from God. The Psalms show people crying, asking questions, and still reaching for hope. Please tell a trusted grown-up when sadness feels heavy or will not go away.' },
  { aliases: ['anger', 'angry', 'mad'], adult: 'Anger can signal that something matters, but it can also become destructive. Ephesians 4:26–32 calls for truth without sinful retaliation, and James 1:19–20 urges quick listening and slow anger. Pause, name the wound or injustice, choose a truthful response, and seek reconciliation or safe boundaries.', kids: 'Feeling angry is not the same as choosing to hurt someone. Stop, breathe, name what happened, and ask a trusted grown-up for help. James 1:19 says to be quick to listen and slow to become angry.' },
  { aliases: ['grief', 'grieving', 'death', 'lost someone', 'mourning'], adult: 'Grief is not faithlessness. Jesus weeps in John 11, the Psalms lament, and 1 Thessalonians 4:13–18 describes grief held together with resurrection hope. Give sorrow time, receive support, remember honestly, and do not force yourself into someone else’s timetable.', kids: 'It is okay to cry and miss someone. Jesus cried when Lazarus died. Talk with people who love you, remember the person, and tell God exactly how you feel.' },
  { aliases: ['purpose', 'calling', 'what should i do with my life'], adult: 'Biblical purpose begins with loving God and neighbor, becoming like Christ, and faithfully using what has been entrusted to you. Romans 12 and Ephesians 2:10 connect gifts and good works with a renewed life. Calling is often discovered through service, character, community, and the next faithful responsibility—not one dramatic sign.', kids: 'Your purpose is bigger than one future job. God calls you to love Him, love people, grow in character, and use your gifts to help. Start with the next kind and faithful thing you can do.' },
  { aliases: ['temptation', 'tempted'], adult: 'Temptation is not itself the same as sin. 1 Corinthians 10:13 points to a way of escape, and James 1:13–15 traces how desire grows when entertained. Name the trigger, reduce access, replace the pattern, pray honestly, and involve a trustworthy person before the moment of pressure.', kids: 'Everyone faces temptation. Ask God for help, move away from the situation, choose a better action, and tell a trusted grown-up who can help you make a plan.' },
  { aliases: ['money', 'finances', 'rich', 'wealth', 'debt'], adult: 'Scripture treats money as a stewardship issue rather than proof of God’s favor. Proverbs commends planning and honest work; Jesus warns against greed; 1 Timothy 6:6–10 calls for contentment and generosity. A faithful plan includes truth about income and debt, wise limits, care for obligations, and open-handedness.', kids: 'Money is a tool, not the boss of your heart. Learn to save, give, spend wisely, and tell the truth. Jesus teaches that what we treasure can shape our hearts.' },
  { aliases: ['work', 'job', 'career'], adult: 'Work can be service to God and neighbor, though no job can carry the full weight of identity. Colossians 3:23–24 calls for wholehearted integrity, while Scripture also protects rest, justice, and care for workers. Seek excellence without worshiping productivity.', kids: 'Work means using effort and gifts to help. Do your best, tell the truth, treat people fairly, and remember that rest matters too.' },
  { aliases: ['love', 'what is love'], adult: 'Biblical love is more than emotion: it seeks another’s good with truth, patience, courage, and faithfulness. 1 Corinthians 13 describes its character, while 1 John 4 roots our love in God’s prior love. Love does not require enabling harm or abandoning wise boundaries.', kids: 'Love is choosing what is good for someone with kindness and truth. 1 Corinthians 13 says love is patient and kind. Real love does not help people do harmful things.' },
  { aliases: ['wisdom', 'wise decision', 'decision'], adult: 'Biblical wisdom combines reverence for God, moral skill, teachability, and attention to consequences. Begin with prayer, relevant Scripture, honest facts, wise counsel, and the likely fruit of each option. Proverbs 3:5–6 and James 1:5 are useful starting points.', kids: 'Wisdom is knowing and choosing what is good. Pray, learn what the Bible says, ask trustworthy people, and think about what each choice may lead to.' },
  { aliases: ['holy spirit', 'spirit of god'], adult: 'The Holy Spirit is God’s personal presence who gives life, convicts, teaches, empowers witness, forms Christlike fruit, and equips the church. Key passages include John 14–16, Acts 2, Romans 8, and Galatians 5:16–26.', kids: 'The Holy Spirit is God with and within His people, helping them know truth, become more like Jesus, and serve with courage. Read Acts 2 and Galatians 5:22–23.' },
  { aliases: ['church'], adult: 'The church is the people gathered around Jesus—not merely a building. Acts 2:42–47 describes teaching, fellowship, prayer, generosity, and shared life. Healthy churches center Scripture and Christ, practice accountable leadership, protect the vulnerable, and make room for service and growth.', kids: 'Church is God’s people learning about Jesus, praying, helping, worshiping, and growing together. It is more than a building.' },
  { aliases: ['baptism', 'baptized'], adult: 'Baptism is the public covenant sign of identification with Jesus’ death and resurrection and entry into the visible community of disciples. Christian traditions differ on timing and mode, so study Matthew 28:18–20, Acts 2:38–41, and Romans 6:1–4 with a trustworthy local church.', kids: 'Baptism is a public way Christians show that they belong to Jesus and share in His new life. Churches may explain some details differently, so talk with a trusted pastor and family member.' },
  { aliases: ['heaven', 'new earth', 'after death'], adult: 'Christian hope is not only escape from earth but resurrection and renewed creation under God’s presence. Revelation 21–22 pictures God dwelling with His people, wiping away tears, defeating death, and making all things new. Scripture gives genuine hope without answering every curiosity.', kids: 'The Bible promises that God will make all things new and live with His people. Revelation 21 says death and tears will not last forever.' },
];

const COMMON_VERSES: Record<string, LumiVerseResult> = {
  'john 3:16': { reference: 'John 3:16', text: 'For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life.' },
  'psalm 23:1': { reference: 'Psalm 23:1', text: 'Yahweh is my shepherd; I shall lack nothing.' },
  'philippians 4:13': { reference: 'Philippians 4:13', text: 'I can do all things through Christ who strengthens me.' },
  'proverbs 3:5': { reference: 'Proverbs 3:5', text: 'Trust in Yahweh with all your heart, and don’t lean on your own understanding.' },
};

const normalize = (value: string) => value.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const containsPhrase = (text: string, phrase: string) => (` ${text} `).includes(` ${normalize(phrase)} `);

function findGuide<T extends { aliases: string[] }>(message: string, guides: T[]): T | undefined {
  const normalized = normalize(message);
  return guides
    .flatMap((guide) => guide.aliases.map((alias) => ({ guide, alias: normalize(alias) })))
    .sort((a, b) => b.alias.length - a.alias.length)
    .find(({ alias }) => containsPhrase(normalized, alias))?.guide;
}

function findBook(message: string): BookGuide | undefined {
  const normalized = normalize(message);
  const exact = BOOK_GUIDES.find((book) => book.aliases.some((alias) => normalize(alias) === normalized));
  if (exact) return exact;

  return BOOK_GUIDES
    .flatMap((book) => book.aliases.map((alias) => ({ book, alias: normalize(alias) })))
    .sort((a, b) => b.alias.length - a.alias.length)
    .find(({ book, alias }) => {
      if (book.name === 'Job' && !/(book of job|who was job|tell me about job|job in the bible)/i.test(message)) return false;
      if (book.name === 'John' && !/(gospel of john|john gospel|book of john|what is john about)/i.test(message)) return false;
      return containsPhrase(normalized, alias);
    })?.book;
}

function extractReferenceCandidate(message: string): string {
  return message
    .replace(/^(?:please\s+)?(?:read|quote|explain|what does|what is|tell me about|show me)\s+/i, '')
    .replace(/[?!.]+$/g, '')
    .trim();
}

function referenceExplanation(result: LumiVerseResult, mode: LumiMode): string {
  const lower = normalize(result.reference);
  if (lower === 'psalm 23 1') {
    return mode === 'kids'
      ? `${result.reference} says, “${result.text}” A shepherd guides, protects, and cares for sheep. David is saying God can guide and care for us too.`
      : `${result.reference} says, “${result.text}” The shepherd image expresses guidance, protection, provision, and belonging. It does not promise a life without valleys; the rest of Psalm 23 locates God’s presence within them.`;
  }
  if (lower === 'john 3 16') {
    return mode === 'kids'
      ? `${result.reference} says, “${result.text}” God’s love moved Him to give His Son so people who trust Jesus can receive eternal life.`
      : `${result.reference} says, “${result.text}” The verse presents divine love as costly action: God gives the Son, faith receives rather than earns, and the result is life. John 3:17–21 adds the surrounding themes of rescue, judgment, light, and darkness.`;
  }
  return mode === 'kids'
    ? `${result.reference} says, “${result.text}” Read the verses around it too, then ask: What does this show about God, people, and the next right step?`
    : `${result.reference} says, “${result.text}” Read the surrounding paragraph before building a conclusion; context helps show who is speaking, what problem is being addressed, and how the verse fits the book’s larger message.`;
}

function verseSearchReply(query: string, source: LumiBibleSource, mode: LumiMode): string | null {
  const cleaned = query
    .replace(/^(?:show me|find|give me|what are)?\s*(?:some\s*)?(?:bible\s*)?(?:verses?|scriptures?|passages?)\s+(?:about|on|for)\s+/i, '')
    .replace(/[?!.]+$/g, '')
    .trim();
  if (!cleaned || cleaned === query.trim()) return null;
  const verses = source.findVerses(cleaned, 3);
  if (!verses.length) {
    return mode === 'kids'
      ? `I could not find an exact phrase match for “${cleaned}” in the offline Bible. Try one simpler word, such as love, fear, wisdom, peace, or forgiveness.`
      : `I could not find an exact phrase match for “${cleaned}” in the offline Bible. Try a shorter biblical keyword or ask about the idea directly so I can connect it to relevant passages.`;
  }
  const list = verses.map((verse) => `${verse.reference}: “${verse.text}”`).join('\n\n');
  return `Here ${verses.length === 1 ? 'is a passage' : 'are passages'} from the offline World English Bible:\n\n${list}`;
}

export function createLumiReply(message: string, mode: LumiMode, source?: LumiBibleSource): string {
  const trimmed = message.trim();
  const normalized = normalize(trimmed);
  const kid = mode === 'kids';

  if (!trimmed) return kid ? 'Type or say something, and I’ll help you explore the Bible.' : 'Type or say a Bible question, passage, person, book, or life topic you want to explore.';

  if (/\b(suicid(?:e|al)?|kill myself|hurt myself|self[- ]harm|want to die|abuse|abused|someone is hurting me|unsafe at home|scared at home|immediate danger)\b/i.test(trimmed)) {
    return kid
      ? 'I’m really glad you said something. Please tell a trusted grown-up who is with you right now—like a parent, teacher, counselor, pastor, or emergency helper. You deserve real, nearby help, and this chat cannot keep you safe by itself.'
      : 'I’m glad you spoke up. Please contact a trusted person or local emergency or crisis support now, especially if you may be in immediate danger. This Bible companion cannot provide emergency care or replace a licensed professional.';
  }

  if (/^(hi|hello|hey|good morning|good afternoon|good evening|howdy|yo)(\s+lumi)?[!. ]*$/i.test(trimmed)) {
    return kid
      ? 'Hello! I’m glad you’re here. Ask me about a Bible book, person, story, verse, prayer, or something you’re dealing with today.'
      : 'Hello—I’m glad you’re here. Ask me about any Bible book, a verse reference, a person, a doctrine, or a life situation, and I’ll give you a Scripture-grounded answer.';
  }

  if (/^(thanks|thank you|thx|appreciate it)[!. ]*$/i.test(trimmed)) {
    return kid ? 'You’re welcome! What would you like to explore next?' : 'You’re welcome. What passage or topic should we explore next?';
  }

  if (/^(bye|goodbye|see you|later)[!. ]*$/i.test(trimmed)) {
    return kid ? 'See you later! Keep one good truth from Scripture with you today.' : 'Take care. Carry the clearest truth you found into one faithful action today.';
  }

  const referenceCandidate = extractReferenceCandidate(trimmed);
  const reference = source?.lookupReference(referenceCandidate) || COMMON_VERSES[normalize(referenceCandidate).replace(/ (\d+) (\d+)$/, ' $1:$2')] || COMMON_VERSES[referenceCandidate.toLowerCase()];
  if (reference) return referenceExplanation(reference, mode);

  if (source) {
    const verseSearch = verseSearchReply(trimmed, source, mode);
    if (verseSearch) return verseSearch;
  }

  const book = findBook(trimmed);
  if (book) {
    return kid
      ? `${book.name} is ${book.overview}. Big ideas include ${book.themes}. A good place to begin is ${book.start}.`
      : `${book.name} is ${book.overview}. Its major themes include ${book.themes}. A strong reading path begins with ${book.start}; read each section in context rather than as isolated lines.`;
  }

  const person = findGuide(trimmed, PEOPLE);
  if (person) return kid ? person.kids : person.adult;

  const topic = findGuide(trimmed, TOPICS);
  if (topic) return kid ? topic.kids : topic.adult;

  if (/read (?:the )?bible|bible daily|where should i start|what should i read/i.test(trimmed)) {
    return kid
      ? 'Start with the Gospel of Mark to learn what Jesus did, then read Genesis for the beginning of the Bible’s story. Read a short section, ask what it shows about God, and choose one truth to remember.'
      : 'For a clear starting path, read Mark, then Acts, Genesis, Psalms, and Romans. Use a sustainable rhythm: observe the passage, ask what it meant in context, connect it to the Bible’s larger story, and choose one concrete response.';
  }

  if (/who are you|what can you do|are you ai|are you real/i.test(trimmed)) {
    return kid
      ? 'I’m Lumi, Scripture Games’ Bible companion. I can explain Bible books, people, well-known verses, prayer, and life topics. I use an offline Scripture guide, so I will tell you when I do not know instead of making something up.'
      : 'I’m Lumi, Scripture Games’ local-first Bible companion. I can explain all 66 books, major people and doctrines, verse references, and common life topics. I am not an unrestricted generative AI, pastor, therapist, or emergency service, and I will say when my offline guide cannot answer reliably.';
  }

  const shortQuestion = trimmed.length > 90 ? `${trimmed.slice(0, 87)}…` : trimmed;
  return kid
    ? `I don’t have a reliable offline Bible answer for “${shortQuestion}” yet, and I do not want to make one up. Try asking about a Bible book, person, story, verse, prayer, or a topic like fear, forgiveness, purpose, grief, or wisdom.`
    : `I don’t have a reliable offline Scripture answer for “${shortQuestion}” yet, and I do not want to invent one. Try naming a Bible book, person, verse reference, doctrine, or life topic such as anxiety, forgiveness, grief, purpose, relationships, money, or wisdom.`;
}
