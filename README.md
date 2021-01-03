# NOTE:

This is mainly here for safekeeping.
I don't expect anyone to take interest in this and the project can go in _'no maintenance mode'_ at any time.

# WHAT IS THIS ABOUT ?

I got tired of stuff for learning Chinese online that would not provide the following:
 - support for zhuyin input
 - focus on both words and sentences in context
 - made to build vocabulary
 - allow you to learn the characters. I mean, there are a ton of similar-looking characters, but most existing stuff don't bother making you _understand_ the characters.
 - would not be exploitable by simply guessing stuff unrelated to the word / ... I want the easy solution to be learning the word, not find how to exploit how the exercise works.
 - where I can just do one quick round without any issues, without loosing progress
 - fair. I mistype a ton, and I want to be able to correct myself if I made a mistake before being presented with the result

# WHAT ARE THE ISSUES

**I has been made for me.** It's a horrible, non-standard **bash script** with some strange requirements.
It requires (and heavily rely on) an internet connection.
It requires non-standard tools, namely:
 - **xmllint** : xml / html stuff
 - **jq** : json xpath
 - **opencc** : simplified -> traditional conversion

The goal of this project is literally _it works on my machine_.

And optionally (although you'll miss on a few things) : `gcloud`
(for the TTS stuff. You'll also need a project to be setup (that's free) and the private key to be put in `~/.learnzh/gcloud-auth.json`.
If anyone has a better Chinese TTS that does not require a google account and is free, please let me know.
If anyone read this, that is.)
It would be possible/very easy to add support for different TTS backends, but so far I haven't found one that is as good as what gcloud provides.
(installing gcloud on your machine does not require a root access tho, and all the queries are done through curl).

TTS. If you don't like it, then don't, that's fine.

My grammar. The english in there is probably borked 'cause I can't be bothered.
(The interface english, which is inconsistent at best. The content english is good because not mine).

It's also fully focused on traditional chinese (zhuyin + trad characters). I may consider adding support for other languages. Maybe.

The name of this project is awful and I don't feel bad.

# WHAT ARE THE NICE FEATURES

The setup is automated.
To setup everything, simply run `./learnzh make_db` and a after a few seconds, everything will be setup and ready to go !

The code is somewhat clean.
It's a mess (which is ironic to have right after saying that the code was clean), I use very bad shell constructs, but there are files for the different parts of the tool.
(and stuff could be re-used for other projects).

Everything is automated (or at least try to be). There's a few hardcoded stuff in the wiktionary scrapper, but what scrapper does not have that ?
(The scrapper is based on the source of the page, not the generated html).

The core is based on prig. Prig is cool. This means:
 - CONFIGURATION. Like. A ton of stuff. And it's easy to extend, really easy.
 - Automatic `help` and `--help` based on reflection(??)
 - Nice arg parsing.

# WHAT ARE THE NICE FEATURES ABOUT THE STUFF THIS THING IS SUPPOSED TO DO

Currently:
 - Learning phase based on an occurrence list from movie subtitles (`learnzh learn`) and forced learning phase for a word (`learnzh learn_word 東西`)
 - Sentences related to the existing vocabulary you've learned. Words that the user may not know are allowed, up to a limit (configurable). This is mostly _'you hear a sentence that contains words you know, type it back'_, with the english translation if the user failed twice. At the end, a break-up of the sentence is provided with a definition for each words.
 - A few exercises are implemented (most of them to build-up your knowledge of the words, chinese -> english, english -> chinese, chinese -> zhuyin and some variations)
 - Word definition lookup, and matching definition search (like a reverse search? But it's not really polished. At all).
 - For the `test` mode (the default mode really), a few sorting modes are available (and configurable), and the system alternate between them (configurable) to provide the best coverage

# WHAT IS MISSING

Polish. (not the language).

# WHAT FOR THE FUTURE

Dunno.

# DO I SPEAK / READ-WRITE / UNDERSTAND CHINESE

Probably never / worse than a 5 years old / worse than a 2 years old.

# DO I UNDER/OVERESTIMATE HOW YOUNG CHILDREN ARE?

Yup.

# HAS THIS README OVERSTAYED ITS WELCOME ?

Absolutely.
