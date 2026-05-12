-- Add more countries needed for expanded WWII events
INSERT INTO countries (code, name_en, name_he, lat, lng, flag_url) VALUES
  ('FRA', 'France',         'צרפת',          48.856613,   2.352222, 'https://flagcdn.com/fr.svg'),
  ('RUS', 'Soviet Union',   'ברית המועצות',  55.750446,  37.617300, 'https://flagcdn.com/ru.svg'),
  ('NOR', 'Norway',         'נורווגיה',       59.913869,  10.752245, 'https://flagcdn.com/no.svg'),
  ('GRC', 'Greece',         'יוון',           37.983810,  23.727539, 'https://flagcdn.com/gr.svg'),
  ('ITA', 'Italy',          'איטליה',         41.902782,  12.496366, 'https://flagcdn.com/it.svg')
ON CONFLICT (code) DO NOTHING;

-- Insert new events only if they do not already exist (safe for re-runs)
INSERT INTO events (title_en, title_he, start_date, end_date, description_en, description_he, country_id)
SELECT title_en, title_he, start_date::date, end_date::date, description_en, description_he,
       (SELECT id FROM countries WHERE code = country_code)
FROM (VALUES
  ('Fall of France',
   'נפילת צרפת',
   '1940-05-10', '1940-06-25',
   'Germany launched a rapid offensive through the Ardennes, bypassing the Maginot Line. France fell in six weeks, leading to the German occupation and the establishment of Vichy France.',
   'גרמניה פתחה במתקפה מהירה דרך הארדן, עקפה את קו מז''ינו. צרפת נפלה תוך שישה שבועות ונוצרה צרפת הממשלת וישי.',
   'FRA'),

  ('Battle of Britain',
   'קרב בריטניה',
   '1940-07-10', '1940-10-31',
   'The Luftwaffe waged an intensive air campaign against Britain. The RAF''s successful defence marked the first major German military defeat of the war and ended Hitler''s plans for invasion.',
   'הלופטוואפה פתחה במסע אוויר אינטנסיבי נגד בריטניה. ההגנה המוצלחת של חיל האוויר המלכותי סימנה את הכישלון הצבאי הגרמני הגדול הראשון.',
   'GBR'),

  ('Operation Barbarossa',
   'מבצע ברברוסה',
   '1941-06-22', '1941-12-05',
   'Germany launched the largest military invasion in history against the Soviet Union, deploying over three million troops along a 2,900 km front. The campaign opened the Eastern Front.',
   'גרמניה פתחה בפלישה הצבאית הגדולה ביותר בהיסטוריה נגד ברית המועצות, עם למעלה משלושה מיליון חיילים לאורך חזית של 2,900 ק"מ.',
   'RUS'),

  ('Battle of Stalingrad',
   'קרב סטלינגרד',
   '1942-08-23', '1943-02-02',
   'The battle for the Soviet city of Stalingrad was one of the bloodiest in history. The German 6th Army was encircled and destroyed, marking a decisive turning point on the Eastern Front.',
   'הקרב על העיר הסובייטית סטלינגרד היה אחד הקרבות הדמים ביותר בהיסטוריה. הצבא הגרמני השישי הוקף והושמד, וסימן נקודת מפנה מכרעת.',
   'RUS'),

  ('Liberation of Rome',
   'שחרור רומא',
   '1944-06-04', NULL,
   'Allied forces entered Rome, making it the first Axis capital to fall to the Allies. The city was declared an open city, sparing it from the destruction of battle.',
   'כוחות בעלות הברית נכנסו לרומא, מה שהפך אותה לבירת מדינות הציר הראשונה שנפלה בידי בעלות הברית.',
   'ITA'),

  ('VE Day — Victory in Europe',
   'יום הניצחון — הניצחון באירופה',
   '1945-05-08', NULL,
   'Germany signed the unconditional surrender document, ending World War II in Europe. Celebrations erupted across Allied nations as Nazi Germany officially ceased to exist as a political entity.',
   'גרמניה חתמה על מסמך הכניעה הבלתי מותנית, ובכך הסתיימה מלחמת העולם השנייה באירופה. חגיגות פרצו ברחבי מדינות בעלות הברית.',
   'GBR')
) AS new_events(title_en, title_he, start_date, end_date, description_en, description_he, country_code)
WHERE NOT EXISTS (
  SELECT 1 FROM events WHERE events.title_en = new_events.title_en
);
