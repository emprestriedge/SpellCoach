import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, BookOpen, Volume2, Search, List, Plus,
  Settings, ChevronRight, ChevronLeft, X, Check, ArrowRight,
  Info, Snail, MessageSquare, AlertCircle, RefreshCw, Archive, Trash2,
  Trophy, Star, Zap, Flame, RotateCcw, ChevronDown, Edit3, Sparkles, LogOut,
  Shield, Eye, EyeOff, Calendar, Clock, Target, TrendingUp
} from 'lucide-react';
import Login from './Login';
import {
  onAuthChange, firebaseSignOut, subscribeLists, pushLists, type WordList,
  logActivity, fetchActivity, saveParentPin, getParentPin, type ActivityEntry,
  pushMissedWords, subscribeMissedWords
} from './firebase';
import type { User } from 'firebase/auth';

// --- THEME & COLORS ---
const COLORS = {
  rose: '#885159',
  purple: '#645188',
  brown: '#886451',
  teal: '#528881',
  black: '#000000',
};

// --- DICTIONARY ---
const DICTIONARY: Record<string, any> = {
  'accommodate': { word: 'accommodate', pron: '/əˈkäməˌdāt/', def: 'Provide lodging or sufficient space for.', ex: 'The hotel can accommodate up to 500 guests.', syn: 'house, hold', slang: 'make room for', tip: 'Two Cs, two Ms. Think: "Two cots, two mattresses to accommodate guests."', wrongOpts: ['acommodate', 'accomodate', 'acomodate'] },
  'embarrass': { word: 'embarrass', pron: '/əmˈberəs/', def: 'Cause to feel awkward, self-conscious, or ashamed.', ex: "I didn't want to embarrass him in front of his friends.", syn: 'humiliate', slang: 'cringe out', tip: 'Two Rs, two Ss. "Really red, so shy."', wrongOpts: ['embarass', 'embaras', 'embarrasss'] },
  'fluorescent': { word: 'fluorescent', pron: '/fləˈresənt/', def: 'Strikingly bright, glowing.', ex: 'The fluorescent lights buzzed overhead.', syn: 'glowing', slang: 'neon', tip: 'Fluorine + escent. U comes before O.', wrongOpts: ['flourescent', 'flouresent', 'florescent'] },
  'rhythm': { word: 'rhythm', pron: '/ˈriT͟Həm/', def: 'A strong, regular, repeated pattern of movement or sound.', ex: 'She danced to the rhythm of the music.', syn: 'beat, tempo', slang: 'vibe, flow', tip: 'Rhythm Helps Your Two Hips Move (R-H-Y-T-H-M).', wrongOpts: ['rythm', 'rhythum', 'rhytm'] },
  'necessary': { word: 'necessary', pron: '/ˈnesəˌserē/', def: 'Required to be done, achieved, or present.', ex: 'It is necessary to wear a helmet.', syn: 'essential', slang: 'must-have', tip: 'One Collar, two Sleeves (One C, two Ss).', wrongOpts: ['neccessary', 'necesary', 'necessery'] },
  'occurrence': { word: 'occurrence', pron: '/əˈkərəns/', def: 'An incident or event.', ex: 'Flooding is a common occurrence in this area.', syn: 'event, incident', slang: '', tip: 'Two Cs, two Rs. "It oCCuRRed to me."', wrongOpts: ['occurence', 'ocurrence', 'occurrance'] },
  'definitely': { word: 'definitely', pron: '/ˈdefənətlē/', def: 'Without doubt; certainly.', ex: 'I will definitely be there.', syn: 'certainly, surely', slang: 'for sure', tip: 'De-FINITE-ly. There is nothing "a" about it.', wrongOpts: ['definately', 'definatly', 'defiantly'] },
  'separate': { word: 'separate', pron: '/ˈsepərət/', def: 'Cause to move or be apart.', ex: 'Separate the eggs before mixing.', syn: 'divide, split', slang: '', tip: 'There is A RAT in sepARAte.', wrongOpts: ['seperate', 'seperete', 'separete'] },
  'privilege': { word: 'privilege', pron: '/ˈpriv(ə)lij/', def: 'A special right or advantage.', ex: 'Education is a privilege, not a right.', syn: 'advantage, benefit', slang: '', tip: 'No D! Privi-LEGE, not "ledge."', wrongOpts: ['priviledge', 'privelege', 'privilige'] },
  'conscience': { word: 'conscience', pron: '/ˈkänSHəns/', def: 'An inner feeling of right and wrong.', ex: 'His conscience told him to tell the truth.', syn: 'morals, principles', slang: '', tip: 'CON + SCIENCE = conscience.', wrongOpts: ['concience', 'consience', 'consciense'] },
  'beginning': { word: 'beginning', pron: '/bəˈɡiniNG/', def: 'The point in time or space at which something starts.', ex: 'This is just the beginning.', syn: 'start, onset', slang: '', tip: 'One B, two Ns. Be-GIN-NING.', wrongOpts: ['begining', 'beggining', 'beginng'] },
  'receive': { word: 'receive', pron: '/rəˈsēv/', def: 'Be given or presented with something.', ex: 'Did you receive my message?', syn: 'get, obtain', slang: '', tip: 'I before E, except after C. re-CEIVE.', wrongOpts: ['recieve', 'receeve', 'receve'] },
  'maintenance': { word: 'maintenance', pron: '/ˈmāntənəns/', def: 'The process of keeping something in good condition.', ex: 'Regular maintenance keeps the car running.', syn: 'upkeep, care', slang: '', tip: 'MAIN + TEN + ANCE. Ten people maintain it.', wrongOpts: ['maintainence', 'maintenence', 'maintanance'] },
  'independent': { word: 'independent', pron: '/ˌindəˈpendənt/', def: 'Free from outside control.', ex: 'She is a very independent person.', syn: 'self-reliant', slang: '', tip: 'Ends in -ENT, not -ANT. IndependENT.', wrongOpts: ['independant', 'indipendent', 'independint'] },
  'restaurant': { word: 'restaurant', pron: '/ˈrest(ə)ränt/', def: 'A place where people pay to eat meals.', ex: 'Let\'s try that new restaurant downtown.', syn: 'eatery, diner', slang: '', tip: 'REST-AU-RANT. You REST at a restaurANT.', wrongOpts: ['restaraunt', 'restraunt', 'resturant'] },
  'biology': { word: 'biology', pron: '/bīˈäləjē/', def: 'The study of living organisms.', ex: 'We learned about cells in biology.', syn: 'life science', slang: 'bio', tip: 'Bio means life, logy means study of.', wrongOpts: ['bioligy', 'byology', 'biollogy'] },
  'photosynthesis': { word: 'photosynthesis', pron: '/ˌfōdōˈsinTHəsəs/', def: 'Process by which plants use sunlight to synthesize foods.', ex: 'Photosynthesis requires sunlight and water.', syn: '', slang: '', tip: 'Photo (light) + synthesis (putting together).', wrongOpts: ['fotosynthesis', 'photosinthesis', 'photosyntesis'] },
  'literature': { word: 'literature', pron: '/ˈlidərəCHər/', def: 'Written works, especially those considered of superior or lasting artistic merit.', ex: 'She studied English literature in college.', syn: 'writings', slang: 'lit', tip: 'Liter-a-ture.', wrongOpts: ['litterature', 'litereture', 'litrature'] },
  'hypothesis': { word: 'hypothesis', pron: '/hīˈpäTHəsəs/', def: 'A proposed explanation for something.', ex: 'We tested our hypothesis in the lab.', syn: 'theory, guess', slang: '', tip: 'HYPO (under) + THESIS (idea). An idea under review.', wrongOpts: ['hypothisis', 'hipothesis', 'hypotheses'] },
  'experiment': { word: 'experiment', pron: '/ikˈsperəmənt/', def: 'A scientific test to discover something.', ex: 'The experiment proved our theory right.', syn: 'test, trial', slang: '', tip: 'Ex-PERI-ment. Think "experience."', wrongOpts: ['expiriment', 'experament', 'experiement'] },
  'environment': { word: 'environment', pron: '/inˈvīrənmənt/', def: 'The surroundings or conditions in which a person lives.', ex: 'We must protect the environment.', syn: 'surroundings', slang: '', tip: 'En-VIRON-ment. "Iron" is hiding in there.', wrongOpts: ['enviroment', 'environmant', 'enviorment'] },
  'temperature': { word: 'temperature', pron: '/ˈtemp(ə)rəCHər/', def: 'The degree of heat present.', ex: 'The temperature dropped overnight.', syn: 'heat level', slang: 'temp', tip: 'TEMPER-a-TURE. Keep your temper at the right temperature.', wrongOpts: ['temperture', 'tempreture', 'temperatur'] },
  'conclusion': { word: 'conclusion', pron: '/kənˈklo͞oZHən/', def: 'The end or finish of an event or process.', ex: 'In conclusion, the results were positive.', syn: 'ending, result', slang: '', tip: 'Con-CLU-sion. You get a CLUE at the conclusion.', wrongOpts: ['conclution', 'conclusian', 'conclussion'] },
  'equation': { word: 'equation', pron: '/iˈkwāZHən/', def: 'A mathematical statement showing two things are equal.', ex: 'Solve the equation for x.', syn: 'formula', slang: '', tip: 'EQUA-tion. It\'s about things being EQUAL.', wrongOpts: ['equasion', 'equaton', 'eqation'] },
  'chromosome': { word: 'chromosome', pron: '/ˈkrōməˌsōm/', def: 'A structure of DNA carrying genetic information.', ex: 'Humans have 23 pairs of chromosomes.', syn: '', slang: '', tip: 'CHROMO (color) + SOME (body). They were first seen with colored dyes.', wrongOpts: ['chromosone', 'cromosone', 'chromosom'] },
  'because': { word: 'because', pron: '/bəˈkôz/', def: 'For the reason that.', ex: 'I stayed home because it was raining.', syn: 'since, as', slang: 'cuz', tip: 'Big Elephants Can Always Understand Small Elephants.', wrongOpts: ['becuase', 'becasue', 'beacuse'] },
  'different': { word: 'different', pron: '/ˈdif(ə)rənt/', def: 'Not the same as another.', ex: 'Each person is different.', syn: 'distinct, unique', slang: '', tip: 'DIFFER + ENT. Things that DIFFER are different.', wrongOpts: ['diffrent', 'diferent', 'differant'] },
  'favorite': { word: 'favorite', pron: '/ˈfāv(ə)rət/', def: 'Preferred before all others.', ex: 'Pizza is my favorite food.', syn: 'preferred, top', slang: 'fave', tip: 'FAVOR + ITE. You do a FAVOR for your favorite.', wrongOpts: ['favourit', 'favrite', 'faverite'] },
  'calendar': { word: 'calendar', pron: '/ˈkaləndər/', def: 'A chart showing days, weeks, and months of a year.', ex: 'Mark the date on your calendar.', syn: 'schedule', slang: '', tip: 'Cal-END-ar. The END of the month is on the calendar.', wrongOpts: ['calender', 'calander', 'calandar'] },
  'beautiful': { word: 'beautiful', pron: '/ˈbyo͞odəfəl/', def: 'Pleasing to the senses.', ex: 'What a beautiful sunset.', syn: 'gorgeous, lovely', slang: '', tip: 'Big Elephants Are Ugly. B-E-A-U-tiful.', wrongOpts: ['beautful', 'beutiful', 'beatiful'] },
  'tomorrow': { word: 'tomorrow', pron: '/təˈmärō/', def: 'The day after today.', ex: 'I\'ll see you tomorrow.', syn: '', slang: '', tip: 'One M, two Rs. To-MOR-ROW.', wrongOpts: ['tommorow', 'tomorow', 'tommorrow'] },
  'together': { word: 'together', pron: '/təˈɡeT͟Hər/', def: 'With each other; in proximity.', ex: 'Let\'s work together on this.', syn: 'jointly', slang: '', tip: 'TO-GET-HER. Go TO GET HER and be together.', wrongOpts: ['togeather', 'togather', 'togethr'] },
  'believe': { word: 'believe', pron: '/bəˈlēv/', def: 'Accept as true.', ex: 'I believe you can do it.', syn: 'trust, accept', slang: '', tip: 'Never beLIEve a LIE.', wrongOpts: ['beleive', 'belive', 'beleave'] },
  'surprise': { word: 'surprise', pron: '/sərˈprīz/', def: 'An unexpected event.', ex: 'The party was a surprise.', syn: 'shock, astonishment', slang: '', tip: 'There\'s an R after the U. sur-PRISE not "suprise."', wrongOpts: ['suprise', 'surprize', 'surprice'] },
  'weird': { word: 'weird', pron: '/wird/', def: 'Strange or unusual.', ex: 'That was a weird dream.', syn: 'strange, odd', slang: '', tip: 'WE are WEIRD — W-E-I-R-D breaks the "i before e" rule.', wrongOpts: ['wierd', 'werd', 'weired'] },
  'friend': { word: 'friend', pron: '/frend/', def: 'A person you know well and like.', ex: 'She\'s my best friend.', syn: 'pal, buddy', slang: '', tip: 'FRI-END. A friend is there to the END.', wrongOpts: ['freind', 'frend', 'freand'] },
  'enough': { word: 'enough', pron: '/əˈnəf/', def: 'As much as is needed.', ex: 'Do we have enough food?', syn: 'sufficient, plenty', slang: '', tip: 'E-NOUGH. Ends in -OUGH like "tough."', wrongOpts: ['enought', 'enuff', 'enouf'] },
  'narrative': { word: 'narrative', pron: '/ˈnerədiv/', def: 'A spoken or written account of events.', ex: 'She wrote a personal narrative.', syn: 'story, account', slang: '', tip: 'NARR-a-TIVE. To NARRATE is to tell a narrative.', wrongOpts: ['narative', 'narratve', 'nerrative'] },
  'persuasive': { word: 'persuasive', pron: '/pərˈswāsiv/', def: 'Good at convincing someone to do or believe something.', ex: 'She made a persuasive argument.', syn: 'convincing', slang: '', tip: 'per-SUA-sive. You PERSUADE with a persuasive essay.', wrongOpts: ['persausive', 'pursuasive', 'persuasave'] },
  'paragraph': { word: 'paragraph', pron: '/ˈperəˌɡraf/', def: 'A section of writing, usually on a single theme.', ex: 'Start a new paragraph here.', syn: 'section', slang: '', tip: 'PARA + GRAPH. A paragraph is a "graph" of ideas.', wrongOpts: ['paragraf', 'paragragh', 'peragraph'] },
  'vocabulary': { word: 'vocabulary', pron: '/vōˈkabyəˌlerē/', def: 'The body of words used in a language.', ex: 'Reading builds your vocabulary.', syn: 'lexicon, words', slang: 'vocab', tip: 'VOCAB-u-LARY. Your VOCAB makes up your vocabulary.', wrongOpts: ['volcabulary', 'vocabulery', 'vocabluary'] },
  'exaggerate': { word: 'exaggerate', pron: '/iɡˈzajəˌrāt/', def: 'Represent as greater than it really is.', ex: 'Don\'t exaggerate the problem.', syn: 'overstate', slang: '', tip: 'Ex-AGGER-ate. Two Gs! You really AGGER-avate when you exaggerate.', wrongOpts: ['exagerate', 'exaggarate', 'exadgerate'] },
  'description': { word: 'description', pron: '/diˈskripSH(ə)n/', def: 'A spoken or written representation.', ex: 'Write a description of the scene.', syn: 'account, portrayal', slang: '', tip: 'de-SCRIP-tion. You write a SCRIP-t description.', wrongOpts: ['discription', 'descripion', 'descrption'] },
  'argument': { word: 'argument', pron: '/ˈärɡyəmənt/', def: 'A reason or set of reasons given in support of an idea.', ex: 'She presented a strong argument.', syn: 'case, point', slang: '', tip: 'ARGU-ment. No E! You ARGUE but the arguMENT drops the E.', wrongOpts: ['arguement', 'arguemant', 'argumant'] },
  'opinion': { word: 'opinion', pron: '/əˈpinyən/', def: 'A view or judgment about something.', ex: 'Everyone is entitled to their opinion.', syn: 'view, belief', slang: '', tip: 'O-PIN-ION. You PIN your opINION on something.', wrongOpts: ['oppinion', 'opinon', 'opinnion'] },
  'onomatopoeia': { word: 'onomatopoeia', pron: '/ˌänəˌmadəˈpēə/', def: 'The formation of a word from a sound.', ex: 'Buzz and hiss are examples of onomatopoeia.', syn: '', slang: '', tip: 'O-NO-MATO-POEIA. "Oh no, my tomato made a sound!"', wrongOpts: ['onomatapoeia', 'onomatopeia', 'onomotopoeia'] },
  'mischievous': { word: 'mischievous', pron: '/ˈmisCHəvəs/', def: 'Causing or showing a fondness for causing trouble in a playful way.', ex: 'The mischievous kitten knocked everything off the shelf.', syn: 'naughty, playful', slang: '', tip: 'MIS-CHIE-VOUS. Only 3 syllables! No "ee" at the end.', wrongOpts: ['mischievious', 'mischevous', 'mischieveous'] },
  'millennium': { word: 'millennium', pron: '/məˈlenēəm/', def: 'A period of one thousand years.', ex: 'We entered a new millennium in 2000.', syn: '', slang: '', tip: 'Two Ls, two Ns. MILL-ENN-IUM.', wrongOpts: ['millenium', 'milennium', 'millenniam'] },
  'bureaucracy': { word: 'bureaucracy', pron: '/byo͝oˈräkrəsē/', def: 'A system of government with many complicated rules.', ex: 'The bureaucracy slowed everything down.', syn: 'red tape', slang: '', tip: 'BUREAU + CRACY. A BUREAU that rules.', wrongOpts: ['beaurocracy', 'burocracy', 'bureaucrasy'] },
  'acquaintance': { word: 'acquaintance', pron: '/əˈkwāntəns/', def: 'A person one knows slightly.', ex: 'He\'s an acquaintance from work.', syn: 'contact', slang: '', tip: 'AC-QUAINT-ANCE. You get ACQUAINTED with an acquaintance.', wrongOpts: ['aquaintance', 'acquaintence', 'accquaintance'] },
  'principal': { word: 'principal', pron: '/ˈprinsəpəl/', def: 'The head of a school; first in importance.', ex: 'The principal made an announcement.', syn: 'head, chief', slang: '', tip: 'The princiPAL is your PAL.', wrongOpts: ['principle', 'princpal', 'principel'] },
  'principle': { word: 'principle', pron: '/ˈprinsəpəl/', def: 'A fundamental truth or rule.', ex: 'He stood by his principles.', syn: 'rule, belief', slang: '', tip: 'A principLE is a ruLE.', wrongOpts: ['principal', 'princple', 'principel'] },
  'affect': { word: 'affect', pron: '/əˈfekt/', def: 'To have an influence on (verb).', ex: 'The weather will affect our plans.', syn: 'influence, impact', slang: '', tip: 'Affect = Action (both start with A). It\'s the verb.', wrongOpts: ['effect', 'afect', 'affeckt'] },
  'effect': { word: 'effect', pron: '/əˈfekt/', def: 'A result or change (noun).', ex: 'The effect of the medicine was immediate.', syn: 'result, outcome', slang: '', tip: 'Effect = End result (both start with E). It\'s the noun.', wrongOpts: ['affect', 'efect', 'effectt'] },
  'their': { word: 'their', pron: '/T͟Her/', def: 'Belonging to them.', ex: 'That is their house.', syn: '', slang: '', tip: 'THEIR has HEIR — something that belongs to an heir.', wrongOpts: ['there', 'they\'re', 'thier'] },
  'category': { word: 'category', pron: '/ˈkadəˌɡôrē/', def: 'A class or division of things.', ex: 'Choose a category.', syn: 'group, class', slang: '', tip: 'CAT-E-GORY. A CAT in every category.', wrongOpts: ['catagory', 'categorie', 'catigory'] },
  'guarantee': { word: 'guarantee', pron: '/ˌɡerənˈtē/', def: 'A formal promise or assurance.', ex: 'I guarantee you\'ll love it.', syn: 'promise, assurance', slang: '', tip: 'GUA-RAN-TEE. Guard your guarantee.', wrongOpts: ['guarentee', 'garantee', 'gaurantee'] },
  'knowledge': { word: 'knowledge', pron: '/ˈnälij/', def: 'Facts, information, and skills acquired.', ex: 'Knowledge is power.', syn: 'understanding', slang: '', tip: 'KNOW + LEDGE. Stand on the LEDGE of what you KNOW.', wrongOpts: ['knowlege', 'knowledg', 'noledge'] },
  'audience': { word: 'audience', pron: '/ˈôdēəns/', def: 'The people gathered to watch or listen.', ex: 'The audience clapped loudly.', syn: 'crowd, viewers', slang: '', tip: 'AUDI-ence. AUDIO is what the audience hears.', wrongOpts: ['audiance', 'audence', 'audiensce'] },
  'achievement': { word: 'achievement', pron: '/əˈCHēvmənt/', def: 'A thing accomplished successfully.', ex: 'Graduating was a great achievement.', syn: 'accomplishment', slang: '', tip: 'ACHIEVE + MENT. I before E in achieve.', wrongOpts: ['acheivment', 'acheivement', 'achievment'] },
  'scissors': { word: 'scissors', pron: '/ˈsizərz/', def: 'A cutting instrument with two blades.', ex: 'Hand me the scissors.', syn: 'shears', slang: '', tip: 'S-C-I-S-S-O-R-S. The C is silent and sneaky.', wrongOpts: ['sissors', 'scisors', 'scissers'] },
  'schedule': { word: 'schedule', pron: '/ˈskejəl/', def: 'A plan for carrying out activities.', ex: 'Check the bus schedule.', syn: 'timetable, plan', slang: 'sched', tip: 'SCHED-ULE. The C and H team up to make a "sk" sound.', wrongOpts: ['schedual', 'scedule', 'shedule'] },
  'cemetery': { word: 'cemetery', pron: '/ˈseməˌterē/', def: 'A burial ground.', ex: 'The old cemetery was on a hill.', syn: 'graveyard', slang: '', tip: 'All Es! CEmEtEry. No As anywhere.', wrongOpts: ['cemetary', 'cematery', 'cematary'] },
};

// --- WORD BANKS BY CATEGORY ---
const WORD_BANKS: Record<string, Record<string, string[]>> = {
  'Everyday Words': {
    Easy: ['because', 'friend', 'enough', 'believe', 'favorite', 'different', 'together', 'beautiful', 'tomorrow', 'calendar', 'surprise', 'weird', 'beginning', 'receive', 'separate', 'schedule', 'knowledge', 'audience', 'opinion', 'guarantee'],
    Medium: ['because', 'friend', 'enough', 'believe', 'favorite', 'different', 'together', 'beautiful', 'tomorrow', 'calendar', 'surprise', 'weird', 'beginning', 'receive', 'separate', 'schedule', 'knowledge', 'audience', 'restaurant', 'maintenance'],
    Hard: ['because', 'beautiful', 'tomorrow', 'calendar', 'surprise', 'weird', 'beginning', 'receive', 'separate', 'schedule', 'knowledge', 'audience', 'restaurant', 'maintenance', 'guarantee', 'achievement', 'independent', 'environment', 'temperature', 'conscience'],
  },
  'Commonly Misspelled': {
    Easy: ['because', 'believe', 'friend', 'different', 'favorite', 'beautiful', 'weird', 'enough', 'surprise', 'tomorrow', 'together', 'receive', 'separate', 'calendar', 'beginning', 'opinion', 'knowledge', 'argument', 'schedule', 'scissors'],
    Medium: ['accommodate', 'embarrass', 'necessary', 'definitely', 'separate', 'occurrence', 'receive', 'privilege', 'maintenance', 'independent', 'restaurant', 'calendar', 'guarantee', 'beginning', 'cemetery', 'conscience', 'exaggerate', 'knowledge', 'achievement', 'scissors'],
    Hard: ['accommodate', 'embarrass', 'fluorescent', 'necessary', 'occurrence', 'definitely', 'privilege', 'maintenance', 'independent', 'restaurant', 'guarantee', 'conscience', 'millennium', 'bureaucracy', 'acquaintance', 'onomatopoeia', 'mischievous', 'cemetery', 'exaggerate', 'achievement'],
  },
  'Academic Words': {
    Easy: ['biology', 'hypothesis', 'experiment', 'conclusion', 'equation', 'paragraph', 'vocabulary', 'narrative', 'description', 'opinion', 'environment', 'temperature', 'different', 'knowledge', 'category', 'audience', 'achievement', 'believe', 'separate', 'beginning'],
    Medium: ['biology', 'photosynthesis', 'hypothesis', 'experiment', 'environment', 'temperature', 'conclusion', 'equation', 'chromosome', 'literature', 'vocabulary', 'narrative', 'persuasive', 'paragraph', 'description', 'exaggerate', 'argument', 'category', 'achievement', 'audience'],
    Hard: ['photosynthesis', 'hypothesis', 'chromosome', 'environment', 'temperature', 'literature', 'fluorescent', 'onomatopoeia', 'bureaucracy', 'acquaintance', 'millennium', 'conscience', 'occurrence', 'independent', 'maintenance', 'accommodate', 'mischievous', 'persuasive', 'exaggerate', 'vocabulary'],
  },
  'Writing Words': {
    Easy: ['narrative', 'paragraph', 'opinion', 'description', 'vocabulary', 'argument', 'believe', 'different', 'because', 'beautiful', 'favorite', 'together', 'separate', 'beginning', 'enough', 'knowledge', 'audience', 'friend', 'surprise', 'calendar'],
    Medium: ['narrative', 'persuasive', 'paragraph', 'vocabulary', 'exaggerate', 'description', 'argument', 'opinion', 'audience', 'category', 'achievement', 'conclusion', 'separate', 'independent', 'definitely', 'necessary', 'embarrass', 'privilege', 'knowledge', 'guarantee'],
    Hard: ['narrative', 'persuasive', 'paragraph', 'vocabulary', 'exaggerate', 'description', 'argument', 'onomatopoeia', 'mischievous', 'bureaucracy', 'acquaintance', 'millennium', 'accommodate', 'fluorescent', 'occurrence', 'conscience', 'maintenance', 'achievement', 'independent', 'guarantee'],
  },
  'Challenge Words': {
    Easy: ['necessary', 'definitely', 'separate', 'embarrass', 'occurrence', 'privilege', 'beginning', 'receive', 'maintenance', 'independent', 'restaurant', 'guarantee', 'conscience', 'fluorescent', 'cemetery', 'scissors', 'schedule', 'achievement', 'exaggerate', 'calendar'],
    Medium: ['accommodate', 'fluorescent', 'occurrence', 'privilege', 'maintenance', 'independent', 'restaurant', 'guarantee', 'conscience', 'millennium', 'mischievous', 'acquaintance', 'bureaucracy', 'onomatopoeia', 'cemetery', 'achievement', 'exaggerate', 'chromosome', 'hypothesis', 'photosynthesis'],
    Hard: ['accommodate', 'fluorescent', 'onomatopoeia', 'mischievous', 'millennium', 'bureaucracy', 'acquaintance', 'photosynthesis', 'chromosome', 'conscience', 'occurrence', 'maintenance', 'independent', 'guarantee', 'cemetery', 'exaggerate', 'achievement', 'privilege', 'restaurant', 'embarrass'],
  },
  'Confusing Words': {
    Easy: ['their', 'affect', 'effect', 'principal', 'principle', 'believe', 'receive', 'weird', 'friend', 'different', 'separate', 'definitely', 'favorite', 'calendar', 'category', 'because', 'enough', 'beautiful', 'surprise', 'together'],
    Medium: ['their', 'affect', 'effect', 'principal', 'principle', 'definitely', 'separate', 'necessary', 'embarrass', 'privilege', 'conscience', 'receive', 'believe', 'weird', 'guarantee', 'independent', 'occurrence', 'calendar', 'cemetery', 'category'],
    Hard: ['their', 'affect', 'effect', 'principal', 'principle', 'conscience', 'definitely', 'separate', 'accommodate', 'occurrence', 'privilege', 'fluorescent', 'mischievous', 'acquaintance', 'bureaucracy', 'millennium', 'maintenance', 'guarantee', 'independent', 'cemetery'],
  },
};

const INITIAL_LISTS: WordList[] = [
  { id: '1', name: 'Weekly Spelling', words: ['accommodate', 'embarrass', 'rhythm'], active: true },
  { id: '2', name: 'Science Vocab', words: ['fluorescent', 'necessary'], active: true }
];

// --- GENERATE MISSPELLINGS FOR WORDS WITHOUT DICTIONARY ENTRIES ---
// Produces a pool of unique misspellings using several strategies. Always excludes
// the original word, dedupes results, and keeps generating until `count` is reached
// (or we run out of strategies). Used to build distractors for Quiet Practice.
const generateMisspellings = (word: string, count: number = 4): string[] => {
  const original = word.toLowerCase();
  const chars = original.split('');
  const results = new Set<string>();
  const tryAdd = (s: string) => {
    if (s && s.length > 0 && s !== original) results.add(s);
  };

  // Strategy 1 — drop a vowel ("exact" -> "xact")
  for (let i = 0; i < chars.length; i++) {
    if ('aeiou'.includes(chars[i])) {
      const m = [...chars]; m.splice(i, 1); tryAdd(m.join(''));
      if (results.size >= count) return Array.from(results).slice(0, count);
    }
  }

  // Strategy 2 — swap adjacent different letters ("friend" -> "freind")
  for (let i = 0; i < chars.length - 1; i++) {
    if (chars[i] !== chars[i + 1]) {
      const m = [...chars]; [m[i], m[i + 1]] = [m[i + 1], m[i]]; tryAdd(m.join(''));
      if (results.size >= count) return Array.from(results).slice(0, count);
    }
  }

  // Strategy 3 — double a consonant ("exact" -> "exxact")
  for (let i = 1; i < chars.length; i++) {
    if (!'aeiou'.includes(chars[i])) {
      const m = [...chars]; m.splice(i, 0, chars[i]); tryAdd(m.join(''));
      if (results.size >= count) return Array.from(results).slice(0, count);
    }
  }

  // Strategy 4 — replace a vowel with a different vowel ("exact" -> "ixact")
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  for (let i = 0; i < chars.length; i++) {
    if ('aeiou'.includes(chars[i])) {
      for (const v of vowels) {
        if (v !== chars[i]) {
          const m = [...chars]; m[i] = v; tryAdd(m.join(''));
          if (results.size >= count) return Array.from(results).slice(0, count);
        }
      }
    }
  }

  // Strategy 5 — common ending swaps (kids confuse these constantly)
  if (original.endsWith('ie')) tryAdd(original.slice(0, -2) + 'ei');
  if (original.endsWith('ei')) tryAdd(original.slice(0, -2) + 'ie');
  if (original.endsWith('ent')) tryAdd(original.slice(0, -3) + 'ant');
  if (original.endsWith('ant')) tryAdd(original.slice(0, -3) + 'ent');
  if (original.endsWith('ence')) tryAdd(original.slice(0, -4) + 'ance');
  if (original.endsWith('ance')) tryAdd(original.slice(0, -4) + 'ence');
  if (original.endsWith('able')) tryAdd(original.slice(0, -4) + 'ible');
  if (original.endsWith('ible')) tryAdd(original.slice(0, -4) + 'able');

  // Strategy 6 — collapse a doubled consonant ("accommodate" -> "acommodate")
  for (let i = 0; i < chars.length - 1; i++) {
    if (chars[i] === chars[i + 1] && !'aeiou'.includes(chars[i])) {
      const m = [...chars]; m.splice(i, 1); tryAdd(m.join(''));
    }
  }

  return Array.from(results).slice(0, count);
};

const getWordDetails = (word: string) => {
  if (DICTIONARY[word]) return DICTIONARY[word];
  return { word, pron: '', def: '', ex: '', syn: '', slang: '', tip: `Practice spelling: ${word}`, wrongOpts: generateMisspellings(word) };
};

// --- UTILITY COMPONENTS ---
const GlassCard = ({ children, className = '', onClick }: any) => (
  <div onClick={onClick}
    className={`bg-[#886451]/20 backdrop-blur-xl border border-[#528881]/30 rounded-2xl shadow-2xl overflow-hidden ${onClick ? 'cursor-pointer hover:bg-[#886451]/30 hover:border-[#528881]/50 transition-all' : ''} ${className}`}>
    {children}
  </div>
);

const TealButton = ({ children, onClick, className = '', outline = false, disabled = false, type = 'button' }: any) => (
  <button onClick={onClick} disabled={disabled} type={type}
    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all border focus:outline-none focus:ring-2 focus:ring-[#528881] disabled:opacity-50
      ${outline ? 'bg-transparent text-[#528881] border-[#528881]/60 hover:bg-[#528881]/10' : 'bg-[#885159] text-white border-[#528881]/80 hover:bg-[#885159]/90 shadow-[0_0_10px_rgba(82,136,129,0.2)]'} ${className}`}>
    {children}
  </button>
);

const HelperBtn = ({ icon: Icon, onClick, title, disabled }: any) => (
  <button onClick={onClick} title={title} disabled={disabled}
    className="p-2.5 rounded-full border border-[#528881]/40 text-[#528881] hover:bg-[#528881]/20 hover:text-white transition-all disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center">
    <Icon size={18} />
  </button>
);

// --- AUDIO UTILS (Chrome-safe) ---
const speakText = (text: string, rate: number = 1) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }, 80);
};

// --- REWARD MESSAGES ---
const CORRECT_MESSAGES = [
  { text: 'Nailed it!', icon: Zap },
  { text: 'Perfect!', icon: Star },
  { text: 'On fire!', icon: Flame },
  { text: 'Excellent!', icon: Trophy },
  { text: 'Crushed it!', icon: Sparkles },
  { text: 'Brilliant!', icon: Star },
  { text: 'Unstoppable!', icon: Flame },
  { text: 'Legendary!', icon: Trophy },
];
const getRandomReward = () => CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)];

// --- STREAK BADGE ---
function StreakBadge({ streak }: { streak: number }) {
  if (streak < 2) return null;
  return (
    <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#528881]/30 to-[#885159]/30 border border-[#528881]/60 px-3 py-1 rounded-full">
      <Flame size={16} className="text-orange-400" />
      <span className="text-orange-300 text-sm font-bold">{streak} streak!</span>
    </div>
  );
}

// --- QUIZ COMPONENT (outside SpellCoach to prevent remount bugs) ---
function Quiz({ words, missedWords, setMissedWords, onBack, listName, userEmail, practicingMissed }: {
  words: string[]; missedWords: string[]; setMissedWords: (w: string[]) => void; onBack: () => void;
  listName?: string; userEmail?: string; practicingMissed?: boolean;
}) {
  const [orderedWords, setOrderedWords] = useState<string[]>(() => [...words].sort(() => Math.random() - 0.5));
  const [wordIdx, setWordIdx] = useState(0);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [reward, setReward] = useState(getRandomReward());
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [done, setDone] = useState(false);
  const [restarts, setRestarts] = useState(0);
  const [sentenceCache, setSentenceCache] = useState<Record<string, string>>({});
  const [sentenceLoading, setSentenceLoading] = useState(false);
  const hasLoggedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentWord = orderedWords[wordIdx];
  const details = getWordDetails(currentWord || '');

  useEffect(() => { if (inputRef.current && status === 'idle') inputRef.current.focus(); }, [status, wordIdx]);
  useEffect(() => { if (currentWord && status === 'idle' && !done) speakText(currentWord); }, [currentWord, status, done]);

  // Speak the current word in an example sentence.
  // Order of preference: dictionary entry → cached AI sentence → fetch from Netlify function → fallback.
  const handleExampleSentence = async () => {
    if (!currentWord) return;
    if (details.ex) { speakText(details.ex); return; }
    const cached = sentenceCache[currentWord];
    if (cached) { speakText(cached); return; }
    if (sentenceLoading) return;
    setSentenceLoading(true);
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(`/.netlify/functions/sentence?word=${encodeURIComponent(currentWord)}`, { signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const sentence = (data && typeof data.sentence === 'string') ? data.sentence.trim() : '';
        if (sentence) {
          setSentenceCache(prev => ({ ...prev, [currentWord]: sentence }));
          speakText(sentence);
        } else {
          speakText(`The word is ${currentWord}.`);
        }
      } else {
        speakText(`The word is ${currentWord}.`);
      }
    } catch {
      speakText(`The word is ${currentWord}.`);
    } finally {
      setSentenceLoading(false);
    }
  };

  const checkAnswer = (e: any) => {
    e.preventDefault();
    if (!input) return;
    if (input.toLowerCase().trim() === currentWord.toLowerCase()) {
      setStatus('correct'); setReward(getRandomReward()); setStreak(s => s + 1);
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 })); speakText("Correct!");
      // If practicing missed words, remove this word from the missed list on correct answer
      if (practicingMissed && missedWords.includes(currentWord)) {
        setMissedWords(missedWords.filter(w => w !== currentWord));
      }
    } else {
      setStatus('incorrect'); setStreak(0); setScore(s => ({ ...s, total: s.total + 1 })); speakText("Not quite.");
      if (!missedWords.includes(currentWord)) setMissedWords([...missedWords, currentWord]);
    }
  };

  const nextWord = () => {
    if (wordIdx + 1 >= orderedWords.length) { setDone(true); return; }
    setInput(''); setStatus('idle'); setWordIdx(p => p + 1);
  };

  // Log activity when quiz is done
  useEffect(() => {
    if (done && !hasLoggedRef.current && userEmail) {
      hasLoggedRef.current = true;
      const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
      logActivity({
        type: 'quiz', date: new Date().toISOString(), listName: listName || 'Unknown',
        score: score.correct, total: score.total, pct, restarts, userEmail,
      }).catch(() => {});
    }
  }, [done]);

  const startOver = () => {
    setOrderedWords([...words].sort(() => Math.random() - 0.5));
    setWordIdx(0); setInput(''); setStatus('idle'); setScore({ correct: 0, total: 0 }); setStreak(0); setDone(false);
    setRestarts(r => r + 1); hasLoggedRef.current = false;
  };

  const renderDiff = (target: string, user: string) => {
    const tChars = target.split(''), uChars = user.split('');
    return Array.from({ length: Math.max(tChars.length, uChars.length) }, (_, i) =>
      tChars[i] === uChars[i]
        ? <span key={i} className="text-gray-200">{tChars[i]}</span>
        : <span key={i} className="text-[#885159] font-bold underline decoration-[#528881]/80 decoration-2">{uChars[i] || '_'}</span>
    );
  };

  if (!currentWord) return <div className="text-white text-center p-8">No active words found. Create a list first!</div>;

  if (done) {
    const pct = Math.round((score.correct / score.total) * 100);
    const isGreat = pct >= 80;
    return (
      <div className="max-w-lg w-full mx-auto animate-in fade-in zoom-in-95 duration-300">
        <GlassCard className="p-8 border-[#528881]/50 text-center">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 border-2 ${isGreat ? 'bg-[#528881]/20 border-[#528881] shadow-[0_0_30px_rgba(82,136,129,0.5)]' : 'bg-[#885159]/20 border-[#885159]'}`}>
            <Trophy size={48} className={isGreat ? 'text-[#528881]' : 'text-[#885159]'} />
          </div>
          <h2 className="font-title text-4xl text-gray-100 mb-2">Quiz Complete!</h2>
          <p className="text-[#528881] text-lg mb-6 font-subtitle">{score.correct} / {score.total} correct — {pct}%</p>
          <div className="flex justify-center gap-2 mb-8">
            {[...Array(5)].map((_, i) => <Star key={i} size={32} className={i < Math.ceil(pct / 20) ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]' : 'text-gray-600'} />)}
          </div>
          {isGreat ? <p className="text-gray-300 mb-6 text-lg">Amazing work! Keep it up!</p> : <p className="text-gray-300 mb-6">Keep practicing — you're getting better every time!</p>}
          <div className="flex flex-col gap-3">
            <TealButton onClick={startOver} className="w-full py-4 text-lg"><RotateCcw size={20} /> Try Again</TealButton>
            <TealButton outline onClick={onBack} className="w-full py-3">Back to Home</TealButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-lg w-full mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-[#528881] flex items-center gap-2 hover:text-white transition-colors min-h-[44px]"><ChevronRight className="rotate-180" size={20} /> Back</button>
        <StreakBadge streak={streak} />
      </div>
      <GlassCard className="p-6 sm:p-8 border-[#528881]/50">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#528881]/30">
          <span className="text-gray-400 text-sm font-subtitle tracking-widest">Word {wordIdx + 1} of {orderedWords.length}</span>
          <div className="flex gap-2">
            <HelperBtn icon={Volume2} title="Hear Word" onClick={() => speakText(currentWord)} />
            <HelperBtn icon={Snail} title="Hear Slowly" onClick={() => speakText(currentWord, 0.3)} />
            <HelperBtn icon={MessageSquare} title="Example Sentence" onClick={handleExampleSentence} disabled={sentenceLoading} />
          </div>
        </div>
        <div className="text-center mb-6">
          <button onClick={() => speakText(currentWord)}
            className="w-20 h-20 mx-auto bg-[#528881]/10 rounded-full flex items-center justify-center border-2 border-[#528881]/40 mb-4 hover:bg-[#528881]/20 hover:scale-105 transition-all shadow-[0_0_15px_rgba(82,136,129,0.2)] active:scale-95">
            <Volume2 size={32} color={COLORS.teal} />
          </button>
          <p className="text-gray-400 text-sm">Listen and type</p>
        </div>
        {status === 'idle' && (
          <form onSubmit={checkAnswer}>
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
              className="w-full bg-black/50 border-2 border-[#528881]/50 rounded-xl px-4 py-4 text-center text-2xl text-gray-100 focus:outline-none focus:border-[#528881] focus:ring-1 focus:ring-[#528881] transition-all shadow-inner"
              placeholder="Type spelling here..." autoComplete="off" spellCheck={false} autoCapitalize="off" autoCorrect="off" />
            <TealButton type="submit" className="w-full mt-6 py-4 text-lg">Check Answer</TealButton>
          </form>
        )}
        {status === 'correct' && (
          <div className="text-center animate-in zoom-in-95">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#528881]/20 border-2 border-[#528881] mb-4 shadow-[0_0_30px_rgba(82,136,129,0.6)] animate-pulse">
              <reward.icon size={40} className="text-[#528881]" />
            </div>
            <h2 className="font-title text-3xl text-gray-100 mb-2 tracking-wide">{reward.text}</h2>
            {streak >= 2 && <p className="text-orange-300 text-sm mb-2">{streak} in a row!</p>}
            <div className="flex items-center justify-center gap-1 mb-6">
              {[...Array(Math.min(streak, 5))].map((_, i) => <Star key={i} size={20} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.6)]" />)}
            </div>
            <TealButton onClick={nextWord} className="w-full py-4 text-lg">{wordIdx + 1 >= orderedWords.length ? 'See Results' : 'Next Word'} <ArrowRight size={20} /></TealButton>
          </div>
        )}
        {status === 'incorrect' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-[#885159]/20 border border-[#885159]/50 rounded-xl p-6 mb-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#885159]"></div>
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-subtitle">You Typed</p>
              <div className="text-2xl tracking-widest mb-4 bg-black/40 py-3 rounded-lg border border-[#528881]/30">{renderDiff(currentWord, input)}</div>
              <p className="text-xs text-[#528881] mb-1 uppercase tracking-wider mt-4 font-subtitle">Correct Spelling</p>
              <div className="text-3xl text-gray-100 tracking-widest font-medium mb-4">{currentWord}</div>
              {details.tip && (
                <div className="bg-black/50 p-4 rounded-lg text-left border border-[#528881]/40 mt-4">
                  <div className="flex items-center gap-2 mb-2 text-[#528881]"><Info size={16} /> <span className="font-medium text-sm">Memory Trick</span></div>
                  <p className="text-gray-300 text-sm leading-relaxed">{details.tip}</p>
                </div>
              )}
            </div>
            <TealButton onClick={nextWord} className="w-full py-4 text-lg">{wordIdx + 1 >= orderedWords.length ? 'See Results' : 'Got it, Next Word'} <ArrowRight size={20} /></TealButton>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// --- QUIET PRACTICE ---
function QuietPractice({ words, missedWords, setMissedWords, onBack, listName, userEmail, practicingMissed }: {
  words: string[]; missedWords: string[]; setMissedWords: (w: string[]) => void; onBack: () => void;
  listName?: string; userEmail?: string; practicingMissed?: boolean;
}) {
  const [orderedWords, setOrderedWords] = useState<string[]>(() => [...words].sort(() => Math.random() - 0.5));
  const [wordIdx, setWordIdx] = useState(0);
  const [status, setStatus] = useState<'idle' | 'checked'>('idle');
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);
  const [reward, setReward] = useState(getRandomReward());
  const [done, setDone] = useState(false);
  const [restarts, setRestarts] = useState(0);
  const hasLoggedRef = useRef(false);
  const currentWord = orderedWords[wordIdx];

  useEffect(() => {
    if (currentWord && !done) {
      const details = getWordDetails(currentWord);
      // Build a deduped pool of misspellings: dictionary's curated wrongs first,
      // then generated misspellings to top up. Always exclude the correct word.
      const wrongPool = new Set<string>();
      (details.wrongOpts || []).forEach(w => {
        if (w && w !== currentWord) wrongPool.add(w);
      });
      // Always generate extras so we have plenty of variety, then dedupe via Set.
      generateMisspellings(currentWord, 8).forEach(w => {
        if (w !== currentWord) wrongPool.add(w);
      });
      // Pick 4 wrong answers (shuffled) and combine with the correct word for 5 total.
      const wrongs = Array.from(wrongPool).sort(() => Math.random() - 0.5).slice(0, 4);
      const opts = Array.from(new Set([currentWord, ...wrongs])).sort(() => Math.random() - 0.5);
      setOptions(opts); setSelectedOpt(null); setStatus('idle');
    }
  }, [wordIdx, done]);

  const handleCheck = () => {
    if (!selectedOpt) return;
    setStatus('checked');
    if (selectedOpt === currentWord) {
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 })); setStreak(s => s + 1); setReward(getRandomReward());
      // If practicing missed words, remove this word from the missed list on correct answer
      if (practicingMissed && missedWords.includes(currentWord)) {
        setMissedWords(missedWords.filter(w => w !== currentWord));
      }
    } else {
      setScore(s => ({ ...s, total: s.total + 1 })); setStreak(0);
      if (!missedWords.includes(currentWord)) setMissedWords([...missedWords, currentWord]);
    }
  };

  const nextWord = () => {
    if (wordIdx + 1 >= orderedWords.length) { setDone(true); return; }
    setWordIdx(p => p + 1);
  };

  // Log activity when practice is done
  useEffect(() => {
    if (done && !hasLoggedRef.current && userEmail) {
      hasLoggedRef.current = true;
      const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
      logActivity({
        type: 'quiet', date: new Date().toISOString(), listName: listName || 'Unknown',
        score: score.correct, total: score.total, pct, restarts, userEmail,
      }).catch(() => {});
    }
  }, [done]);

  const startOver = () => {
    setOrderedWords([...words].sort(() => Math.random() - 0.5));
    setWordIdx(0); setScore({ correct: 0, total: 0 }); setStreak(0); setDone(false); setStatus('idle'); setSelectedOpt(null);
    setRestarts(r => r + 1); hasLoggedRef.current = false;
  };

  if (done) {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    const isGreat = pct >= 80;
    return (
      <div className="max-w-lg w-full mx-auto animate-in fade-in zoom-in-95 duration-300">
        <GlassCard className="p-8 border-[#528881]/50 text-center">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 border-2 ${isGreat ? 'bg-[#528881]/20 border-[#528881] shadow-[0_0_30px_rgba(82,136,129,0.5)]' : 'bg-[#885159]/20 border-[#885159]'}`}>
            <Trophy size={48} className={isGreat ? 'text-[#528881]' : 'text-[#885159]'} />
          </div>
          <h2 className="font-title text-4xl text-gray-100 mb-2">Practice Complete!</h2>
          <p className="text-[#528881] text-lg mb-6 font-subtitle">{score.correct} / {score.total} correct — {pct}%</p>
          <div className="flex justify-center gap-2 mb-8">
            {[...Array(5)].map((_, i) => <Star key={i} size={32} className={i < Math.ceil(pct / 20) ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]' : 'text-gray-600'} />)}
          </div>
          {isGreat ? <p className="text-gray-300 mb-6 text-lg">You're a spelling machine!</p> : <p className="text-gray-300 mb-6">Nice effort — practice makes perfect!</p>}
          <div className="flex flex-col gap-3">
            <TealButton onClick={startOver} className="w-full py-4 text-lg"><RotateCcw size={20} /> Start Over</TealButton>
            <TealButton outline onClick={onBack} className="w-full py-3">Back to Home</TealButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!currentWord) return <div className="text-white text-center p-8">No active words.</div>;

  return (
    <div className="max-w-lg w-full mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-[#528881] flex items-center gap-2 hover:text-white transition-colors min-h-[44px]"><ChevronRight className="rotate-180" size={20} /> Back</button>
        <StreakBadge streak={streak} />
      </div>
      <GlassCard className="p-6 sm:p-8 border-[#528881]/50">
        <div className="text-center mb-6 border-b border-[#528881]/30 pb-4">
          <h2 className="text-[#528881] text-sm uppercase tracking-widest mb-1 font-subtitle">Quiet Mode — Word {wordIdx + 1} of {orderedWords.length}</h2>
          <p className="text-gray-300">Which is the correct spelling?</p>
        </div>
        <div className="flex flex-col gap-3 mb-6">
          {options.map((opt, i) => {
            let cls = "bg-black/40 border-[#528881]/30 text-gray-300 hover:border-[#528881]/80 hover:bg-[#528881]/10";
            if (status === 'idle' && selectedOpt === opt) cls = "bg-[#528881]/20 border-[#528881] text-white shadow-[0_0_10px_rgba(82,136,129,0.3)]";
            else if (status === 'checked') {
              if (opt === currentWord) cls = "bg-[#528881]/40 border-[#528881] text-white shadow-[0_0_15px_rgba(82,136,129,0.5)]";
              else if (selectedOpt === opt) cls = "bg-[#885159]/40 border-[#885159] text-white";
              else cls = "bg-black/20 border-[#528881]/20 text-gray-600 opacity-50";
            }
            return (
              <button key={i} onClick={() => status === 'idle' && setSelectedOpt(opt)} disabled={status !== 'idle'}
                className={`p-4 rounded-xl border-2 transition-all text-xl tracking-wide min-h-[56px] ${cls}`}>{opt}</button>
            );
          })}
        </div>
        {status === 'idle' ? (
          <TealButton onClick={handleCheck} disabled={!selectedOpt} className="w-full py-4 text-lg">Check Answer</TealButton>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            {selectedOpt === currentWord ? (
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#528881]/20 border-2 border-[#528881] mb-3 shadow-[0_0_20px_rgba(82,136,129,0.5)]">
                  <reward.icon size={32} className="text-[#528881]" />
                </div>
                <h3 className="font-title text-2xl text-[#528881]">{reward.text}</h3>
                {streak >= 2 && <p className="text-orange-300 text-sm mt-1">{streak} in a row!</p>}
              </div>
            ) : (
              <div className="text-center mb-6">
                <h3 className="font-title text-2xl text-[#885159] mb-2">Not quite</h3>
                <div className="text-sm text-[#885159] bg-[#885159]/10 p-3 rounded-lg border border-[#885159]/30 inline-block">Saved to Missed Words</div>
              </div>
            )}
            <TealButton onClick={nextWord} className="w-full py-4 text-lg">{wordIdx + 1 >= orderedWords.length ? 'See Results' : 'Continue'} <ArrowRight size={20} /></TealButton>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// --- PRACTICE SETUP (shared picker for Quiz + Quiet Practice) ---
function PracticeSetup({ mode, lists, onStart, onBack }: {
  mode: 'quiz' | 'quiet';
  lists: { id: string; name: string; words: string[]; active: boolean }[];
  onStart: (words: string[], listName: string) => void;
  onBack: () => void;
}) {
  const allDictWords = Object.keys(DICTIONARY);
  const activeWords = lists.filter(l => l.active).flatMap(l => l.words);
  const listOptions = [
    { id: '__dict', name: 'Full Dictionary', words: allDictWords },
    ...(activeWords.length > 0 ? [{ id: '__active', name: 'Active Lists (combined)', words: activeWords }] : []),
    ...lists.map(l => ({ id: l.id, name: l.name, words: l.words })),
  ].filter(l => l.words.length > 0);
  const [selectedList, setSelectedList] = useState(listOptions[0]?.id || '__dict');
  const selected = listOptions.find(l => l.id === selectedList);
  const selectedWords = selected?.words || [];
  const title = mode === 'quiz' ? 'Start Quiz' : 'Quiet Practice';
  const subtitle = mode === 'quiz' ? 'Choose a word list' : 'Choose a word list';

  return (
    <div className="max-w-md w-full mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <button onClick={onBack} className="text-[#528881] flex items-center gap-2 mb-6 hover:text-white transition-colors min-h-[44px]"><ChevronRight className="rotate-180" size={20} /> Back</button>
      <GlassCard className="p-6 sm:p-8 border-[#528881]/50">
        <h2 className="text-xl text-gray-100 font-title mb-1">{title}</h2>
        <p className="text-[#528881] text-sm font-subtitle uppercase tracking-widest mb-6">{subtitle}</p>

        <div className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#528881] font-subtitle mb-2">Word List</label>
            <select value={selectedList} onChange={e => setSelectedList(e.target.value)}
              className="w-full bg-black/50 border border-[#528881]/40 text-gray-200 rounded-xl px-4 py-3 min-h-[44px] focus:outline-none focus:border-[#528881] transition-colors">
              {listOptions.map(l => <option key={l.id} value={l.id}>{l.name} ({l.words.length} words)</option>)}
            </select>
          </div>
        </div>

        <TealButton onClick={() => {
          const shuffled = [...selectedWords].sort(() => Math.random() - 0.5);
          onStart(shuffled, selected?.name || 'Unknown');
        }} disabled={selectedWords.length === 0} className="w-full py-4 text-lg mt-6">
          <Play size={20} /> {mode === 'quiz' ? 'Begin Quiz' : 'Begin Practice'}
        </TealButton>
      </GlassCard>
    </div>
  );
}

// --- WORD SEARCH ---
// --- WORD SEARCH: Grid generator with robust placement ---
const DIRECTIONS = [
  [0, 1], [0, -1], [1, 0], [-1, 0], // horizontal & vertical
  [1, 1], [1, -1], [-1, 1], [-1, -1], // diagonals
];

function generateWordSearchGrid(words: string[], gridSize: number): { grid: string[]; placedWords: string[] } {
  const maxTries = 20; // retry entire grid if placement fails
  for (let t = 0; t < maxTries; t++) {
    const grid = Array(gridSize * gridSize).fill('');
    const placed: string[] = [];
    // Sort longest first for better placement odds
    const sorted = [...words].sort((a, b) => b.length - a.length);
    let allPlaced = true;
    for (const word of sorted) {
      const upper = word.toUpperCase();
      if (upper.length > gridSize) { allPlaced = false; continue; }
      let didPlace = false;
      // Shuffle directions for variety
      const dirs = [...DIRECTIONS].sort(() => Math.random() - 0.5);
      const positions: [number, number][] = [];
      for (let r = 0; r < gridSize; r++) for (let c = 0; c < gridSize; c++) positions.push([r, c]);
      positions.sort(() => Math.random() - 0.5);
      for (const [dr, dc] of dirs) {
        if (didPlace) break;
        for (const [sr, sc] of positions) {
          if (didPlace) break;
          let canPlace = true;
          for (let i = 0; i < upper.length; i++) {
            const nr = sr + dr * i, nc = sc + dc * i;
            if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) { canPlace = false; break; }
            const cell = grid[nr * gridSize + nc];
            if (cell !== '' && cell !== upper[i]) { canPlace = false; break; }
          }
          if (canPlace) {
            for (let i = 0; i < upper.length; i++) {
              grid[(sr + dr * i) * gridSize + (sc + dc * i)] = upper[i];
            }
            placed.push(upper);
            didPlace = true;
          }
        }
      }
      if (!didPlace) allPlaced = false;
    }
    // Fill blanks
    for (let i = 0; i < grid.length; i++) {
      if (!grid[i]) grid[i] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
    if (allPlaced || t === maxTries - 1) return { grid, placedWords: placed };
  }
  // Fallback (shouldn't reach here)
  const grid = Array(gridSize * gridSize).fill('').map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)));
  return { grid, placedWords: [] };
}

// --- WORD SEARCH MENU ---
function WordSearchMenu({ hasSavedPuzzle, onNewPuzzle, onContinue, onBack }: {
  hasSavedPuzzle: boolean; onNewPuzzle: () => void; onContinue: () => void; onBack: () => void;
}) {
  return (
    <div className="max-w-md w-full mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <button onClick={onBack} className="text-[#528881] flex items-center gap-2 mb-6 hover:text-white transition-colors min-h-[44px]"><ChevronRight className="rotate-180" size={20} /> Back</button>
      <GlassCard className="p-6 sm:p-8 border-[#528881]/50 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto bg-[#528881]/20 rounded-2xl border border-[#528881]/50 flex items-center justify-center mb-4"><Search size={32} className="text-[#528881]" /></div>
          <h2 className="text-2xl text-gray-100 font-title mb-1">Word Search</h2>
          <p className="text-[#528881] text-sm font-subtitle uppercase tracking-widest">Find hidden spelling words</p>
        </div>
        <div className="flex flex-col gap-3">
          <TealButton onClick={onNewPuzzle} className="w-full py-4 text-lg"><Plus size={20} /> Create New Puzzle</TealButton>
          <TealButton outline onClick={onContinue} disabled={!hasSavedPuzzle} className="w-full py-4 text-lg"><Play size={20} /> Continue</TealButton>
          {!hasSavedPuzzle && <p className="text-gray-500 text-xs mt-1">No puzzle in progress</p>}
        </div>
      </GlassCard>
    </div>
  );
}

// --- WORD SEARCH SETUP ---
function WordSearchSetup({ lists, onStart, onBack }: {
  lists: { id: string; name: string; words: string[]; active: boolean }[];
  onStart: (words: string[], difficulty: string, listName: string, fullPool: string[]) => void;
  onBack: () => void;
}) {
  const allDictWords = Object.keys(DICTIONARY);
  const listOptions = [
    { id: '__active', name: 'Active Lists', words: lists.filter(l => l.active).flatMap(l => l.words) },
    { id: '__all', name: 'All Dictionary Words', words: allDictWords },
    ...lists.map(l => ({ id: l.id, name: l.name, words: l.words })),
  ].filter(l => l.words.length > 0);
  const [selectedList, setSelectedList] = useState(listOptions[0]?.id || '');
  const [difficulty, setDifficulty] = useState<'Regular' | 'Challenge'>('Regular');

  const selectedWords = listOptions.find(l => l.id === selectedList)?.words || [];
  const wordCount = difficulty === 'Regular' ? 10 : 12;

  return (
    <div className="max-w-md w-full mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <button onClick={onBack} className="text-[#528881] flex items-center gap-2 mb-6 hover:text-white transition-colors min-h-[44px]"><ChevronRight className="rotate-180" size={20} /> Back</button>
      <GlassCard className="p-6 sm:p-8 border-[#528881]/50">
        <h2 className="text-xl text-gray-100 font-title mb-1">New Puzzle</h2>
        <p className="text-[#528881] text-sm font-subtitle uppercase tracking-widest mb-6">Choose your words and difficulty</p>

        <div className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#528881] font-subtitle mb-2">Word List</label>
            <select value={selectedList} onChange={e => setSelectedList(e.target.value)}
              className="w-full bg-black/50 border border-[#528881]/40 text-gray-200 rounded-xl px-4 py-3 min-h-[44px] focus:outline-none focus:border-[#528881] transition-colors">
              {listOptions.map(l => <option key={l.id} value={l.id}>{l.name} ({l.words.length} words)</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#528881] font-subtitle mb-2">Difficulty</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)}
              className="w-full bg-black/50 border border-[#528881]/40 text-gray-200 rounded-xl px-4 py-3 min-h-[44px] focus:outline-none focus:border-[#528881] transition-colors">
              <option value="Regular">Regular (10 words, 12×12 grid)</option>
              <option value="Challenge">Challenge (12 words, 16×16 grid)</option>
            </select>
          </div>
        </div>

        <TealButton onClick={() => {
          const shuffled = [...selectedWords].sort(() => Math.random() - 0.5);
          const maxLen = difficulty === 'Regular' ? 12 : 16;
          const usable = shuffled.filter(w => w.length <= maxLen);
          const ln = listOptions.find(l => l.id === selectedList)?.name || 'Word Search';
          const fullPool = selectedWords.filter(w => w.length <= maxLen);
          onStart(usable.slice(0, wordCount), difficulty, ln, fullPool);
        }} disabled={selectedWords.length === 0} className="w-full py-4 text-lg mt-6">
          <Play size={20} /> Start Puzzle
        </TealButton>
      </GlassCard>
    </div>
  );
}

// --- WORD SEARCH PUZZLE ---
function WordSearchPuzzle({ initialWords, difficulty, onBack, onRemix, listName, userEmail, fullWordPool }: {
  initialWords: string[]; difficulty: string; onBack: () => void; onRemix: () => void;
  listName?: string; userEmail?: string; fullWordPool?: string[];
}) {
  const gridSize = difficulty === 'Challenge' ? 16 : 12;
  const wordCount = difficulty === 'Challenge' ? 12 : 10;
  const [currentWords, setCurrentWords] = useState<string[]>(initialWords);
  const [puzzleKey, setPuzzleKey] = useState(0);
  const [gridData, setGridData] = useState<{ grid: string[]; placedWords: string[] }>({ grid: [], placedWords: [] });
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selection, setSelection] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lines, setLines] = useState<{start: number; end: number}[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const [remixes, setRemixes] = useState(0);
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    const result = generateWordSearchGrid(currentWords, gridSize);
    setGridData(result);
    setFoundWords([]);
    setLines([]);
    setSelection([]);
  }, [puzzleKey, currentWords.join(','), gridSize]);

  const { grid, placedWords } = gridData;

  const handleRemix = () => {
    // Pick new random words from the full pool if available
    if (fullWordPool && fullWordPool.length > 0) {
      const maxLen = gridSize;
      const usable = [...fullWordPool].filter(w => w.length <= maxLen).sort(() => Math.random() - 0.5);
      setCurrentWords(usable.slice(0, wordCount));
    }
    setPuzzleKey(k => k + 1);
    setRemixes(r => r + 1);
    hasLoggedRef.current = false;
  };

  // Log activity when all words are found
  useEffect(() => {
    if (foundWords.length === gridData.placedWords.length && gridData.placedWords.length > 0 && !hasLoggedRef.current && userEmail) {
      hasLoggedRef.current = true;
      logActivity({
        type: 'wordsearch', date: new Date().toISOString(), listName: listName || 'Word Search',
        score: foundWords.length, total: gridData.placedWords.length, pct: 100, restarts: remixes, userEmail,
      }).catch(() => {});
    }
  }, [foundWords, gridData.placedWords]);

  const getIdx = (e: React.MouseEvent | React.TouchEvent) => {
    if (!gridRef.current) return -1;
    const rect = gridRef.current.getBoundingClientRect();
    let cx, cy;
    if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; } else { cx = (e as React.MouseEvent).clientX; cy = (e as React.MouseEvent).clientY; }
    const col = Math.floor((cx - rect.left) / (rect.width / gridSize)), row = Math.floor((cy - rect.top) / (rect.height / gridSize));
    return (col >= 0 && col < gridSize && row >= 0 && row < gridSize) ? row * gridSize + col : -1;
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => { const i = getIdx(e); if (i !== -1) { setIsDragging(true); setSelection([i]); } };
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const idx = getIdx(e);
    if (idx !== -1 && selection[0] !== undefined) {
      const sR = Math.floor(selection[0] / gridSize), sC = selection[0] % gridSize, eR = Math.floor(idx / gridSize), eC = idx % gridSize;
      const rD = eR - sR, cD = eC - sC;
      if (rD === 0 || cD === 0 || Math.abs(rD) === Math.abs(cD)) {
        const steps = Math.max(Math.abs(rD), Math.abs(cD)), rS = rD === 0 ? 0 : rD / steps, cS = cD === 0 ? 0 : cD / steps;
        setSelection(Array.from({ length: steps + 1 }, (_, i) => (sR + i * rS) * gridSize + (sC + i * cS)));
      }
    }
  };
  const handleEnd = () => {
    setIsDragging(false);
    if (selection.length > 1) {
      const sw = selection.map(i => grid[i]).join(''), rw = sw.split('').reverse().join('');
      if (placedWords.includes(sw) && !foundWords.includes(sw)) { setFoundWords([...foundWords, sw]); setLines([...lines, {start: selection[0], end: selection[selection.length-1]}]); }
      else if (placedWords.includes(rw) && !foundWords.includes(rw)) { setFoundWords([...foundWords, rw]); setLines([...lines, {start: selection[selection.length-1], end: selection[0]}]); }
    }
    setSelection([]);
  };

  const colClass = gridSize === 16 ? 'grid-cols-[repeat(16,1fr)]' : 'grid-cols-[repeat(12,1fr)]';
  const cellPct = (100 / gridSize);

  return (
    <div className="max-w-xl w-full mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <button onClick={onBack} className="text-[#528881] flex items-center gap-2 mb-6 hover:text-white transition-colors min-h-[44px]"><ChevronRight className="rotate-180" size={20} /> Back</button>
      <GlassCard className="p-4 sm:p-6 border-[#528881]/50">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-xl text-gray-100 font-title">Word Search</h2>
            <p className="text-[#528881] text-sm font-subtitle uppercase tracking-widest">{difficulty} · {placedWords.length} words</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-[#528881] bg-[#528881]/10 px-3 py-1 rounded-full border border-[#528881]/30">{foundWords.length}/{placedWords.length}</div>
            <button onClick={handleRemix} title="Remix puzzle" className="p-2.5 rounded-full border border-[#528881]/40 text-[#528881] hover:bg-[#528881]/20 hover:text-white transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"><RefreshCw size={18} /></button>
          </div>
        </div>
        <div ref={gridRef} className={`grid ${colClass} gap-0.5 sm:gap-1 mb-6 bg-black/40 p-2 sm:p-3 rounded-xl border border-[#528881]/30 relative touch-none select-none`}
          onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
          onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}>
          {grid.map((char, i) => (
            <div key={i} className={`aspect-square flex items-center justify-center font-medium ${gridSize === 16 ? 'text-[9px] sm:text-xs' : 'text-[10px] sm:text-sm'} rounded-md transition-colors z-10 ${selection.includes(i) ? 'bg-[#528881] text-white shadow-[0_0_10px_rgba(82,136,129,0.8)]' : 'text-gray-300'}`}>{char}</div>
          ))}
          {lines.map((line, i) => {
            const sR = Math.floor(line.start / gridSize), sC = line.start % gridSize, eR = Math.floor(line.end / gridSize), eC = line.end % gridSize;
            return <svg key={i} className="absolute inset-0 w-full h-full pointer-events-none z-0"><line x1={`${(sC+.5)*cellPct}%`} y1={`${(sR+.5)*cellPct}%`} x2={`${(eC+.5)*cellPct}%`} y2={`${(eR+.5)*cellPct}%`} stroke="#528881" strokeWidth={gridSize === 16 ? '12' : '16'} strokeLinecap="round" opacity="0.4"/></svg>;
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          {placedWords.map((w, i) => <span key={i} className={`text-sm px-3 py-1.5 rounded-full border transition-all ${foundWords.includes(w) ? 'border-[#528881] text-[#528881] bg-[#528881]/20 line-through decoration-2' : 'border-[#528881]/40 text-gray-400 bg-black/30'}`}>{w}</span>)}
        </div>
        {foundWords.length === placedWords.length && placedWords.length > 0 && (
          <div className="text-center mt-6 animate-in fade-in space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#528881]/20 border border-[#528881] text-[#528881] px-6 py-3 rounded-xl"><Trophy size={20} /> All words found!</div>
            <div className="flex gap-3 justify-center">
              <TealButton onClick={handleRemix} className="py-2 px-4 text-sm"><RefreshCw size={16} /> New Puzzle</TealButton>
              <TealButton outline onClick={onBack} className="py-2 px-4 text-sm">Back to Menu</TealButton>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// --- WORD DETAIL MODAL ---
function WordDetailModal({ word, onClose }: { word: string | null; onClose: () => void }) {
  if (!word) return null;
  const d = getWordDetails(word);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <GlassCard className="w-full max-w-md p-0 overflow-hidden relative border-[#528881] shadow-[0_0_40px_rgba(82,136,129,0.2)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full bg-black/40 hover:bg-[#528881]/40 transition-colors z-10 border border-[#528881]/20 min-w-[44px] min-h-[44px] flex items-center justify-center"><X size={20} /></button>
        <div className="p-6 sm:p-8 pb-4 border-b border-[#528881]/30 bg-gradient-to-b from-[#528881]/20 to-transparent">
          <h2 className="text-3xl sm:text-4xl font-title text-white mb-3">{d.word}</h2>
          <div className="flex items-center gap-3 text-[#528881]">
            <span className="font-mono text-sm bg-black/30 px-2 py-1 rounded border border-[#528881]/30">{d.pron || '/.../'}</span>
            <HelperBtn icon={Volume2} title="Pronounce" onClick={() => speakText(d.word)} />
          </div>
        </div>
        <div className="p-6 sm:p-8 space-y-5 bg-black/40 max-h-[60vh] overflow-y-auto">
          {d.def && <div><h3 className="text-xs uppercase tracking-widest text-[#528881] font-subtitle mb-1">Definition</h3><p className="text-gray-200 leading-relaxed">{d.def}</p></div>}
          {d.ex && <div><h3 className="text-xs uppercase tracking-widest text-[#528881] font-subtitle mb-1">Example</h3><p className="text-gray-300 italic border-l-2 border-[#528881]/50 pl-3 py-1">"{d.ex}"</p></div>}
          {d.tip && <div className="bg-black/50 p-4 rounded-lg border border-[#528881]/40"><div className="flex items-center gap-2 mb-1 text-[#528881]"><Info size={16} /><span className="font-medium text-sm">Memory Trick</span></div><p className="text-gray-300 text-sm leading-relaxed">{d.tip}</p></div>}
          <div className="flex flex-wrap gap-3">
            {d.syn && <div className="flex-1 bg-black/50 p-3 rounded-xl border border-[#528881]/40"><span className="block text-[10px] uppercase text-[#528881] mb-1 font-subtitle">Synonyms</span><span className="text-sm text-gray-300">{d.syn}</span></div>}
            {d.slang && <div className="flex-1 bg-[#886451]/20 p-3 rounded-xl border border-[#886451]/50"><span className="block text-[10px] uppercase text-[#886451] mb-1 font-subtitle">Modern Usage</span><span className="text-sm text-gray-300">{d.slang}</span></div>}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// --- MISSED WORDS VIEW ---
function MissedWordsView({ missedWords, onStartQuiz, onSelectWord, onBack, onClearAll }: {
  missedWords: string[]; onStartQuiz: (w: string[]) => void; onSelectWord: (w: string) => void; onBack: () => void; onClearAll: () => void;
}) {
  return (
    <div className="max-w-2xl w-full mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <button onClick={onBack} className="text-[#528881] flex items-center gap-2 mb-6 hover:text-white transition-colors min-h-[44px]"><ChevronRight className="rotate-180" size={20} /> Back</button>
      <GlassCard className="p-6 sm:p-8 border-[#528881]/50">
        <div className="flex items-center justify-between mb-6 border-b border-[#528881]/40 pb-4 flex-wrap gap-3">
          <div><h2 className="text-2xl text-gray-100 font-title">Missed Words</h2><p className="text-[#528881] text-sm font-subtitle uppercase tracking-widest mt-1">Review and practice</p></div>
          <div className="flex gap-2">
            {missedWords.length > 0 && <TealButton onClick={() => onStartQuiz(missedWords)} className="py-2 px-4 text-sm"><Play size={16} /> Practice These</TealButton>}
            {missedWords.length > 0 && <button onClick={onClearAll} className="py-2 px-3 text-sm rounded-xl border border-[#885159]/40 text-[#885159] hover:bg-[#885159]/10 transition-all min-h-[44px] flex items-center gap-1"><Trash2 size={14} /> Clear All</button>}
          </div>
        </div>
        {missedWords.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-[#528881]/10 rounded-full flex items-center justify-center border border-[#528881]/30 mb-4"><Check size={32} className="text-[#528881]" /></div>
            <p className="text-gray-300 text-lg">No missed words yet.</p><p className="text-[#528881] text-sm mt-2">Great job! Keep up the good work.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {missedWords.map((w, i) => <button key={i} onClick={() => onSelectWord(w)} className="px-4 py-2.5 bg-black/50 border border-[#885159]/60 text-gray-200 rounded-xl text-base hover:border-[#885159] hover:bg-[#885159]/20 transition-all min-h-[44px]">{w}</button>)}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// --- LIST MANAGER ---
function ListManager({ lists, setLists, onCreateList, onBack, onStartQuiz, onStartQuiet }: {
  lists: any[]; setLists: (l: any[]) => void; onCreateList: () => void; onBack: () => void;
  onStartQuiz: (w: string[]) => void; onStartQuiet: (w: string[]) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const deleteList = (id: string) => { setLists(lists.filter(l => l.id !== id)); if (expandedId === id) setExpandedId(null); };
  const toggleActive = (id: string) => { setLists(lists.map(l => l.id === id ? { ...l, active: !l.active } : l)); };

  return (
    <div className="max-w-2xl w-full mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-[#528881] flex items-center gap-2 hover:text-white transition-colors min-h-[44px]"><ChevronRight className="rotate-180" size={20} /> Back</button>
        <TealButton onClick={onCreateList} className="py-2 px-4 text-sm"><Plus size={16}/> New List</TealButton>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4 border-b border-[#528881]/40 pb-3">
          <div className="w-2 h-2 rounded-full bg-[#528881] shadow-[0_0_8px_#528881]"></div>
          <h2 className="text-xl text-gray-100 font-medium font-title">MyLists</h2>
          <span className="text-[#528881] text-sm">({lists.length})</span>
        </div>
        {lists.length === 0 && <div className="text-center py-12 text-gray-400"><List size={40} className="mx-auto mb-4 text-[#528881]/50" /><p>No lists yet. Create one to get started!</p></div>}
        {lists.map(list => (
          <GlassCard key={list.id} className={`border-[#528881]/40 transition-all ${expandedId === list.id ? 'border-[#528881]/80' : ''}`}>
            <button onClick={() => setExpandedId(expandedId === list.id ? null : list.id)} className="w-full p-5 flex items-center justify-between text-left min-h-[60px]">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${list.active ? 'bg-[#528881] shadow-[0_0_6px_#528881]' : 'bg-gray-600'}`}></div>
                <div><h3 className="text-white text-lg font-medium">{list.name}</h3><p className="text-[#528881] text-sm">{list.words.length} words {list.active ? '• Active' : '• Inactive'}</p></div>
              </div>
              <ChevronDown size={20} className={`text-[#528881] transition-transform ${expandedId === list.id ? 'rotate-180' : ''}`} />
            </button>
            {expandedId === list.id && (
              <div className="px-5 pb-5 border-t border-[#528881]/20 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-wrap gap-2 mb-5">
                  {list.words.map((w: string, i: number) => <span key={i} className="px-3 py-1.5 bg-black/40 border border-[#528881]/30 text-gray-300 rounded-lg text-sm">{w}</span>)}
                </div>
                <div className="flex flex-wrap gap-2">
                  <TealButton onClick={() => onStartQuiz(list.words)} className="py-2 px-4 text-sm flex-1 min-w-[100px]"><Play size={16} /> Quiz</TealButton>
                  <TealButton outline onClick={() => onStartQuiet(list.words)} className="py-2 px-4 text-sm flex-1 min-w-[100px]"><BookOpen size={16} /> Quiet</TealButton>
                  <button onClick={() => toggleActive(list.id)}
                    className={`py-2 px-4 text-sm rounded-xl border transition-all min-h-[44px] ${list.active ? 'border-[#528881]/60 text-[#528881] hover:bg-[#528881]/10' : 'border-gray-600 text-gray-500 hover:text-[#528881]'}`}>
                    {list.active ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => deleteList(list.id)} className="py-2 px-3 text-sm rounded-xl border border-[#885159]/40 text-[#885159] hover:bg-[#885159]/10 transition-all min-h-[44px]"><Trash2 size={16} /></button>
                </div>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// --- CREATE LIST FLOW ---
function CreateListFlow({ lists, setLists, onDone, onBack }: {
  lists: any[]; setLists: (l: any[]) => void; onDone: () => void; onBack: () => void;
}) {
  const [step, setStep] = useState<'choose' | 'autoConfig' | 'autoSelect' | 'editList'>('choose');
  const [category, setCategory] = useState('Everyday Words');
  const [difficulty, setDifficulty] = useState('Medium');
  const [generatedWords, setGeneratedWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [listName, setListName] = useState('');
  const [customInput, setCustomInput] = useState('');

  const handleAutoGenerate = () => {
    const bank = WORD_BANKS[category]?.[difficulty] || WORD_BANKS['Everyday Words']['Medium'];
    setGeneratedWords([...bank].sort(() => Math.random() - 0.5).slice(0, 20));
    setStep('autoSelect');
  };

  const toggleWord = (w: string) => { setSelectedWords(s => s.includes(w) ? s.filter(x => x !== w) : [...s, w]); };
  const goToEditList = () => setStep('editList');
  const goToEditListDirect = () => { setSelectedWords([]); setStep('editList'); };

  const addCustomWord = (e: any) => {
    e.preventDefault();
    const w = customInput.trim().toLowerCase();
    if (w && !selectedWords.includes(w)) { setSelectedWords([...selectedWords, w]); setCustomInput(''); }
  };

  const saveList = () => {
    if (selectedWords.length === 0 || !listName.trim()) return;
    setLists([...lists, { id: Date.now().toString(), name: listName.trim(), words: selectedWords, active: true }]);
    onDone();
  };

  const handleBack = () => {
    if (step === 'editList' && generatedWords.length > 0) setStep('autoSelect');
    else if (step === 'autoSelect') setStep('autoConfig');
    else if (step === 'autoConfig') setStep('choose');
    else if (step === 'editList') setStep('choose');
    else onBack();
  };

  return (
    <div className="max-w-xl w-full mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <button onClick={step === 'choose' ? onBack : handleBack} className="text-[#528881] flex items-center gap-2 mb-6 hover:text-white transition-colors min-h-[44px]">
        <ChevronRight className="rotate-180" size={20} /> {step === 'choose' ? 'Cancel' : 'Back'}
      </button>
      <GlassCard className="p-6 sm:p-8 border-[#528881]/50">
        <div className="text-center mb-6 border-b border-[#528881]/30 pb-4">
          <h2 className="text-2xl sm:text-3xl text-gray-100 mb-1 font-title">Create New List</h2>
          <p className="text-[#528881] text-sm font-subtitle uppercase tracking-widest">
            {step === 'choose' ? 'How would you like to build it?' : step === 'autoConfig' ? 'Choose category & difficulty' : step === 'autoSelect' ? 'Select your words' : 'Finalize your list'}
          </p>
        </div>

        {step === 'choose' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => setStep('autoConfig')} className="p-6 bg-black/40 border border-[#528881]/40 rounded-xl hover:border-[#528881] hover:bg-[#528881]/20 transition-all text-left group shadow-inner min-h-[140px]">
              <RefreshCw size={28} className="text-[#528881] mb-4 group-hover:rotate-180 transition-transform duration-500" />
              <h3 className="text-xl text-white mb-2 font-medium">Auto-Generate</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Pick a category and difficulty. We'll suggest words for you to choose from.</p>
            </button>
            <button onClick={goToEditListDirect} className="p-6 bg-black/40 border border-[#528881]/40 rounded-xl hover:border-[#528881] hover:bg-[#528881]/20 transition-all text-left group shadow-inner min-h-[140px]">
              <Edit3 size={28} className="text-[#528881] mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl text-white mb-2 font-medium">MyList</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Start blank and type in your own spelling words.</p>
            </button>
          </div>
        )}

        {step === 'autoConfig' && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <label className="block text-[#528881] text-sm mb-2 font-subtitle uppercase">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-black/50 border border-[#528881]/50 rounded-xl p-4 text-white focus:outline-none focus:border-[#528881] appearance-none text-lg min-h-[52px]">
                {Object.keys(WORD_BANKS).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[#528881] text-sm mb-2 font-subtitle uppercase">Difficulty</label>
              <div className="flex gap-2">
                {['Easy', 'Medium', 'Hard'].map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`flex-1 py-3 rounded-xl border transition-all min-h-[48px] ${difficulty === d ? 'bg-[#528881]/20 border-[#528881] text-white shadow-[0_0_10px_rgba(82,136,129,0.3)]' : 'bg-black/30 border-[#528881]/30 text-gray-400 hover:border-[#528881]/60'}`}>{d}</button>
                ))}
              </div>
            </div>
            <TealButton onClick={handleAutoGenerate} className="w-full mt-4 py-4 text-lg">Generate Words</TealButton>
          </div>
        )}

        {step === 'autoSelect' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">{selectedWords.length} selected</span>
              <button onClick={() => setSelectedWords(selectedWords.length === generatedWords.length ? [] : [...generatedWords])}
                className="text-[#528881] text-sm hover:text-white transition-colors min-h-[44px] px-2">
                {selectedWords.length === generatedWords.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-1 bg-black/20 rounded-xl border border-[#528881]/20 p-2">
              {generatedWords.map(word => {
                const sel = selectedWords.includes(word);
                return (
                  <button key={word} onClick={() => toggleWord(word)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left min-h-[48px] ${sel ? 'bg-[#528881]/20 text-white' : 'text-gray-400 hover:bg-[#528881]/10 hover:text-gray-200'}`}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel ? 'bg-[#528881] border-[#528881]' : 'border-[#528881]/40'}`}>
                      {sel && <Check size={14} className="text-white" />}
                    </div>
                    <span className="text-lg">{word}</span>
                  </button>
                );
              })}
            </div>
            <TealButton onClick={goToEditList} disabled={selectedWords.length === 0} className="w-full py-4 text-lg">
              Continue with {selectedWords.length} words <ArrowRight size={20} />
            </TealButton>
          </div>
        )}

        {step === 'editList' && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <label className="block text-[#528881] text-sm mb-2 font-subtitle uppercase">Add Words</label>
              <form onSubmit={addCustomWord} className="flex gap-2">
                <input type="text" value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder="Type a word and press add..."
                  className="flex-1 bg-black/50 border border-[#528881]/50 rounded-xl p-3 sm:p-4 text-white focus:outline-none focus:border-[#528881] min-h-[48px]"
                  autoCapitalize="off" autoCorrect="off" spellCheck={false} />
                <TealButton type="submit" className="px-4 sm:px-6"><Plus size={20}/></TealButton>
              </form>
            </div>
            {selectedWords.length > 0 ? (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[#528881] text-sm font-subtitle uppercase">Your Words</label>
                  <span className="text-xs text-gray-400">{selectedWords.length} words</span>
                </div>
                <div className="max-h-[250px] overflow-y-auto space-y-1 bg-black/20 rounded-xl border border-[#528881]/20 p-2">
                  {selectedWords.map(word => (
                    <div key={word} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-black/30 hover:bg-[#528881]/10 transition-all min-h-[44px]">
                      <span className="text-gray-200 text-lg">{word}</span>
                      <button onClick={() => setSelectedWords(s => s.filter(w => w !== word))} className="text-[#885159] hover:text-red-400 p-1 min-w-[32px] min-h-[32px] flex items-center justify-center"><X size={16}/></button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500"><List size={32} className="mx-auto mb-2 opacity-50" /><p>Add some words to your list above</p></div>
            )}
            <div>
              <label className="block text-[#528881] text-sm mb-2 font-subtitle uppercase">List Name</label>
              <input type="text" value={listName} onChange={e => setListName(e.target.value)} placeholder="e.g., Weekly Spelling, Challenge Words..."
                className="w-full bg-black/50 border border-[#528881]/50 rounded-xl p-3 sm:p-4 text-white focus:outline-none focus:border-[#528881] min-h-[48px]" />
            </div>
            <TealButton onClick={saveList} disabled={selectedWords.length === 0 || !listName.trim()} className="w-full py-4 text-lg mt-2">Save List</TealButton>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// --- PARENT DASHBOARD ---
function ParentDashboard({ onBack }: { onBack: () => void }) {
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState<string | null | undefined>(undefined); // undefined = loading
  const [authenticated, setAuthenticated] = useState(false);
  const [settingPin, setSettingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });

  // Load saved PIN on mount
  useEffect(() => {
    getParentPin().then(p => setSavedPin(p)).catch(() => setSavedPin(null));
  }, []);

  // Load activities once authenticated
  useEffect(() => {
    if (authenticated) {
      setLoading(true);
      fetchActivity(200).then(a => { setActivities(a); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [authenticated]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === savedPin) { setAuthenticated(true); setPinError(''); }
    else setPinError('Incorrect PIN');
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) { setPinError('PIN must be 4 digits'); return; }
    if (newPin !== confirmPin) { setPinError('PINs don\'t match'); return; }
    await saveParentPin(newPin);
    setSavedPin(newPin);
    setAuthenticated(true);
    setSettingPin(false);
    setPinError('');
  };

  // Build calendar data — monthly view
  const getDayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = new Date();

  const activityByDay: Record<string, ActivityEntry[]> = {};
  activities.forEach(a => {
    const ad = new Date(a.date);
    const key = getDayKey(ad);
    if (!activityByDay[key]) activityByDay[key] = [];
    activityByDay[key].push(a);
  });

  const quizDays = new Set<string>();
  activities.forEach(a => {
    if (a.type === 'quiz' || a.type === 'quiet') { const ad = new Date(a.date); quizDays.add(getDayKey(ad)); }
  });

  // Current streak
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    if (quizDays.has(getDayKey(d))) streak++;
    else break;
  }

  // Monthly calendar helpers
  const calYear = calendarMonth.getFullYear();
  const calMon = calendarMonth.getMonth();
  const daysInMonth = new Date(calYear, calMon + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMon, 1).getDay(); // 0=Sun
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => new Date(calYear, calMon, i + 1));
  const practiceCountThisMonth = calendarDays.filter(d => quizDays.has(getDayKey(d))).length;

  const prevMonth = () => setCalendarMonth(new Date(calYear, calMon - 1, 1));
  const nextMonth = () => setCalendarMonth(new Date(calYear, calMon + 1, 1));

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${monthNames[d.getMonth()]} ${d.getDate()}`;
  };

  const typeLabel = (t: string) => t === 'quiz' ? 'Quiz' : t === 'quiet' ? 'Quiet Practice' : 'Word Search';
  const typeColor = (t: string) => t === 'quiz' ? '#528881' : t === 'quiet' ? '#645188' : '#886451';

  // Loading PIN state
  if (savedPin === undefined) {
    return (
      <div className="max-w-md w-full mx-auto flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#528881] border-t-transparent animate-spin" />
      </div>
    );
  }

  // No PIN set yet — setup flow
  if (savedPin === null || settingPin) {
    return (
      <div className="max-w-md w-full mx-auto animate-in slide-in-from-bottom-4 duration-300">
        <button onClick={onBack} className="text-[#528881] flex items-center gap-2 mb-6 hover:text-white transition-colors min-h-[44px]"><ChevronRight className="rotate-180" size={20} /> Back</button>
        <GlassCard className="p-6 sm:p-8 border-[#528881]/50">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto bg-[#528881]/20 rounded-2xl border border-[#528881]/50 flex items-center justify-center mb-4"><Shield size={32} className="text-[#528881]" /></div>
            <h2 className="text-2xl text-gray-100 font-title mb-1">{settingPin ? 'Change PIN' : 'Set Parent PIN'}</h2>
            <p className="text-[#528881] text-sm font-subtitle uppercase tracking-widest">{settingPin ? 'Enter a new 4-digit PIN' : 'Create a 4-digit PIN to protect this dashboard'}</p>
          </div>
          <form onSubmit={handleSetPin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#528881] font-subtitle mb-2">New PIN</label>
              <input type="password" inputMode="numeric" maxLength={4} value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-black/50 border border-[#528881]/50 rounded-xl px-4 py-4 text-center text-3xl text-gray-100 tracking-[0.5em] focus:outline-none focus:border-[#528881] focus:ring-1 focus:ring-[#528881]"
                placeholder="• • • •" autoComplete="off" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#528881] font-subtitle mb-2">Confirm PIN</label>
              <input type="password" inputMode="numeric" maxLength={4} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-black/50 border border-[#528881]/50 rounded-xl px-4 py-4 text-center text-3xl text-gray-100 tracking-[0.5em] focus:outline-none focus:border-[#528881] focus:ring-1 focus:ring-[#528881]"
                placeholder="• • • •" autoComplete="off" />
            </div>
            {pinError && <p className="text-[#885159] text-sm text-center">{pinError}</p>}
            <TealButton type="submit" className="w-full py-4 text-lg">Save PIN</TealButton>
          </form>
        </GlassCard>
      </div>
    );
  }

  // PIN gate
  if (!authenticated) {
    return (
      <div className="max-w-md w-full mx-auto animate-in slide-in-from-bottom-4 duration-300">
        <button onClick={onBack} className="text-[#528881] flex items-center gap-2 mb-6 hover:text-white transition-colors min-h-[44px]"><ChevronRight className="rotate-180" size={20} /> Back</button>
        <GlassCard className="p-6 sm:p-8 border-[#528881]/50">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto bg-[#528881]/20 rounded-2xl border border-[#528881]/50 flex items-center justify-center mb-4"><Shield size={32} className="text-[#528881]" /></div>
            <h2 className="text-2xl text-gray-100 font-title mb-1">Parent Dashboard</h2>
            <p className="text-[#528881] text-sm font-subtitle uppercase tracking-widest">Enter your PIN to continue</p>
          </div>
          <form onSubmit={handlePinSubmit}>
            <div className="relative">
              <input type={showPin ? 'text' : 'password'} inputMode="numeric" maxLength={4} value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setPinError(''); }}
                className="w-full bg-black/50 border border-[#528881]/50 rounded-xl px-4 py-4 text-center text-3xl text-gray-100 tracking-[0.5em] focus:outline-none focus:border-[#528881] focus:ring-1 focus:ring-[#528881]"
                placeholder="• • • •" autoComplete="off" autoFocus />
              <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#528881] p-2">
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {pinError && <p className="text-[#885159] text-sm text-center mt-3">{pinError}</p>}
            <TealButton type="submit" disabled={pin.length !== 4} className="w-full py-4 text-lg mt-4">Unlock</TealButton>
          </form>
        </GlassCard>
      </div>
    );
  }

  // Authenticated — show dashboard
  return (
    <div className="max-w-2xl w-full mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-[#528881] flex items-center gap-2 hover:text-white transition-colors min-h-[44px]"><ChevronRight className="rotate-180" size={20} /> Back</button>
        <button onClick={() => { setSettingPin(true); setNewPin(''); setConfirmPin(''); setPinError(''); setAuthenticated(false); }}
          className="text-gray-500 hover:text-[#528881] text-xs flex items-center gap-1 min-h-[36px] px-2"><Settings size={14} /> Change PIN</button>
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-title text-3xl text-gray-100 mb-1">Parent Dashboard</h1>
        <p className="font-subtitle text-[#528881] text-xs tracking-widest uppercase">Activity Tracker</p>
      </div>

      {/* Streak + Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <GlassCard className="p-4 text-center border-[#528881]/50">
          <Flame size={24} className="mx-auto text-orange-400 mb-1" />
          <p className="text-2xl font-bold text-gray-100">{streak}</p>
          <p className="text-xs text-[#528881] font-subtitle uppercase">Day Streak</p>
        </GlassCard>
        <GlassCard className="p-4 text-center border-[#528881]/50">
          <Target size={24} className="mx-auto text-[#528881] mb-1" />
          <p className="text-2xl font-bold text-gray-100">{activities.filter(a => a.type === 'quiz' || a.type === 'quiet').length}</p>
          <p className="text-xs text-[#528881] font-subtitle uppercase">Quizzes</p>
        </GlassCard>
        <GlassCard className="p-4 text-center border-[#528881]/50">
          <TrendingUp size={24} className="mx-auto text-[#645188] mb-1" />
          <p className="text-2xl font-bold text-gray-100">
            {activities.filter(a => a.type === 'quiz' || a.type === 'quiet').length > 0
              ? Math.round(activities.filter(a => a.type === 'quiz' || a.type === 'quiet').reduce((s, a) => s + a.pct, 0) / activities.filter(a => a.type === 'quiz' || a.type === 'quiet').length)
              : 0}%
          </p>
          <p className="text-xs text-[#528881] font-subtitle uppercase">Avg Score</p>
        </GlassCard>
      </div>

      {/* Monthly calendar */}
      <GlassCard className="p-5 mb-6 border-[#528881]/50">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[#528881]/20 text-gray-400 hover:text-white transition-colors"><ChevronLeft size={18} /></button>
          <h3 className="text-sm text-gray-100 font-medium flex items-center gap-2">
            <Calendar size={16} className="text-[#528881]" />
            {fullMonthNames[calMon]} {calYear}
          </h3>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[#528881]/20 text-gray-400 hover:text-white transition-colors"><ChevronRight size={18} /></button>
        </div>
        <div className="flex items-center justify-between mb-2 px-0.5">
          <span className="text-xs text-gray-500">{practiceCountThisMonth} / {daysInMonth} days practiced</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {dayNames.map((dn, i) => (
            <div key={i} className="text-center text-[9px] text-[#528881] font-bold uppercase tracking-wider pb-1">{dn}</div>
          ))}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {calendarDays.map((d, i) => {
            const key = getDayKey(d);
            const hasQuiz = quizDays.has(key);
            const hasWs = activityByDay[key]?.some(a => a.type === 'wordsearch');
            const isToday = key === getDayKey(today);
            const isFuture = d > today && !isToday;
            return (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className={`w-8 h-8 rounded-md flex flex-col items-center justify-center text-[10px] font-bold transition-all
                  ${hasQuiz ? 'bg-[#528881] text-white shadow-[0_0_8px_rgba(82,136,129,0.5)]' :
                    isToday ? 'border-2 border-[#528881]/60 text-gray-400' :
                    isFuture ? 'bg-black/10 border border-[#528881]/8 text-gray-700/40' :
                    'bg-black/30 border border-[#528881]/15 text-gray-700'}`}>
                  <span className="text-[9px] leading-none">{d.getDate()}</span>
                  {hasQuiz ? <span className="text-[8px] leading-none">✓</span> : hasWs ? <span className="text-[8px] leading-none">★</span> : null}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#528881]/20 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#528881] inline-block"></span> Quiz/Practice</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-black/30 border border-[#528881]/15 inline-block text-center leading-3">★</span> Word Search</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm border-2 border-[#528881]/60 inline-block"></span> Today</span>
        </div>
      </GlassCard>

      {/* Activity Log */}
      <GlassCard className="p-5 border-[#528881]/50">
        <h3 className="text-sm text-gray-100 font-medium flex items-center gap-2 mb-4"><Clock size={16} className="text-[#528881]" /> Activity Log</h3>
        {loading ? (
          <div className="text-center py-8"><div className="w-6 h-6 rounded-full border-2 border-[#528881] border-t-transparent animate-spin mx-auto" /></div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500"><p>No activity logged yet.</p><p className="text-xs mt-1 text-[#528881]">Completed quizzes and practices will appear here.</p></div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {activities.map((a, i) => (
              <div key={a.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-[#528881]/20 hover:border-[#528881]/40 transition-all">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: typeColor(a.type) }}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-200 font-medium">{typeLabel(a.type)}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#528881]/30 text-[#528881]">{a.listName}</span>
                    {a.type === 'wordsearch' && <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#886451]/40 text-[#886451]">Bonus</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{formatDate(a.date)} · {formatTime(a.date)}</span>
                    {a.restarts > 0 && <span className="text-[#885159]">{a.restarts} restart{a.restarts > 1 ? 's' : ''}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-lg font-bold ${a.pct >= 80 ? 'text-[#528881]' : a.pct >= 50 ? 'text-[#886451]' : 'text-[#885159]'}`}>{a.pct}%</p>
                  <p className="text-[10px] text-gray-500">{a.score}/{a.total}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// --- MAIN APP ---
export default function SpellCoach() {
  // ── Auth state ──────────────────────────────────────────────────────────────
  const [authUser, setAuthUser] = useState<User | null | undefined>(undefined); // undefined = loading
  const _suppressCloudUpdate = useRef(false); // prevents echo loops
  const _suppressMissedUpdate = useRef(false); // prevents echo loops for missed words

  // Listen for login/logout
  useEffect(() => {
    const unsub = onAuthChange((user) => setAuthUser(user));
    return () => unsub();
  }, []);

  // ── App state ───────────────────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState('dashboard');
  const [lists, setLists] = useState<WordList[]>(INITIAL_LISTS);
  const [missedWords, setMissedWords] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [practiceModeWords, setPracticeModeWords] = useState<string[]>([]);
  const [practiceListName, setPracticeListName] = useState<string>('');
  const [practicingMissed, setPracticingMissed] = useState(false); // true when practicing from Missed Words
  // Word Search state
  const [wsWords, setWsWords] = useState<string[] | null>(null);
  const [wsDifficulty, setWsDifficulty] = useState<string>('Regular');
  const [wsListName, setWsListName] = useState<string>('');
  const [wsFullPool, setWsFullPool] = useState<string[]>([]); // full word pool for remix
  // Student calendar state
  const [studentActivities, setStudentActivities] = useState<ActivityEntry[]>([]);
  const [studentCalMonth, setStudentCalMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });

  // ── Firestore real-time sync ────────────────────────────────────────────────
  // Subscribe to shared lists whenever the user is logged in.
  useEffect(() => {
    if (!authUser) return;
    const unsub = subscribeLists((cloudLists) => {
      if (_suppressCloudUpdate.current) return;
      setLists(cloudLists);
    });
    return () => unsub();
  }, [authUser]);

  // Subscribe to missed words sync
  useEffect(() => {
    if (!authUser) return;
    const unsub = subscribeMissedWords((cloudWords) => {
      if (_suppressMissedUpdate.current) return;
      setMissedWords(cloudWords);
    });
    return () => unsub();
  }, [authUser]);

  // Load activity data for student calendar on dashboard
  useEffect(() => {
    if (!authUser) return;
    fetchActivity(200).then(a => setStudentActivities(a)).catch(() => {});
  }, [authUser, currentView]); // refresh when returning to dashboard

  /**
   * Use this instead of setLists whenever a list change should be saved.
   */
  const saveListsToCloud = useCallback(async (newLists: WordList[]) => {
    setLists(newLists);
    if (authUser?.email) {
      _suppressCloudUpdate.current = true;
      await pushLists(newLists, authUser.email);
      setTimeout(() => { _suppressCloudUpdate.current = false; }, 1500);
    }
  }, [authUser]);

  /**
   * Save missed words to Firestore — syncs across devices.
   */
  const saveMissedToCloud = useCallback(async (newWords: string[]) => {
    setMissedWords(newWords);
    if (authUser?.email) {
      _suppressMissedUpdate.current = true;
      await pushMissedWords(newWords, authUser.email);
      setTimeout(() => { _suppressMissedUpdate.current = false; }, 1500);
    }
  }, [authUser]);

  // ── Core navigation helpers ─────────────────────────────────────────────────
  const activeWords = lists.filter(l => l.active).flatMap(l => l.words);
  const allPracticeWords = activeWords.length > 0 ? activeWords : Object.keys(DICTIONARY);

  const startQuiz = useCallback((wordsToPractice?: string[]) => {
    setPracticeModeWords(wordsToPractice && wordsToPractice.length > 0 ? wordsToPractice : allPracticeWords);
    setPracticingMissed(false);
    setCurrentView('quiz');
  }, [allPracticeWords]);

  const startQuiet = useCallback((wordsToPractice?: string[]) => {
    setPracticeModeWords(wordsToPractice && wordsToPractice.length > 0 ? wordsToPractice : allPracticeWords);
    setPracticingMissed(false);
    setCurrentView('quiet');
  }, [allPracticeWords]);

  // Start quiz from Missed Words — marks words for removal on correct answer
  const startMissedPractice = useCallback((wordsToPractice: string[]) => {
    setPracticeModeWords(wordsToPractice);
    setPracticingMissed(true);
    setPracticeListName('Missed Words');
    setCurrentView('quiz');
  }, []);

  const goHome = useCallback(() => setCurrentView('dashboard'), []);

  const handleSignOut = async () => {
    await firebaseSignOut();
    setCurrentView('dashboard');
    setLists(INITIAL_LISTS);
    setMissedWords([]);
  };

  // Build student calendar data — monthly view
  const getDayKeyS = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = new Date();
  const studentQuizDays = new Set<string>();
  studentActivities.forEach(a => {
    if (a.type === 'quiz' || a.type === 'quiet') { const ad = new Date(a.date); studentQuizDays.add(getDayKeyS(ad)); }
  });
  let studentStreak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    if (studentQuizDays.has(getDayKeyS(d))) studentStreak++;
    else break;
  }

  // Student monthly calendar helpers
  const sCalYear = studentCalMonth.getFullYear();
  const sCalMon = studentCalMonth.getMonth();
  const sDaysInMonth = new Date(sCalYear, sCalMon + 1, 0).getDate();
  const sFirstDayOfWeek = new Date(sCalYear, sCalMon, 1).getDay();
  const sCalendarDays = Array.from({ length: sDaysInMonth }, (_, i) => new Date(sCalYear, sCalMon, i + 1));
  const sPracticeCount = sCalendarDays.filter(d => studentQuizDays.has(getDayKeyS(d))).length;
  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const sDayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Chrome speech synthesis keepalive
  useEffect(() => {
    const iv = setInterval(() => { if (window.speechSynthesis && !window.speechSynthesis.speaking) window.speechSynthesis.cancel(); }, 10000);
    return () => clearInterval(iv);
  }, []);

  // ── Auth gates ──────────────────────────────────────────────────────────────
  // Still checking auth state — show a blank dark screen to avoid flash
  if (authUser === undefined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#528881] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Not logged in — show login screen
  if (authUser === null) {
    return <Login onLogin={() => {}} />;
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-black font-body flex items-start sm:items-center justify-center p-4 sm:p-8 relative overflow-hidden selection:bg-[#528881]/40">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_#645188_0%,_#000000_80%)] opacity-90 mix-blend-screen"></div>
      <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-40"></div>

      <main className="relative z-10 w-full flex justify-center pt-4 sm:pt-0">
        {currentView === 'dashboard' && (
          <div className="flex flex-col gap-5 max-w-2xl w-full mx-auto animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center mb-2">
              <h1 className="font-title text-4xl sm:text-5xl text-gray-100 mb-2 tracking-wide drop-shadow-md">SpellCoach</h1>
              <p className="font-subtitle text-[#528881] text-xs sm:text-sm tracking-widest uppercase">Your personal spelling tutor</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <GlassCard onClick={() => setCurrentView('quizSetup')} className="p-5 sm:p-6 border-[#528881]/70 bg-gradient-to-br from-[#885159]/30 to-transparent relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#528881]/10 rounded-full blur-2xl group-hover:bg-[#528881]/20 transition-all"></div>
                <div className="flex items-center gap-4 mb-2 relative z-10">
                  <div className="p-3 bg-[#528881]/20 rounded-xl border border-[#528881]/50"><Play size={24} color={COLORS.teal} /></div>
                  <h2 className="text-xl font-medium text-gray-100">Start Quiz</h2>
                </div>
                <p className="text-gray-300 text-sm relative z-10">Focus mode. Type the words as you hear them.</p>
              </GlassCard>
              <GlassCard onClick={() => setCurrentView('quietSetup')} className="p-5 sm:p-6 group">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-[#528881]/20 rounded-xl border border-[#528881]/40 group-hover:border-[#528881]/70 transition-colors"><BookOpen size={24} color={COLORS.teal} /></div>
                  <h2 className="text-xl font-medium text-gray-100">Quiet Practice</h2>
                </div>
                <p className="text-gray-400 text-sm">No sound required. Multiple choice spelling.</p>
              </GlassCard>
              <GlassCard onClick={() => setCurrentView('searchMenu')} className="p-5 sm:p-6 group">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-[#528881]/20 rounded-xl border border-[#528881]/40 group-hover:border-[#528881]/70 transition-colors"><Search size={24} color={COLORS.teal} /></div>
                  <h2 className="text-xl font-medium text-gray-100">Word Search</h2>
                </div>
                <p className="text-gray-400 text-sm">Find hidden spelling words in a puzzle grid.</p>
              </GlassCard>
              <GlassCard onClick={() => { setSelectedWord(null); setCurrentView('missed'); }} className="p-5 sm:p-6 group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#528881]/20 rounded-xl border border-[#528881]/40 group-hover:border-[#528881]/70 transition-colors"><AlertCircle size={24} color={COLORS.teal} /></div>
                    <h2 className="text-xl font-medium text-gray-100">Missed Words</h2>
                  </div>
                  {missedWords.length > 0 && <span className="bg-[#885159] text-white text-xs font-bold px-2 py-1 rounded-full border border-[#528881]/50 shadow-[0_0_8px_rgba(82,136,129,0.3)]">{missedWords.length}</span>}
                </div>
                <p className="text-gray-400 text-sm">Review words you've slipped up on recently.</p>
              </GlassCard>
            </div>
            <div className="mt-2 pt-4 border-t border-[#528881]/30 grid grid-cols-2 gap-3">
              <button onClick={() => setCurrentView('lists')}
                className="w-full min-h-[48px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                  bg-[#528881]/10 backdrop-blur-2xl border border-[#528881]/40 text-[#528881]
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_20px_rgba(82,136,129,0.15)]
                  hover:bg-[#528881]/20 hover:border-[#528881]/70 hover:text-white
                  focus:outline-none focus:ring-2 focus:ring-[#528881]">
                <List size={18} /> MyLists
              </button>
              <TealButton onClick={() => setCurrentView('createList')} className="w-full min-h-[48px]"><Plus size={18} /> New List</TealButton>
            </div>

            {/* Student Monthly Calendar */}
            <GlassCard className="p-5 border-[#528881]/40">
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => setStudentCalMonth(new Date(sCalYear, sCalMon - 1, 1))} className="p-1 rounded-lg hover:bg-[#528881]/20 text-gray-400 hover:text-white transition-colors"><ChevronLeft size={16} /></button>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm text-gray-100 font-medium">{fullMonthNames[sCalMon]} {sCalYear}</span>
                  <div className="flex items-center gap-2">
                    {studentStreak > 0 ? (
                      <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500/20 to-[#528881]/20 border border-orange-400/40 px-2 py-0.5 rounded-full">
                        <Flame size={14} className="text-orange-400" />
                        <span className="text-orange-300 font-bold text-xs">{studentStreak} day{studentStreak > 1 ? 's' : ''}!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Flame size={14} />
                        <span className="text-xs">Start your streak!</span>
                      </div>
                    )}
                    <span className="text-[10px] text-gray-500">{sPracticeCount} / {sDaysInMonth} days</span>
                  </div>
                </div>
                <button onClick={() => setStudentCalMonth(new Date(sCalYear, sCalMon + 1, 1))} className="p-1 rounded-lg hover:bg-[#528881]/20 text-gray-400 hover:text-white transition-colors"><ChevronRight size={16} /></button>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {sDayNames.map((dn, i) => (
                  <div key={i} className="text-center text-[8px] text-[#528881] font-bold uppercase tracking-wider pb-0.5">{dn}</div>
                ))}
                {Array.from({ length: sFirstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {sCalendarDays.map((d, i) => {
                  const key = getDayKeyS(d);
                  const hasPractice = studentQuizDays.has(key);
                  const isToday = key === getDayKeyS(today);
                  const isFuture = d > today && !isToday;
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex flex-col items-center justify-center text-[10px] font-bold transition-all
                        ${hasPractice ? 'bg-[#528881] text-white shadow-[0_0_6px_rgba(82,136,129,0.5)]' :
                          isToday ? 'border-2 border-[#528881]/60 text-gray-400' :
                          isFuture ? 'bg-black/10 border border-[#528881]/8 text-gray-700/40' :
                          'bg-black/30 border border-[#528881]/10 text-gray-700'}`}>
                        <span className="text-[8px] leading-none">{d.getDate()}</span>
                        {hasPractice ? <span className="text-[7px] leading-none">✓</span> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
              {studentStreak >= 3 && (
                <p className="text-center text-xs text-[#528881] mt-3 pt-2 border-t border-[#528881]/20">
                  {studentStreak >= 7 ? "You're on fire! Keep that streak going!" :
                   studentStreak >= 5 ? "Awesome consistency! Almost a full week!" :
                   "Nice streak! Keep it up!"}
                </p>
              )}
            </GlassCard>

            {/* Signed-in user label + parent dashboard + sign out */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-gray-600 text-xs truncate max-w-[200px]">{authUser.email}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentView('parentDashboard')}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-[#528881] transition-colors text-xs min-h-[36px] px-2"
                  title="Parent Dashboard"
                >
                  <Shield size={14} />
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-[#885159] transition-colors text-xs min-h-[36px] px-2"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'quizSetup' && <PracticeSetup mode="quiz" lists={lists} onStart={(w, ln) => { setPracticeModeWords(w); setPracticeListName(ln); setPracticingMissed(false); setCurrentView('quiz'); }} onBack={goHome} />}
        {currentView === 'quietSetup' && <PracticeSetup mode="quiet" lists={lists} onStart={(w, ln) => { setPracticeModeWords(w); setPracticeListName(ln); setPracticingMissed(false); setCurrentView('quiet'); }} onBack={goHome} />}
        {currentView === 'quiz' && <Quiz key={practiceModeWords.join(',')} words={practiceModeWords} missedWords={missedWords} setMissedWords={saveMissedToCloud} onBack={goHome} listName={practiceListName} userEmail={authUser?.email || ''} practicingMissed={practicingMissed} />}
        {currentView === 'quiet' && <QuietPractice key={practiceModeWords.join(',')} words={practiceModeWords} missedWords={missedWords} setMissedWords={saveMissedToCloud} onBack={goHome} listName={practiceListName} userEmail={authUser?.email || ''} practicingMissed={practicingMissed} />}
        {currentView === 'searchMenu' && <WordSearchMenu hasSavedPuzzle={wsWords !== null && wsWords.length > 0} onNewPuzzle={() => setCurrentView('searchSetup')} onContinue={() => setCurrentView('searchPuzzle')} onBack={goHome} />}
        {currentView === 'searchSetup' && <WordSearchSetup lists={lists} onStart={(words, diff, ln, fullPool) => {
          setWsFullPool(fullPool);
          setWsWords(words); setWsDifficulty(diff); setWsListName(ln); setCurrentView('searchPuzzle');
        }} onBack={() => setCurrentView('searchMenu')} />}
        {currentView === 'searchPuzzle' && wsWords && <WordSearchPuzzle key={wsWords.join(',')+wsDifficulty} initialWords={wsWords} difficulty={wsDifficulty} onBack={() => setCurrentView('searchMenu')} onRemix={() => {}} listName={wsListName} userEmail={authUser?.email || ''} fullWordPool={wsFullPool} />}
        {currentView === 'lists' && <ListManager lists={lists} setLists={saveListsToCloud} onCreateList={() => setCurrentView('createList')} onBack={goHome} onStartQuiz={startQuiz} onStartQuiet={startQuiet} />}
        {currentView === 'createList' && <CreateListFlow lists={lists} setLists={saveListsToCloud} onDone={() => setCurrentView('lists')} onBack={() => setCurrentView('lists')} />}
        {currentView === 'missed' && <MissedWordsView missedWords={missedWords} onStartQuiz={startMissedPractice} onSelectWord={w => setSelectedWord(w)} onBack={goHome} onClearAll={() => saveMissedToCloud([])} />}
        {currentView === 'parentDashboard' && <ParentDashboard onBack={goHome} />}
      </main>

      <WordDetailModal word={selectedWord} onClose={() => setSelectedWord(null)} />
    </div>
  );
}
