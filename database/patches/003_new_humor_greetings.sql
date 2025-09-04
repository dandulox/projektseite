-- Patch 003: Neue humorvolle Greetings
-- Erstellt: $(date)
-- Beschreibung: Ersetzt alte Greetings durch neue humorvolle Versionen

-- Lösche alle alten Greetings
DELETE FROM greetings;

-- Morgens 🌅 (ca. 5–11 Uhr)
INSERT INTO greetings (text, time_period, hour, is_active) VALUES
('Guten Morgen! Zeit, motiviert zu wirken… mehr wollen wir ja gar nicht.', 'morning', NULL, true),
('Willkommen im Level ‚Ich tue so, als wäre ich wach‘. 🛌', 'morning', NULL, true),
('Kaffee ist fertig. Motivation… noch nicht. ☕', 'morning', NULL, true),
('Dein Projekt wartet schon – genau wie dein Bett. 😏', 'morning', NULL, true),
('Heute ist der perfekte Tag, um Dinge zu erledigen, die du gestern schon verschoben hast.', 'morning', NULL, true);

-- Mittags 🥪 (ca. 11–16 Uhr)
INSERT INTO greetings (text, time_period, hour, is_active) VALUES
('Mittag! Endlich die Deadline, die wirklich jeder einhält. 🍽️', 'afternoon', NULL, true),
('Der Körper will essen, das Projekt will Fortschritt – eins von beiden gewinnt.', 'afternoon', NULL, true),
('Willkommen im Mittagskoma. Gehirn lädt… bitte warten. 💤', 'afternoon', NULL, true),
('Perfekte Zeit, um To-Dos auf morgen zu verschieben.', 'afternoon', NULL, true),
('Snack-Pause? Klar. Das Projekt kann warten. Wie immer. 🍪', 'afternoon', NULL, true);

-- Abends 🌇 (ca. 16–22 Uhr)
INSERT INTO greetings (text, time_period, hour, is_active) VALUES
('Abend! Offiziell Feierabend, inoffiziell Panik, weil nichts fertig ist. 🫠', 'evening', NULL, true),
('Heute viel geschafft… also zumindest auf Netflix. 📺', 'evening', NULL, true),
('Perfekte Zeit, Projekte ‚nur noch kurz‘ zu machen. Spoiler: Es wird Mitternacht.', 'evening', NULL, true),
('Deine To-Do-Liste lacht dich aus. Laut. 📜', 'evening', NULL, true),
('Motivation offline. Snacks online. 🍫', 'evening', NULL, true);

-- Nachts 🌙 (ca. 22–5 Uhr)
INSERT INTO greetings (text, time_period, hour, is_active) VALUES
('Mitternacht. Entweder Genie oder Wahnsinn – wir entscheiden später.', 'night', NULL, true),
('Nachtschicht? Respekt. Oder Existenzkrise? 😅', 'night', NULL, true),
('Alle schlafen, nur du trackst Projekte… und überlegst deine Lebensentscheidungen.', 'night', NULL, true),
('Es gibt zwei Arten von Menschen: die, die jetzt schlafen – und dich. 🦉', 'night', NULL, true),
('Die beste Zeit, um Projekte zu machen. Oder das Leben neu zu überdenken.', 'night', NULL, true);

-- Kommentar hinzufügen
COMMENT ON TABLE greetings IS 'Humorvolle Begrüßungen für verschiedene Tageszeiten - Fun-Feature';
