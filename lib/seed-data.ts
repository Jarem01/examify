/**
 * Examify seed set — "Exam 11/5–11/13".
 * Transcribed from the supplied Quizlet export (10 pages) and lightly condensed
 * so each card reads well on screen. 210 cards total.
 */
export interface SeedCard {
  term: string;
  definition: string;
}

export const SEED_TITLE = 'Exam 11/5–11/13';
export const SEED_DESCRIPTION =
  'Human sexuality & relationships — mindfulness, attachment, authenticity, pornography, doctrine, the equity model, orientation and gender. 210 terms.';

export const SEED_CARDS: SeedCard[] = [
  /* 1–10 — sexual mindfulness */
  {
    term: 'Sexual mindfulness has a more dramatic effect on which group?',
    definition:
      'Women. "Sexual mindfulness has a stronger association with women\'s sexual satisfaction than men\'s. But it matters for both."',
  },
  {
    term: 'Why might sexual mindfulness have a more dramatic effect for women?',
    definition:
      'Women need to "let go of the critical voice" (perfectionism, body image issues) and "care for self."',
  },
  {
    term: 'How can men encourage a woman\'s sexual mindfulness?',
    definition:
      'By being sexually mindful themselves — "When men are more sexually mindful, they are more tuned into their women\'s emotions. They are emotionally safe."',
  },
  {
    term: 'What is men\'s "superpower" in the mindfulness model?',
    definition:
      'Safety. "When men provide safety women can relax, trust and embrace desire."',
  },
  {
    term: 'What two components make up sexual mindfulness?',
    definition: 'Awareness and non-judgment.',
  },
  {
    term: 'What effect does both partners\' mindfulness have on women?',
    definition: '"Both partner\'s mindfulness resulted in more orgasm consistency in women."',
  },
  {
    term: 'Sexual mindful awareness is linked to what?',
    definition: '"Both actor and partner sexual harmony."',
  },
  {
    term: 'Name at least five ways to practice mindfulness.',
    definition:
      'Mindful walk, mindful eating, meditation, mantras, self-compassion, loving kindness, heads together, mindful embrace, slow sex, mindful gaze, mindful handholding, mindful touch (sensate focus).',
  },
  {
    term: 'Define sexual mindfulness.',
    definition:
      '"The purposeful giving of non-judgmental attention to the present during a sexual experience" (Leavitt et al., 2019).',
  },
  {
    term: 'How does David O. McKay define meditation?',
    definition:
      '"Meditation is the language of the soul... a form of private devotion, or spiritual exercise, consisting in deep, continued reflection on some religious theme. Meditation is a form of prayer."',
  },

  /* 11–20 — the research */
  {
    term: 'What is Leavitt et al. (2019) the source for?',
    definition: 'The definition of sexual mindfulness.',
  },
  {
    term: 'What is the key finding of Leavitt et al. (2021)?',
    definition:
      'Sexual mindfulness is associated with sexual satisfaction, relational satisfaction, and sexual functioning.',
  },
  {
    term: 'What is the key finding of Leavitt (2018)?',
    definition:
      'Sexual mindfulness predicts sexual satisfaction above and beyond sexual behaviors like kissing, vaginal, and oral sex.',
  },
  {
    term: 'What are Kimmes et al. (2018) and Kabat-Zinn (1985) cited for?',
    definition:
      'Kimmes (2018) = relational mindfulness; Kabat-Zinn (1985) = general mindfulness. Both are foundational layers in the conceptual model.',
  },
  {
    term: 'What was the qualitative finding of the HEAL Project?',
    definition: 'Couples said it "opened the dialogue" and made them "feel closer."',
  },
  {
    term: 'What was the quantitative finding of the HEAL Project?',
    definition:
      'Significant pre-to-post improvements in sexual satisfaction, awareness, non-judgment, and sexual communication.',
  },
  {
    term: 'What were the study details of the HEAL Project?',
    definition: '10 married couples; couples had to attend all classes.',
  },
  {
    term: 'What is the main finding of the Latent Class Differences table?',
    definition:
      'Six couple classes differ significantly on relationship and sexual outcomes. The "High" class (23%) had the highest satisfaction; the "Low" class (8%) had the lowest satisfaction and highest instability.',
  },
  {
    term: 'What is the main point of Figures 1 and 2 in the conceptual model?',
    definition:
      'Both actor pathways (own mindfulness affecting own outcomes) and partner pathways (partner\'s mindfulness affecting one\'s outcomes) were tested for awareness and non-judgment.',
  },
  {
    term: 'What are Dr. Johnson\'s main points about sex and attachment?',
    definition:
      'Sex is a safe adventure; sex is an emotional dance; sex is a potent bonding activity.',
  },

  /* 21–30 — attachment & Gottman */
  {
    term: 'What happens when there is trouble with emotion or safety, according to Dr. Johnson?',
    definition: 'Solace Sex and Sealed Off Sex.',
  },
  {
    term: 'Define Solace Sex.',
    definition:
      'Proof of love — anxious, overwhelmed with emotion, using sex for comfort and reassurance.',
  },
  {
    term: 'Define Sealed Off Sex.',
    definition: 'Shut down, focused on sensation, lonely, not enjoyable.',
  },
  {
    term: 'What are the 4 attachment meditation mantras (Thich Nhat Hanh)?',
    definition:
      '1. Darling, I am here for you. 2. Darling, I know you are there for me. 3. Darling, I know you suffer and that is why I am here for you. 4. Darling, I suffer; please help me in my suffering.',
  },
  {
    term: 'Gottman: what percentage of happiness do happy partners attribute to a pleasing sex life?',
    definition: '15–20%.',
  },
  {
    term: 'Gottman: what percentage of distress do unhappy partners ascribe to sexual problems?',
    definition: '50–70%.',
  },
  {
    term: 'Gottman: is a quality sexual relationship sufficient for a good marriage?',
    definition: 'No — it is necessary but not sufficient.',
  },
  {
    term: 'Gottman: what building blocks interact with sexual bonds to create a secure emotional base?',
    definition: 'Emotional accessibility and responsiveness.',
  },
  {
    term: 'Gottman: what happens if the sexual relationship is not fulfilling?',
    definition: 'It is one of the fastest ways to destabilize an otherwise secure relationship.',
  },
  {
    term: 'Gottman: what does insecure attachment lead to sexually?',
    definition: 'Emotionless sex (avoidance) or clingy sex (anxious).',
  },

  /* 31–40 — bids & communication */
  {
    term: 'What expands the idea that novelty keeps sexuality vibrant?',
    definition: 'Attunement — being connected emotionally keeps sex vibrant.',
  },
  {
    term: 'What is ARE?',
    definition:
      'Accessibility, Responsiveness, Engagement — the three principle attachment behaviors of securely attached couples (Dr. Sue Johnson).',
  },
  {
    term: 'Why is conflict an opportunity for intimacy?',
    definition:
      '"What if marriage (life) is not intended to just make me happy, but to make me holy? Conflict is the opportunity for intimacy."',
  },
  {
    term: 'How can HD and LD partners create intimacy despite differences?',
    definition:
      'Accept each other with love; allow some experiences to be quicker or more for the HD partner; communicate preferences before, during, and after sex; alternate who initiates; use mindfulness and sexual mindfulness (curiosity not judgment, present-moment awareness not pushing toward a goal).',
  },
  {
    term: 'Define effective communication.',
    definition: 'Effective communication takes place when Intent = Impact.',
  },
  {
    term: 'What is the difference between conflict and contention?',
    definition:
      'Conflict is healthy and brings deeper understanding and balance. Contention is unhealthy (pride, anger, distance, negative attitude toward partner).',
  },
  {
    term: 'What are Gottman\'s 4 Horsemen?',
    definition: 'Criticizing, Contempt, Defensiveness, Stonewalling.',
  },
  {
    term: 'Which of the 4 Horsemen is the biggest predictor of divorce?',
    definition: 'Contempt.',
  },
  {
    term: 'What is the difference between criticizing and complaining?',
    definition:
      'Criticizing is an accusation ("We don\'t have enough sex"). Complaining is a specific explanation ("I love it when we have sex. Could we do that more often?").',
  },
  {
    term: 'What is defensiveness?',
    definition: 'Denying responsibility or making excuses.',
  },

  /* 41–50 — conflict, bids, hormones */
  {
    term: 'What is stonewalling, and who uses it most?',
    definition: 'Physically or emotionally withdrawing from conflict; men use it 85% of the time.',
  },
  {
    term: 'What is a bid?',
    definition:
      'A partner puts themselves out there to request connection, sexual or otherwise.',
  },
  {
    term: 'What is "turn toward"?',
    definition:
      'A positive response that acknowledges the bid and responds in a connecting way — not necessarily agreeing to sex.',
  },
  {
    term: 'What is "turn away"?',
    definition: 'No response or playing down the initiation.',
  },
  {
    term: 'What is "turn against"?',
    definition: 'Embarrasses or shames the partner who made the bid.',
  },
  {
    term: 'What is a soft start-up?',
    definition:
      'How a conversation begins determines how it ends; healthy couples use a 5-to-1 ratio of positive to negative.',
  },
  {
    term: 'Tannen: how do men and women use conversation differently?',
    definition:
      'Men use conversation to negotiate status and preserve independence; women use conversation to negotiate closeness and intimacy.',
  },
  {
    term: 'Tannen: what is "troubles talk"?',
    definition:
      'For women, talking about troubles is the essence of connection. Men hear it as a request for advice and respond with a solution.',
  },
  {
    term: 'What is the primary hormone associated with bonding?',
    definition: 'Oxytocin.',
  },
  {
    term: 'Who has more oxytocin, and why?',
    definition:
      'Typically females — the estrogen/progesterone cycle enhances oxytocin production and brain receptivity better than the male system.',
  },

  /* 51–60 — oxytocin & attachment biology */
  {
    term: 'Pierrehumbert et al. (2012): cortisol and oxytocin pattern for secure attachment?',
    definition: 'Low cortisol and high oxytocin.',
  },
  {
    term: 'Pierrehumbert et al. (2012): cortisol and oxytocin pattern for avoidant attachment?',
    definition: 'Moderate cortisol, moderate oxytocin.',
  },
  {
    term: 'Pierrehumbert et al. (2012): cortisol and oxytocin pattern for anxious attachment?',
    definition: 'Moderate cortisol, low oxytocin.',
  },
  {
    term: 'Name three natural ways to increase oxytocin.',
    definition:
      'Unexpected gift/note/compliment; deeper conversation; physical exercise or yoga; warm bath; loving kindness meditation; kissing, touching, cuddling, massage; sexual activity/foreplay (especially emotional foreplay).',
  },
  {
    term: 'Are oxytocin supplements effective?',
    definition:
      'No — oxytocin is behaviorally induced; supplements are too short-lived and neutralized by the digestive system.',
  },
  {
    term: 'What role does oxytocin play in female sexual function?',
    definition:
      'It stimulates vaginal contractions needed for orgasm, increases blood flow and lubrication, and contributes to libido.',
  },
  {
    term: 'What is the most natural way to increase oxytocin?',
    definition:
      'Foreplay — most importantly emotional foreplay (touching and connecting on an intimate level).',
  },
  {
    term: 'What testosterone-driven tendencies reduce sexual enjoyment for both partners?',
    definition:
      'Little or no foreplay; too soon/too much genital stimulation; intercourse initiated too soon; exclusive focus on PVI; thinking sex is over when the male climaxes; an average experience of 7–10 minutes; positions that don\'t match female arousal needs.',
  },
  {
    term: 'How do healthy couples deal with different oxytocin levels?',
    definition:
      'They appreciate the HD partner for focusing on sex and the LD partner for prioritizing nonsexual bonding.',
  },
  {
    term: 'Oxytocin increases from which everyday behaviors?',
    definition:
      'Kissing, touching, cuddling, massage, and even self-massage.',
  },

  /* 61–70 — authenticity */
  {
    term: 'What is the main finding of the Gottman article on attachment and sexuality?',
    definition:
      'Happy partners attribute 15–20% of happiness to sex; unhappy partners attribute 50–70% of distress to sexual problems. Quality sex is necessary but not sufficient.',
  },
  {
    term: 'Define authenticity.',
    definition:
      'From a word meaning "genuine" — your inborn or native self, who you are at the core. "Becoming-being who you really are meant to be."',
  },
  {
    term: 'What is the relationship between honesty, integrity, and authenticity?',
    definition:
      'Honesty = honor; Integrity = whole; Authenticity = genuine. "It is impossible to be authentic without integrity and the amount of honesty that are required to confront."',
  },
  {
    term: 'Why is authenticity difficult? Name at least four reasons.',
    definition:
      'Self-esteem; distorted views; shame about sexuality; fear of upsetting partner; unrealistic expectations; fear of confronting ourselves.',
  },
  {
    term: 'What is the "Achilles heel" in LDS culture regarding authenticity?',
    definition:
      'We often sacrifice truth for "kindness" or "peace-keeping." Real kindness and peace means having the courage to tell the truth. We fear contention and confuse conflict with contention, so we pretend things don\'t bother us.',
  },
  {
    term: 'What case study illustrates authenticity struggles in this presentation?',
    definition:
      'Betty and Donald. The nonverbal conversation: "She\'s saying I\'m inadequate. He\'s saying I should do everything."',
  },
  {
    term: 'What is the Sexual Crucible (Schnarch)?',
    definition:
      'Unresolved individual and relationship problems surface to reveal themselves in common dysfunctional sexual styles — evoking deepest vulnerabilities and fears, and tapping into potential for profound love, passion, and spiritual transcendence.',
  },
  {
    term: 'What does Schnarch challenge about common sex therapy?',
    definition:
      'The common foci of sexual technique, reversal of sexual symptoms, or the pursuit of intimacy for intimacy\'s sake.',
  },
  {
    term: 'What are the four options when the marriage crucible hits?',
    definition:
      '1. Control more. 2. Accommodate more. 3. Stalemate/withdraw. 4. Grow as an individual (a lifelong process).',
  },
  {
    term: 'What are the 4 Points of Balance (Schnarch)?',
    definition:
      'Solid Flexible Self; Quiet Mind & Comforted Heart; Grounded Responding; Meaningful Endurance.',
  },

  /* 71–80 — differentiation */
  {
    term: 'Define Solid Flexible Self.',
    definition:
      'Your identity, values, and self-worth are relatively stable over time and circumstance.',
  },
  {
    term: 'Define Quiet Mind & Comforted Heart.',
    definition:
      'Handling your own emotional inner world; soothing yourself to tolerate discomfort.',
  },
  {
    term: 'Define Grounded Responding.',
    definition:
      'Making modulated responses to people, events, and situations — not over-reacting or failing to react when necessary.',
  },
  {
    term: 'Define Meaningful Endurance.',
    definition:
      'Marriage is a People Growing Machine. Diligent practice. Tolerating discomfort for growth.',
  },
  {
    term: 'What is the Growth Cycle?',
    definition:
      'A model with an inner circle (Comfort/Safety) and an outer circle (Growth/The Crucible) that regulates growth and stability for individuals, marriages, families, and groups.',
  },
  {
    term: 'What does the inner circle of the Growth Cycle represent?',
    definition:
      'Comfort/Safety — includes boredom, unresolved issues, detachment, trust, risk.',
  },
  {
    term: 'What does the outer circle of the Growth Cycle represent?',
    definition:
      'Growth (The Crucible) — includes anxiety, anxiety increases, confrontation & self-soothing, termination, commitment, avoidance, anxiety-reduction.',
  },
  {
    term: 'What does becoming an authentic adult require, according to Schnarch?',
    definition:
      'Soothing your own bad feelings without the help of another, pursuing your own goals, and standing on your own two feet. Marriage can\'t succeed unless we claim our sense of self in the presence of another.',
  },
  {
    term: 'Define differentiation.',
    definition:
      'Holding yourself together and tolerating intimacy without the fear of losing who you are as a separate being.',
  },
  {
    term: 'What is a well-differentiated self?',
    definition:
      'Recognizes realistic dependence on others, stays calm and clear-headed in the face of conflict, criticism, and rejection, and distinguishes fact-based thinking from emotionally clouded thinking.',
  },

  /* 81–90 — differentiation continued */
  {
    term: 'What is a poorly differentiated self?',
    definition:
      'Depends heavily on acceptance and approval of others — either quickly adjusts to please others or dogmatically proclaims what others should be like and pressures them.',
  },
  {
    term: 'What are signs of lower differentiation? Name at least four.',
    definition:
      'Sees the other person in conflict as the problem; lets feelings build until they explode; says what others want to hear instead of what they really feel; loses themselves in relationships; concerns themselves with others\' needs while disregarding their own; needs a lot of compliments and praise.',
  },
  {
    term: 'What are the three steps to differentiation?',
    definition:
      '1. Self-awareness and appreciation for unique attributes, skills, and feelings (practice authenticity during soul-searching struggles with grace, joy, gratitude). 2. Don\'t lose the sense of fun and creativity (routines can represent stagnation). 3. Be more open and honest in respectful ways and take small risks.',
  },
  {
    term: 'What advice is given for sexual communication while developing authenticity?',
    definition:
      'Start with small risks. If verbal communication is hard, try nonverbal. Talk before or after sexual experiences about wanting to do something different. "Pretending is easier than rejection — don\'t do it."',
  },
  {
    term: 'What should you do when you notice the 4 Horsemen?',
    definition:
      'Notice it (in yourself or your partner), take a 20-minute pause to physically calm, then re-engage to productively solve the problem.',
  },
  {
    term: 'What does "The Truth Shall Make You Free" mean here — free of what, free for what?',
    definition:
      'Free for helping each other achieve lifelong growth and change, steady progress toward perfection, and becoming one. "Speak of things as they really are, and of things as they really will be" (Jacob 4:13).',
  },
  {
    term: 'What does love mean in the context of differentiation?',
    definition:
      '"Love is not about being worthy or deserving. It is about seeing what is needed at the moment and responding to what is needed."',
  },
  {
    term: 'What is Elder Maxwell\'s quote on trials and authenticity?',
    definition:
      '"I have given you leukemia that you might teach my people with authenticity. Trials and tribulations tend to squeeze the artificiality out of us, leaving the essence of what we really are and clarifying what we really yearn for."',
  },
  {
    term: 'What is the state of porn research?',
    definition: 'Porn research is developing.',
  },
  {
    term: 'What should be the focus of education regarding pornography?',
    definition: 'Healthy sexuality education.',
  },

  /* 91–100 — pornography definitions */
  {
    term: 'What should we help people stay in touch with regarding pornography?',
    definition:
      'The distastefulness of viewing another person\'s sexuality for attention or gain.',
  },
  {
    term: 'How should we approach the problem of pornography?',
    definition: 'Be concerned but not alarmist; avoid complacency.',
  },
  {
    term: 'What is the recommended stance toward those struggling with pornography?',
    definition: 'Be loving and supportive but clear about boundaries.',
  },
  {
    term: 'What is Justice Stuart Potter\'s famous definition of pornography?',
    definition: '"I know it when I see it."',
  },
  {
    term: 'What was the original meaning of the term pornography?',
    definition: 'Written depictions of the sexual acts of prostitutes.',
  },
  {
    term: 'What is Victor Frankl\'s definition of pornography?',
    definition: 'Impersonal sex. The opposite of pornography is personal sex.',
  },
  {
    term: 'What is the problem with defining pornography as "anything that sexually arouses the viewer"?',
    definition: 'The definition is too broad — arousal alone is a problematic standard.',
  },
  {
    term: 'According to surveys, what is the minimal requirement for sexual media to be pornography for most people?',
    definition: 'Full nudity.',
  },
  {
    term: 'How do religiously conservative individuals often define pornography?',
    definition: 'Media that is both suggestive and explicit.',
  },
  {
    term: 'What percentage of pornography users are addicted?',
    definition:
      '5–15%. Only about 5–7% of people are addicted to any particular substance or behavior.',
  },

  /* 101–110 — effects of porn */
  {
    term: 'What are the spiritual effects of any pornography use?',
    definition:
      'Loss of the Holy Ghost; loss of priesthood power; loss of agency and strength to endure.',
  },
  {
    term: 'What is male pornography use associated with in couples?',
    definition:
      'Increased sexual behavior; less male and female satisfaction; less positive male communication; less female sexual desire; less male sexual satisfaction.',
  },
  {
    term: 'What is female pornography use associated with?',
    definition: 'Higher sexual desire and higher relationship satisfaction.',
  },
  {
    term: 'Pirrone et al. (2021): what were the two high pornography (HP) groups?',
    definition: '48.2% of boys and 8.6% of girls.',
  },
  {
    term: 'Pirrone et al. (2021): what was the key finding regarding HP groups?',
    definition:
      'HP groups showed accelerated development of masturbation, petting, and receiving manual sex. Pornography use predicted accelerated sexual activities across adolescence.',
  },
  {
    term: 'Pirrone et al. (2021): how did pornography use change over time for HP boys?',
    definition:
      'At T1, less than once a month but more than once a year. By T4, almost one to two times a week.',
  },
  {
    term: 'Pirrone et al. (2021): how did pornography use change over time for HP girls?',
    definition: 'At T1, never watched. By T4, almost one to three times a month.',
  },
  {
    term: 'What is the "elevated problem" of pornography in religious cultures?',
    definition:
      'General sexual anxiety; elevated fear; cultural myths; moral incongruence; perceived addiction. The net result is that negative outcomes are often elevated and exaggerated.',
  },
  {
    term: 'Young Adults (2016): what does the data show about LDS men\'s pornography use?',
    definition: '81% ever viewed; 13% of users view daily/weekly; 55% view yearly.',
  },
  {
    term: 'Young Adults (2016): what does the data show about LDS women\'s pornography use?',
    definition: '24% ever viewed; 2% of users view daily/weekly; 87% view yearly.',
  },

  /* 111–120 — alarmism & passion types */
  {
    term: 'What does the "Are you a Porn Addict?" chart show?',
    definition:
      'A 340% increase over the actual estimate among people who agree they are addicted, with high agreement among religious men.',
  },
  {
    term: 'Which two extremes of the passion continuum are most likely to have challenges with porn?',
    definition: 'Inhibited and Obsessive.',
  },
  {
    term: 'What are the negative consequences of alarmist attitudes about porn?',
    definition:
      'We embed the idea that sex = porn in our youth; we embed porn = perversion & addiction; we destroy relationships that could easily survive; we drive porn problems underground.',
  },
  {
    term: 'What are the antidotes to porn problems?',
    definition: 'Breaking secrecy and silence, and providing support.',
  },
  {
    term: 'Why is porn so hidden?',
    definition:
      'Because of the shame of the users and the self-righteous and judgmental reactions of the nonusers.',
  },
  {
    term: 'What does "Neither do I condemn thee" refer to?',
    definition:
      'A scriptural reference used to encourage a non-judgmental stance toward those struggling with pornography.',
  },
  {
    term: 'How can family members make a porn problem worse?',
    definition:
      'By taking it as a personal failure ("If I were a good enough spouse...") and by checking up on the person who used porn.',
  },
  {
    term: 'What is the key principle for changing another person?',
    definition:
      '"I cannot change another person. I can only invite them to be in a relationship with a better me."',
  },
  {
    term: 'How can you be helpful regarding pornography?',
    definition:
      'Focus on healthy sexuality education; pre-arm rather than cocoon children; help people stay in touch with the distastefulness of viewing others\' sexuality for gain; be concerned but not alarmist; be loving and supportive but clear about boundaries; encourage openness; express disappointment, love always; recognize your own insecurities and grow; don\'t promote the idea that women are responsible for men\'s sexual behaviors.',
  },
  {
    term: 'What does the "How Porn Affects Healthy Sexuality" model show?',
    definition:
      'A spectrum from relationship-centered sexuality (never viewed / not currently viewing) to self-centered sexuality (some/habitual/compulsive viewing), with outcomes including obsessive passion, repressed passion, and harmonious passion.',
  },

  /* 121–130 — doctrine */
  {
    term: 'What is "Harmonious Passion"?',
    definition: 'Sexual wholeness; soul = body and spirit; symbol = between spouses.',
  },
  {
    term: 'What is "Obsessive Passion"?',
    definition:
      'Objectification/unrealistic expectations; distorted arousal template; diminished attachment capacity.',
  },
  {
    term: 'What is "Repressed Passion"?',
    definition: 'Negative, fearful, unprepared.',
  },
  {
    term: 'What is President Oaks\' quote on treating those ensnared by pornography?',
    definition:
      '"All of us need the Atonement of Jesus Christ. Those struggling with pornography need our compassion and love... Please do not condemn them. They are not evil or without hope. They are sons and daughters of our Heavenly Father."',
  },
  {
    term: 'What defines whether something is doctrine or just a well-thought-out opinion?',
    definition:
      'Doctrine is established when the First Presidency and Quorum of the Twelve counsel together and it is consistently proclaimed in official church publications. Not every statement by a church leader constitutes doctrine.',
  },
  {
    term: 'What are the 4 crucial principles of decision making?',
    definition:
      '1. Marital unity. 2. Couple consensus. 3. Positive attitudes (neophilia, neophobia, healthy/unhealthy inhibitions). 4. Sexual potential.',
  },
  {
    term: 'How do we receive answers to prayer, and how can they be understood?',
    definition:
      '1. Strong and clear confirmation it is right. 2. Strong and clear confirmation it is wrong. 3. Nothing — the most common answer — which can mean you are spiritually out of touch, have not put in the effort yet, or it is your choice (the most common meaning).',
  },
  {
    term: 'What is the meaning and application of Equal Partnership?',
    definition:
      'It is the pattern for how husbands and wives make decisions and resolve differences. Fathers and mothers are obligated to help one another as equal partners. It is a full partnership — not silent or limited partners.',
  },
  {
    term: 'What is the meaning of Ezer?',
    definition:
      'Hebrew word for "help" in "help meet." It means help, savior, rescuer, protector — as in "God is our help." It never refers to an inferior, but always to a superior or an equal.',
  },
  {
    term: 'What did Joseph Smith teach about when a prophet is acting as a prophet?',
    definition: '"A prophet [is] a prophet only when he [is] acting as such."',
  },

  /* 131–140 — marriage & doctrine */
  {
    term: 'What are the three principles consistently taught in official church publications about sexual behaviors in marriage?',
    definition:
      '1. Adultery and pornography are sinful. 2. Beyond that, what goes on in the bedroom of a married couple is under their personal line of authority. 3. This does not mean anything goes in the bedroom.',
  },
  {
    term: 'What is the Divine Triangle?',
    definition:
      'A model with God at the top and self and spouse at the bottom corners. If the marital foundation is in place, God\'s authority governs the home and there does not need to be a tug-of-war between spouses.',
  },
  {
    term: 'What does marital intimacy mean according to President Russell and Wendy Nelson?',
    definition:
      'It is ordained by God and commanded and commended by Him because it draws husband and wife closer together and closer to the Lord. It involves the whole soul of each spouse — uniting body and spirit of husband with body and spirit of wife.',
  },
  {
    term: 'What did President Spencer W. Kimball say about marriage as a partnership?',
    definition:
      '"We do not want our LDS women to be silent partners or limited partners in that eternal assignment! Please be a contributing and full partner."',
  },
  {
    term: 'What did President Russell M. Nelson say about harmony in marriage?',
    definition:
      '"Harmony in marriage comes only when one esteems the welfare of his or her spouse among the highest of priorities."',
  },
  {
    term: 'What does "meet" mean in "help meet" (Genesis 2:18)?',
    definition:
      'The original Hebrew means Eve was adequate for, or equal to, Adam. She wasn\'t his servant or subordinate.',
  },
  {
    term: 'How many times does the word ezer occur in the Old Testament, and what does it refer to?',
    definition:
      'Twenty-one times. Two cases refer to Eve; three refer to powerful nations Israel called on for help; sixteen refer to God as our help.',
  },
  {
    term: 'What does Philip Payne say about the word ezer?',
    definition:
      'It does not suggest "helper" as in "servant," but help, savior, rescuer, protector as in "God is our help." In no other occurrence does it refer to an inferior, but always to a superior or an equal.',
  },
  {
    term: 'What does neĝed mean?',
    definition:
      'Also used for spouse; means "beneficial adversary." Related to opponent processing (two hemispheres in our brain).',
  },
  {
    term: 'What is the most common answer to prayer, and what does it mean?',
    definition:
      'Nothing. It can mean you are spiritually out of touch, have not put in the effort yet, or it is your choice (the most common meaning).',
  },

  /* 141–150 — agency & equity model */
  {
    term: 'What does the presentation say about LDS people and decision-making?',
    definition:
      'While LDS people should be the strongest advocates of agency, they typically want the Lord to make their decisions for them — seeing spirituality more like magic or a formula rather than a relationship based on agency, miracles, and the still, small voice.',
  },
  {
    term: 'What are the four guiding principles?',
    definition: '1. Marital unity. 2. Couple consensus. 3. Positive attitudes. 4. Sexual potential.',
  },
  {
    term: 'What does "Sexual Potential" mean in the 4 guiding principles?',
    definition:
      'Does this contribute to my becoming and belonging? Does this contribute to my partner\'s becoming and belonging?',
  },
  {
    term: 'How many points are in the Equity Model?',
    definition: '10 points.',
  },
  {
    term: 'What does the Equity Model not account for?',
    definition: 'Children and God.',
  },
  {
    term: 'What are fuzzy bids?',
    definition:
      '"I am afraid of rejection and test the waters if unsure" — a tentative attempt to connect due to fear of rejection.',
  },
  {
    term: 'Equity Model Point 1',
    definition:
      'Base relationships between men and women on respectful attitudes that promote, and even demand, equity.',
  },
  {
    term: 'Equity Model Point 2',
    definition: 'Maintain open and flexible attitudes toward female-male roles.',
  },
  {
    term: 'Equity Model Point 3',
    definition:
      'Work toward an acceptance and security about yourself and your femininity/masculinity so that you do not need the approval of the opposite sex nor are you intimidated by same-sex peer pressure.',
  },
  {
    term: 'Equity Model Point 4',
    definition:
      'Be aware that intellectually, behaviourally, emotionally and sexually there are more similarities than differences between women and men.',
  },

  /* 151–160 — equity model continued */
  {
    term: 'Equity Model Point 5',
    definition:
      'Encourage personal and/or professional friendships with the other sex, but resist the pressure to sexualize these relationships.',
  },
  {
    term: 'Equity Model Point 6',
    definition:
      'Be comfortable and confident in your femininity or masculinity so that activities or interests labeled as belonging to the other sex can be integrated into your life.',
  },
  {
    term: 'Equity Model Point 7',
    definition:
      'Understand that an intimate sexual relationship will be more satisfying if both the woman and man can initiate, say no, request and enjoy a range of sexual pleasures.',
  },
  {
    term: 'Equity Model Point 8',
    definition:
      'Acknowledge that conception, contraception and children are as much the responsibility of men as women.',
  },
  {
    term: 'Equity Model Point 9',
    definition:
      'Cultivate a marriage based on respect, equity, trust and intimacy, which increase satisfaction for both women and men.',
  },
  {
    term: 'Equity Model Point 10',
    definition:
      'Promote a communicative, sharing and caring relationship for emotional and sexual satisfaction.',
  },
  {
    term: 'How is sex like a sacrament?',
    definition:
      'Both are practices instituted by God/Christ; both involve giving of body to strengthen soul/relationship; both provide spiritual help for living a more perfect/committed life; both involve renewal of covenants/commitments; both involve realignment of will.',
  },
  {
    term: 'What does the bell curve on Page 3 represent?',
    definition:
      'How often LDS couples would like to have sex — most fall in the middle range, with fewer at the extremes.',
  },
  {
    term: 'What is the Sacrament?',
    definition:
      'A practice instituted by Christ himself, not made up by the church or evolved over time. Specific practices Christ gives to Christians for their sake.',
  },
  {
    term: 'How did Ignatius of Antioch describe the Sacrament?',
    definition:
      '"The medicine of immortality" — imparting the deifying presence of the Spirit.',
  },

  /* 161–170 — sacrament, sex, journaling */
  {
    term: 'What is sex, according to the presentation?',
    definition:
      'A practice instituted by God himself, not just an evolutionary or biological urge. It is a gift, a symbol of the deifying presence of God in marriage, and the medicine of marriage.',
  },
  {
    term: 'What are the three responses to bids (Gottman)?',
    definition: 'Turning away, turning toward, turning against.',
  },
  {
    term: 'What does "turning against" usually mean?',
    definition:
      'Usually "I am feeling overwhelmed, I don\'t feel purpose, I feel a lot of self-criticism" — even though it communicates hostility and a desire to hurt or drive the partner away.',
  },
  {
    term: 'What does "turning against" say to a partner?',
    definition:
      '"Your need for attention makes me angry. I feel hostile towards you. I don\'t respect you. I don\'t value you or this relationship. I want to hurt you. I want to drive you away."',
  },
  {
    term: 'What are some journaling ideas from Page 2?',
    definition:
      'What is my routine to self-reflect? Does talking about arousal make me uncomfortable? How am I trying to gain better physical self-mastery? Can I slow my thoughts if I feel arousal? Am I willing to be emotionally vulnerable? Do I confront myself about my thoughts, intentions, and behaviors? Do I genuinely connect with my partner, friends, and family? How are my 4 points of balance? How do I approach the Growth Cycle? Am I comfortable with all the vocabulary in this class?',
  },
  {
    term: 'What are the major differences between male and female sexuality?',
    definition:
      'Female sexuality is more complex; women\'s capacity for multiple orgasm; menstrual cycle; ability to conceive, carry children, and breastfeed; reliability and predictability of sexual response differs by gender; women\'s desire, arousal, and orgasm are more variable, flexible, and interactive — influenced more by emotional and relational factors.',
  },
  {
    term: 'What does WOOPS stand for?',
    definition:
      'W: What is the desired goal (reduce/eliminate masturbation). O: Optimal outcome of achieving the goal. O: Obstacles encountered inside the individual. P: Practice improving on things that interfere with success, one step removed from the appetite.',
  },
  {
    term: 'What is the "medicine of marriage"?',
    definition:
      'Sex — it can be balm for the regular stresses of a healthy but imperfect union.',
  },
  {
    term: 'What does sex renew, according to the comparison table?',
    definition: '"Renews our efforts to live a more committed, unified life with our spouse."',
  },
  {
    term: 'What does the Sacrament renew?',
    definition:
      '"Renews our baptism covenants. This includes God\'s pardon of our sins — just as at baptism."',
  },

  /* 171–180 — orientation */
  {
    term: 'What is the realignment of will in the Sacrament?',
    definition: '"Realignment of our will with His will."',
  },
  {
    term: 'What is the realignment of will in sex?',
    definition: '"Realignment of our will to be united as a couple with God."',
  },
  {
    term: 'What question does the presentation ask about the Equity Model within a faith context?',
    definition:
      '"Is there a place for the equity model within your value system? What is missing from the model? God and the impact of adult decisions on children."',
  },
  {
    term: 'What is the standard (male) model of sexual orientation?',
    definition:
      'Same-sex attraction is inborn, immutable, evident prior to adolescence, low variability, primarily biologically based, about sexual desire, about gender, and involves early experimentation.',
  },
  {
    term: 'What percentage of men with same-sex attraction do not fit the standard model?',
    definition: 'Close to half.',
  },
  {
    term: 'What percentage of men who are not exclusively heterosexual consider themselves exclusively homosexual?',
    definition: 'About 30–40%.',
  },
  {
    term: 'How does male attraction change over time?',
    definition: 'Men become more exclusive in terms of attraction over time.',
  },
  {
    term: 'What does genital arousal research suggest about men?',
    definition:
      'Higher percentages of men are largely attracted to one gender or the other, probably over 50%. Men are more specific in what arouses them — mostly heterosexual men are primarily aroused by female images, mostly homosexual men by male images.',
  },
  {
    term: 'What is the new fluid model of sexual orientation?',
    definition:
      'Sexual attraction is less biologically based and more relationship based; triggered by the person not the gender; may occur later in life; women become less exclusive in terms of attraction over time; fluidity of attraction.',
  },
  {
    term: 'What percentage of non-exclusively heterosexual women are fluid?',
    definition: 'Approximately 85–90%.',
  },

  /* 181–190 — gender vocabulary */
  {
    term: 'What does "sexual orientation may be a misnomer for most women who are not primarily heterosexual" mean?',
    definition:
      'They do not have an orientation — they have relationships. Their attraction is triggered by the person, not the gender.',
  },
  {
    term: 'What does genital arousal research suggest about women?',
    definition:
      'Women do not know what arouses them, and they are more influenced by the degree of sexuality portrayed rather than the gender of the actors.',
  },
  {
    term: 'What is the approximate prevalence of non-exclusively heterosexual attraction?',
    definition: 'Approximately 7% of men and 13% of women.',
  },
  {
    term: 'Define sex (biological).',
    definition: 'Biological sex as characterized by chromosomes, hormones, and genitalia.',
  },
  {
    term: 'Define intersex.',
    definition:
      'A variety of conditions in which people are born with sexual anatomy that doesn\'t resemble a typical male or female anatomy.',
  },
  {
    term: 'Define gender expression.',
    definition:
      'The way one presents oneself outwardly to the world (behaviors, interests, dress, interactions) as masculine, feminine, or androgynous.',
  },
  {
    term: 'Define gender identity.',
    definition: 'The psychological sense of who you are, either man, woman, or other.',
  },
  {
    term: 'Define gender queer.',
    definition: 'Not choosing to ascribe to one gender.',
  },
  {
    term: 'Define cisgender.',
    definition: 'Sex matches gender identity.',
  },
  {
    term: 'Define transgender.',
    definition: 'Sex and gender identity do not match.',
  },

  /* 191–200 — constructs & doctrine on attraction */
  {
    term: 'Define sexual orientation.',
    definition: 'What sex you are attracted to physically and emotionally.',
  },
  {
    term: 'Define pansexual.',
    definition: 'Not attracted to anyone\'s sex, per se, but to the individual person.',
  },
  {
    term: 'Define asexual.',
    definition: 'Disinterest in sexual feelings or desires.',
  },
  {
    term: 'What is social constructivism (Dr. Sandra Bem)?',
    definition:
      '"Sex ≠ Gender. People are a sex, but they do gender." Gender has largely been defined by culture.',
  },
  {
    term: 'What is crystallization?',
    definition:
      'First sexual experiences may lead to crystallization of preferences because the brain bathes in hormones during orgasm. With repetition, preferences can crystallize and be more difficult to change.',
  },
  {
    term: 'What is the Church\'s 2015 stance on LGBTQ attraction?',
    definition:
      '"The attraction itself is not a sin, but acting on it is. Even though individuals do not choose to have such attractions, they do choose how to respond to them. With love and understanding, the Church reaches out to all God\'s children."',
  },
  {
    term: 'What did President Oaks say about God\'s commandments and popular behavior?',
    definition:
      '"The effect of God\'s commandments and laws is not changed to accommodate popular behavior or desires. If anyone thinks that godly or parental love for an individual grants the loved one license to disobey the law, he or she does not understand either love or law."',
  },
  {
    term: 'What did President Oaks say about responding to children struggling with moral issues?',
    definition:
      '"These teachings require continued loving concern, which surely requires continued loving associations."',
  },
  {
    term: 'What did Elder Holland say about knowledge?',
    definition:
      '"Hold fast to what you already know and stand strong until additional knowledge comes... In this Church, what we know will always trump what we do not know."',
  },
  {
    term: 'What did President Worthen say about unity?',
    definition:
      '"If we strive for true unity by following the Savior\'s example to love others, regardless of their race, gender, sexual orientation, political leanings, or other distinguishing characteristics, we can truly transform both our university community and the larger world."',
  },

  /* 201–210 — the four-part parent answer */
  {
    term: 'How should parents answer "How does someone know whether they are gay or not?" — Point 1',
    definition:
      'Sexual attraction is complicated for a small percentage of people. It mixes with physical attraction, love, and friendship, and can occur for a new person even when in a relationship with someone we love. It is particularly difficult for people with a fluid attraction template.',
  },
  {
    term: 'How should parents answer "How does someone know whether they are gay or not?" — Point 2',
    definition:
      'Sexual feelings ebb and flow overall and in relationships. Preferences may be difficult to figure out and may change over time, especially during teenage years when the hormonal system is still developing.',
  },
  {
    term: 'How should parents answer "How does someone know whether they are gay or not?" — Point 3',
    definition:
      'Sexual behaviors flood our brains with hormones that can solidify sexual preferences. Crystallization involves dopamine release during orgasm. Be particularly careful about arousing sexuality unless in a marriage relationship where preferences and person are matched. Change is still possible but can become harder with repetition.',
  },
  {
    term: 'How should parents answer "How does someone know whether they are gay or not?" — Point 4',
    definition:
      'We are judged by our behaviors and intentions. We are loved by parents and God regardless of preferences. Sexual attraction is not a choice, but there is no need to act on it. What we do with our feelings matters more than what we feel in a moment, and our feelings or actions do not change our value or whether we are loved.',
  },
  {
    term: 'What does the Wise Woman\'s Stone story ask?',
    definition:
      '"What has to happen within you to allow you to be so kind, so outward focused, so compassionate and connected to others that you can give precious gifts without hesitation?"',
  },
  {
    term: 'ESSAY: What are the four parts of how parents should answer "How does someone know whether they are gay or not?"',
    definition:
      '1. Sexual attraction is complicated for a small percentage of people. 2. Sexual feelings ebb and flow overall and in relationships. 3. Sexual behaviors flood our brains with hormones that can solidify sexual preferences. 4. We are judged by our behaviors and intentions; we are loved by parents and God regardless of preferences.',
  },
  {
    term: 'ESSAY PART 1: Sexual attraction is complicated for a small percentage of people — key points?',
    definition:
      'Sexual attraction mixes with physical attraction, love, and friendship. It can occur for a new person even when in a relationship with someone we love and are attracted to. It is particularly difficult for people with a fluid attraction template, because their sexual feelings are generated more from the relationship than from the physical characteristics of a certain biological sex.',
  },
  {
    term: 'ESSAY PART 2: Sexual feelings ebb and flow overall and in relationships — key points?',
    definition:
      'Sexual preferences may be difficult to figure out and may change over time. Because sexual feelings are connected to our bodies and hormones, they can change over time and change for a particular person. This is especially true for teenagers because the hormonal system is still in development.',
  },
  {
    term: 'ESSAY PART 3: Sexual behaviors flood our brains with hormones that can solidify preferences — key points?',
    definition:
      'Crystallization solidifies sexual preferences because strong hormones during orgasm release dopamine in the brain, which is very rewarding. Be particularly careful about arousing sexuality unless in a relationship with someone you are married to, where preferences and the person are matched. Preferences can still change, but they become harder to change with repetition.',
  },
  {
    term: 'ESSAY PART 4: We are judged by our behaviors and intentions — key points?',
    definition:
      'Sexual attraction is not a choice — it just happens — but like any other feeling, there is no need to act on it. What we do with our feelings of attraction matters much more than what we feel in a particular moment. Our sexual feelings or even our actions do not change our value as a person or whether we are loved.',
  },
];

/** Targeted confusion clusters used to build exam-worthy distractors. */
export const CONFUSION_GROUPS: string[][] = [
  [
    'What are Gottman\'s 4 Horsemen?',
    'Which of the 4 Horsemen is the biggest predictor of divorce?',
    'What is defensiveness?',
    'What is stonewalling, and who uses it most?',
  ],
  ['What is a bid?', 'What is "turn toward"?', 'What is "turn away"?', 'What is "turn against"?'],
  [
    'What does "turning against" usually mean?',
    'What does "turning against" say to a partner?',
    'What are the three responses to bids (Gottman)?',
  ],
  [
    'Define Solace Sex.',
    'Define Sealed Off Sex.',
    'What happens when there is trouble with emotion or safety, according to Dr. Johnson?',
    'Gottman: what does insecure attachment lead to sexually?',
  ],
  [
    'What is "Harmonious Passion"?',
    'What is "Obsessive Passion"?',
    'What is "Repressed Passion"?',
  ],
  [
    'Pierrehumbert et al. (2012): cortisol and oxytocin pattern for secure attachment?',
    'Pierrehumbert et al. (2012): cortisol and oxytocin pattern for avoidant attachment?',
    'Pierrehumbert et al. (2012): cortisol and oxytocin pattern for anxious attachment?',
  ],
  [
    'Define Solid Flexible Self.',
    'Define Quiet Mind & Comforted Heart.',
    'Define Grounded Responding.',
    'Define Meaningful Endurance.',
  ],
  [
    'What does the inner circle of the Growth Cycle represent?',
    'What does the outer circle of the Growth Cycle represent?',
    'What is the Growth Cycle?',
  ],
  [
    'Define sex (biological).',
    'Define intersex.',
    'Define gender expression.',
    'Define gender identity.',
    'Define gender queer.',
    'Define cisgender.',
    'Define transgender.',
    'Define sexual orientation.',
    'Define pansexual.',
    'Define asexual.',
  ],
  [
    'What is a well-differentiated self?',
    'What is a poorly differentiated self?',
    'Define differentiation.',
    'What are signs of lower differentiation? Name at least four.',
  ],
  ['What is the Sacrament?', 'What is sex, according to the presentation?', 'How is sex like a sacrament?'],
  [
    'What does sex renew, according to the comparison table?',
    'What does the Sacrament renew?',
    'What is the realignment of will in the Sacrament?',
    'What is the realignment of will in sex?',
  ],
  [
    'What is "turn toward"?',
    'What is "turn away"?',
    'What is "turn against"?',
    'What are fuzzy bids?',
    'What is a soft start-up?',
  ],
  [
    'What is the standard (male) model of sexual orientation?',
    'What is the new fluid model of sexual orientation?',
    'How does male attraction change over time?',
    'What percentage of non-exclusively heterosexual women are fluid?',
  ],
  [
    'ESSAY PART 1: Sexual attraction is complicated for a small percentage of people — key points?',
    'ESSAY PART 2: Sexual feelings ebb and flow overall and in relationships — key points?',
    'ESSAY PART 3: Sexual behaviors flood our brains with hormones that can solidify preferences — key points?',
    'ESSAY PART 4: We are judged by our behaviors and intentions — key points?',
  ],
];
